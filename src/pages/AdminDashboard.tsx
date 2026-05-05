import React, { useEffect, useState } from "react";
import { Check, X, Shield, Clock, MapPin, Tag, Loader2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Submission {
  id: number;
  venue_name: string;
  category: string;
  location: string;
  price_range: string;
  description: string;
  submitter: string;
  submitted_at: string;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Simple admin check: if username is 'admin' or if you want to use a specific ID
    if (!user || (user.username !== 'admin' && user.id !== 1)) {
      navigate("/");
      return;
    }

    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'accepted' | 'rejected') => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/approve/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-container" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 md:px-12 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-zinc-900 rounded-2xl text-white shadow-xl">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-primary-container tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-500 font-medium">Review and approve student submissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {submissions.map((sub) => (
          <div key={sub.id} className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8 flex flex-col lg:flex-row gap-8 hover:border-primary-container/20 transition-all">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-zinc-100 text-[10px] uppercase font-black tracking-widest text-zinc-500">{sub.category}</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Submitted by: <span className="text-zinc-900">{sub.submitter}</span></span>
              </div>
              
              <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">{sub.venue_name}</h2>
              
              <div className="flex flex-wrap gap-6 text-sm font-bold text-zinc-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-container" />
                  {sub.location}
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-500" />
                  {sub.price_range.replace('$', '₱')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  {new Date(sub.submitted_at).toLocaleDateString()}
                </div>
              </div>

              <p className="text-zinc-500 leading-relaxed italic border-l-4 border-zinc-100 pl-6 py-2">
                "{sub.description}"
              </p>
            </div>

            <div className="lg:w-48 flex lg:flex-col gap-3">
              <button 
                disabled={processing !== null}
                onClick={() => handleAction(sub.id, 'accepted')}
                className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {processing === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approve
              </button>
              <button 
                disabled={processing !== null}
                onClick={() => handleAction(sub.id, 'rejected')}
                className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
            <Info className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400">All caught up!</h3>
            <p className="text-zinc-400 text-sm mt-2 font-medium">No pending submissions to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
