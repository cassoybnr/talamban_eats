import { Sparkles, Send, MapPin, BadgePercent, Info, Loader2 } from "lucide-react";
import React, { useState } from "react";

export default function Suggest() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    venue_name: "",
    category: "Cafe",
    location: "",
    price_range: "₱₱",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user) {
      alert("Please log in to submit a suggestion");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, user_id: user.id })
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({
          venue_name: "",
          category: "Cafe",
          location: "",
          price_range: "₱₱",
          description: ""
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 md:px-12 py-12">
      <div className="flex flex-col gap-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit border border-amber-100">
          <Sparkles className="w-3 h-3" />
          Community Powered
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-container tracking-tighter">Suggest a Venue</h1>
        <p className="text-zinc-500 text-lg max-w-xl">Help your fellow Carolinians discover new dining experiences. Every approved submission earns you a <span className="text-primary-container font-bold underline underline-offset-4 decoration-primary-container/30">Founder Badge</span>.</p>
      </div>

      {success && (
        <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-bold flex items-center justify-between">
          <span>Your suggestion has been submitted successfully!</span>
          <button onClick={() => setSuccess(false)} className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      <div className="clean-card rounded-2xl p-8 md:p-12">
        <form className="space-y-10" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-3 group">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 group-focus-within:text-primary-container transition-colors">Venue Name</label>
              <input 
                required
                value={formData.venue_name}
                onChange={e => setFormData({ ...formData, venue_name: e.target.value })}
                className="w-full bg-zinc-50 border-none rounded-xl p-4 text-zinc-900 font-bold focus:ring-2 focus:ring-primary-container/20 transition-all placeholder:text-zinc-200" 
                placeholder="Ex. Silogan ni Gian" 
                type="text" 
              />
            </div>
            
            <div className="flex flex-col gap-3 group">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 group-focus-within:text-primary-container transition-colors">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-zinc-50 border-none rounded-xl p-4 text-zinc-900 font-bold focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none cursor-pointer"
              >
                <option>Cafe</option>
                <option>Carinderia</option>
                <option>Fast Food</option>
                <option>Resto</option>
                <option>Snack Bar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-3 group">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 group-focus-within:text-primary-container transition-colors">Location / Feature</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                <input 
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-zinc-50 border-none rounded-xl p-4 pl-12 text-zinc-900 font-bold focus:ring-2 focus:ring-primary-container/20 transition-all placeholder:text-zinc-200" 
                  placeholder="Ex. Gate 3 Road" 
                  type="text" 
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3 group">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 group-focus-within:text-primary-container transition-colors">Price Range</label>
              <div className="relative">
                <BadgePercent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                <select 
                  value={formData.price_range}
                  onChange={e => setFormData({ ...formData, price_range: e.target.value })}
                  className="w-full bg-zinc-50 border-none rounded-xl p-4 pl-12 text-zinc-900 font-bold focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="₱">₱ (Under ₱100)</option>
                  <option value="₱₱">₱₱ (₱100 - ₱300)</option>
                  <option value="₱₱₱">₱₱₱ (₱300+)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 group">
            <label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 group-focus-within:text-primary-container transition-colors">Description / Why you love it</label>
            <textarea 
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full bg-zinc-50 border-none rounded-xl p-6 text-zinc-900 font-medium focus:ring-2 focus:ring-primary-container/20 transition-all placeholder:text-zinc-200 resize-none outline-none" 
              placeholder="Tell us what makes this place special..."
            ></textarea>
          </div>

          <div className="pt-6">
            <button 
              disabled={loading}
              className="w-full py-5 px-8 bg-primary-container text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-[0.99] shadow-lg shadow-primary-container/10 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? "Submitting..." : "Submit for Review"}
            </button>
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-[0.2em] text-center mt-6 flex items-center justify-center gap-2">
              <Info className="w-3 h-3" />
              Submissions are typically reviewed within 24-48 hours
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
