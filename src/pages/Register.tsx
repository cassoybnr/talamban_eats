import React, { useState } from "react";
import { User, Lock, Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    course: "BS Information Technology"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-8 text-center">
        <div className="space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto text-emerald-500 shadow-sm border border-emerald-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-primary-container tracking-tight">Account Created!</h1>
          <p className="text-zinc-500 font-medium max-w-sm mx-auto">Redirecting you to login... Get ready to explore the best campus hotspots.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-8 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-50 p-8 md:p-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-primary-container tracking-tight">Join TalambanEats</h1>
          <p className="text-zinc-500 mt-2 font-medium text-sm">Discover and share campus gems with fellow Carolinians</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">Full Name</label>
            <input 
              required
              className="w-full bg-zinc-50 border-none rounded-xl p-4 text-zinc-900 font-bold focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
              placeholder="Julian S. Arnaiz"
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
              <input 
                required
                className="w-full bg-zinc-50 border-none rounded-xl p-4 pl-12 text-zinc-900 font-bold focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                placeholder="j_arnaiz"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
              <input 
                required
                type="email"
                className="w-full bg-zinc-50 border-none rounded-xl p-4 pl-12 text-zinc-900 font-bold focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                placeholder="id@usc.edu.ph"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">Course / Program</label>
            <div className="relative">
              <input 
                required
                className="w-full bg-zinc-50 border-none rounded-xl p-4 text-zinc-900 font-bold focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                placeholder="Ex. BS Information Technology"
                value={formData.course}
                onChange={e => setFormData({...formData, course: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
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
            className="w-full py-5 bg-primary-container text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-primary-container/20 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-bold text-zinc-400">
          Already have an account? <Link to="/login" className="text-primary-container hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
