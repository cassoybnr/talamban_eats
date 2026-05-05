-- USC Dining Database Schema

-- User Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    bio TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant/Dining Spot Table
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'Cafe', 'Carinderia', 'Fast Food', 'Resto', 'Snack Bar'
    price_range VARCHAR(5) NOT NULL, -- e.g., '$', '$$', '$$$'
    location VARCHAR(255) NOT NULL,
    description TEXT,
    operating_hours VARCHAR(100),
    image_url TEXT,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Saved Places / Bookmarks Table
CREATE TABLE IF NOT EXISTS saved_places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    venue_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    price_range VARCHAR(5) NOT NULL,
    description TEXT,
    status ENUM('pending', 'under_review', 'accepted', 'rejected') DEFAULT 'pending',
    rejection_feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
