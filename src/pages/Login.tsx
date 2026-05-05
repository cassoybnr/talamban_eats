import React, { useState } from "react";
import { User, Lock, Loader2, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = "/catalogue";
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-100 p-8 md:p-12">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-primary-container/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-primary-container" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary-container tracking-tight">Welcome Back</h1>
          <p className="text-zinc-500 mt-2 font-medium">Log in to your TalambanEats account</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary-container transition-colors" />
              <input 
                required
                className="w-full bg-zinc-50 border-none rounded-xl p-4 pl-12 text-zinc-900 font-bold focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                placeholder="Enter your username"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary-container transition-colors" />
              <input 
                required
                type="password"
                className="w-full bg-zinc-50 border-none rounded-xl p-4 pl-12 text-zinc-900 font-bold focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-5 bg-primary-container text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-primary-container/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-bold text-zinc-400">
          First time here? <Link to="/register" className="text-primary-container hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
