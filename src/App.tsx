import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Catalogue from "./pages/Catalogue";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Suggest from "./pages/Suggest";
import VenueDetails from "./pages/VenueDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import { User, LogOut, PlusCircle, Search, Shield } from "lucide-react";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 w-full z-50 border-b bg-white/90 backdrop-blur-md border-zinc-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center px-8 md:px-12 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-xl font-extrabold text-primary-container flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-container/20">
              T
            </div>
            TalambanEats
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 font-bold tracking-tight">
            <Link 
              to="/catalogue" 
              className={`${location.pathname === '/catalogue' || location.pathname === '/' ? 'text-primary-container border-b-2 border-primary-container pb-1' : 'text-zinc-400 hover:text-zinc-600'} transition-colors`}
            >
              Explore
            </Link>
            <Link 
              to="/history" 
              className={`${location.pathname === '/history' ? 'text-primary-container border-b-2 border-primary-container pb-1' : 'text-zinc-400 hover:text-zinc-600'} transition-colors`}
            >
              History
            </Link>
            {Boolean(user?.is_premium) && (
              <Link 
                to="/admin" 
                className={`${location.pathname === '/admin' ? 'text-primary-container border-b-2 border-primary-container pb-1' : 'text-zinc-400 hover:text-zinc-600'} transition-colors flex items-center gap-1`}
              >
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            <Link 
              to="/profile" 
              className={`${location.pathname === '/profile' ? 'text-primary-container border-b-2 border-primary-container pb-1' : 'text-zinc-400 hover:text-zinc-600'} transition-colors`}
            >
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/suggest" className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-primary-container text-white rounded-full hover:bg-opacity-90 transition-all active:scale-95 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-container/20">
                  <PlusCircle className="w-4 h-4" />
                  Suggest
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-zinc-50 rounded-xl transition-all active:scale-95 text-zinc-400 hover:text-red-500"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-8 py-2.5 bg-primary-container text-white rounded-full hover:opacity-90 transition-all font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary-container/20">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="w-full mt-16 border-t border-zinc-100 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 gap-6 max-w-7xl mx-auto">
          <div className="text-[10px] uppercase tracking-[0.3em] font-black text-primary-container">
            © 2026 University of San Carlos - Talamban Campus
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] font-black">
            <a className="text-zinc-400 hover:text-zinc-900 transition-colors" href="#">Privacy</a>
            <a className="text-zinc-400 hover:text-zinc-900 transition-colors" href="#">Terms</a>
            <a className="text-zinc-400 hover:text-primary-container transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Catalogue />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/suggest" element={<Suggest />} />
          <Route path="/venue/:id" element={<VenueDetails />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
