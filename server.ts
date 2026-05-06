import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 's24100031_talambaneats',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// API Routes
app.get("/api/restaurants", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM restaurants WHERE 1=1';
    const params = [];
    
    if (category && category !== 'All Spots') {
      query += ' AND type = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR type LIKE ? OR description LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error: any) {
    console.error("DATABASE CONNECTION ERROR:", error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error("TIP: Ensure DB_HOST in your environment points to your remote database server, not 'localhost'.");
    }
    res.json([]);
  }
});

app.get("/api/restaurants/:id", async (req, res) => {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Restaurant not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Database error (restaurant details):", error);
    res.status(500).json({ error: "Failed to fetch restaurant details" });
  }
});

// Reviews API
app.get("/api/restaurants/:id/reviews", async (req, res) => {
  try {
    const query = `
      SELECT r.*, u.full_name, u.username 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.restaurant_id = ? 
      ORDER BY r.visit_date DESC
    `;
    const [rows] = await pool.execute(query, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});


app.put("/api/reviews/:id", async (req, res) => {
  const { rating, comment } = req.body;
  try {
    await pool.execute('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?', [rating, comment, req.params.id]);
    
    const [reviewRows]: any = await pool.execute('SELECT restaurant_id FROM reviews WHERE id = ?', [req.params.id]);
    if (reviewRows.length > 0) {
      const restaurant_id = reviewRows[0].restaurant_id;
      await pool.execute(
        'UPDATE restaurants SET rating = IFNULL((SELECT AVG(rating) FROM reviews WHERE restaurant_id = ?), 0.0), review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?) WHERE id = ?',
        [restaurant_id, restaurant_id, restaurant_id]
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update review" });
  }
});

app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const [reviewRows]: any = await pool.execute('SELECT restaurant_id FROM reviews WHERE id = ?', [req.params.id]);
    const restaurant_id = reviewRows.length > 0 ? reviewRows[0].restaurant_id : null;

    await pool.execute('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    
    if (restaurant_id) {
      await pool.execute(
        'UPDATE restaurants SET rating = IFNULL((SELECT AVG(rating) FROM reviews WHERE restaurant_id = ?), 0.0), review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?) WHERE id = ?',
        [restaurant_id, restaurant_id, restaurant_id]
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

app.post("/api/reviews", async (req, res) => {
  const { user_id, restaurant_id, rating, comment } = req.body;
  try {
    await pool.execute(
      'INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id || 1, restaurant_id, rating, comment]
    );
    // Update restaurant rating/count
    await pool.execute(
      'UPDATE restaurants SET rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = ?), review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?) WHERE id = ?',
      [restaurant_id, restaurant_id, restaurant_id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to post review" });
  }
});

// Bookmarks API
app.get("/api/bookmarks/:userId", async (req, res) => {
  try {
    const query = `
      SELECT r.* 
      FROM restaurants r 
      JOIN saved_places s ON r.id = s.restaurant_id 
      WHERE s.user_id = ?
    `;
    const [rows] = await pool.execute(query, [req.params.userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

app.post("/api/bookmarks", async (req, res) => {
  const { user_id, restaurant_id } = req.body;
  try {
    const [existing]: any = await pool.execute('SELECT * FROM saved_places WHERE user_id = ? AND restaurant_id = ?', [user_id || 1, restaurant_id]);
    if (existing.length > 0) {
      await pool.execute('DELETE FROM saved_places WHERE user_id = ? AND restaurant_id = ?', [user_id || 1, restaurant_id]);
      res.json({ success: true, action: 'removed' });
    } else {
      await pool.execute('INSERT INTO saved_places (user_id, restaurant_id) VALUES (?, ?)', [user_id || 1, restaurant_id]);
      res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

app.get("/api/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [userRows]: any = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!userRows || userRows.length === 0) {
      return res.json({
        id: 1,
        username: "j_arnaiz",
        full_name: "Julian S. Arnaiz",
        bio: "Computer Science Student | Passionate about finding the best coffee spots around Talamban Campus.",
        is_premium: true,
        reviewsCount: 0,
        savedCount: 0
      });
    }
    
    const [reviewStats]: any = await pool.execute('SELECT COUNT(*) as count FROM reviews WHERE user_id = ?', [userId]);
    const [savedStats]: any = await pool.execute('SELECT COUNT(*) as count FROM saved_places WHERE user_id = ?', [userId]);
    const [submissions]: any = await pool.execute('SELECT id, venue_name, status, rejection_feedback, submitted_at FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC', [userId]);

    res.json({
      ...userRows[0],
      reviewsCount: reviewStats[0]?.count || 0,
      savedCount: savedStats[0]?.count || 0,
      submissions: submissions || []
    });
  } catch (error) {
    console.error("Database error (profile):", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.put("/api/profile/:userId", async (req, res) => {
  const { full_name, bio, course } = req.body;
  try {
    await pool.execute('UPDATE users SET full_name = ?, bio = ?, course = ? WHERE id = ?', [full_name, bio, course, req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.get("/api/history/:userId", async (req, res) => {
  try {
    const query = `
      SELECT r.*, res.name as restaurant_name, res.image_url 
      FROM reviews r 
      JOIN restaurants res ON r.restaurant_id = res.id 
      WHERE r.user_id = ? 
      ORDER BY r.visit_date DESC
    `;
    const [rows] = await pool.execute(query, [req.params.userId]);
    res.json(rows);
  } catch (error) {
    console.error("Database error (history):", error);
    res.json([]); // Return empty array to prevent frontend .map() crash
  }
});

app.post("/api/suggest", async (req, res) => {
  const { venue_name, category, location, price_range, description, user_id } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO submissions (user_id, venue_name, category, location, price_range, description) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id || 1, venue_name, category, location, price_range, description]
    );
    res.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit suggestion" });
  }
});

// Auth API
app.post("/api/register", async (req, res) => {
  const { username, password, email, full_name, course } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, email, full_name, course) VALUES (?, ?, ?, ?, ?)',
      [username, password, email, full_name, course || null]
    );
    res.json({ success: true, userId: (result as any).insertId });
  } catch (error: any) {
    console.error("REGISTER DB ERROR:", error);
    res.status(400).json({ error: error.code === 'ER_DUP_ENTRY' ? "Username or email already exists" : "Registration failed: " + error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows]: any = await pool.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Admin API
app.get("/api/admin/submissions", async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT s.*, u.username as submitter FROM submissions s JOIN users u ON s.user_id = u.id WHERE status = "pending"');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

app.post("/api/admin/approve/:id", async (req, res) => {
  const { action, feedback } = req.body; // action: 'accepted' or 'rejected'
  try {
    if (action === 'accepted') {
      const [submission]: any = await pool.execute('SELECT * FROM submissions WHERE id = ?', [req.params.id]);
      const s = submission[0];
      
      // Move to restaurants
      await pool.execute(
        'INSERT INTO restaurants (name, type, location, price_range, description) VALUES (?, ?, ?, ?, ?)',
        [s.venue_name, s.category, s.location, s.price_range, s.description]
      );
      
      await pool.execute('UPDATE submissions SET status = "accepted" WHERE id = ?', [req.params.id]);
    } else {
      await pool.execute('UPDATE submissions SET status = "rejected", rejection_feedback = ? WHERE id = ?', [feedback || "Does not meet requirements", req.params.id]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process submission" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
