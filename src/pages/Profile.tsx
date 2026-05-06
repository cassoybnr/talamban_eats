import React, { useEffect, useState } from "react";
import { LogOut, MapPin, Star, Bookmark, Settings, Loader2, Info, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface SubmissionStatus {
  id: number;
  venue_name: string;
  status: string;
  rejection_feedback: string | null;
  submitted_at: string;
}

interface UserProfile {
  username: string;
  full_name: string;
  bio: string;
  course: string;
  is_premium: boolean;
  reviewsCount: number;
  savedCount: number;
  submissions: SubmissionStatus[];
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [savedVenues, setSavedVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", bio: "", course: "" });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const sessionUser = userStr ? JSON.parse(userStr) : null;
    
    if (!sessionUser) {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await fetch(`/api/profile/${sessionUser.id}`);
        const profileData = await profileRes.json();
        if (profileData && !profileData.error) {
          setUser(profileData);
          setEditForm({ full_name: profileData.full_name || "", bio: profileData.bio || "", course: profileData.course || "" });
          
          // Also update session cache just in case premium status changed
          if (profileData.is_premium !== sessionUser.is_premium) {
             localStorage.setItem("user", JSON.stringify({...sessionUser, is_premium: profileData.is_premium}));
          }
        }

        const savedRes = await fetch(`/api/bookmarks/${sessionUser.id}`);
        const savedData = await savedRes.json();
        setSavedVenues(Array.isArray(savedData) ? savedData : []);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem("user");
    const sessionUser = userStr ? JSON.parse(userStr) : null;
    if (!sessionUser) return;

    try {
      const res = await fetch(`/api/profile/${sessionUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setUser(prev => prev ? { ...prev, ...editForm } : null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "US";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-container" />
      </div>
    );
  }

  if (!user) return null;

  const approvedCount = user.submissions?.filter(s => s.status === 'accepted').length || 0;
  
  // Calculate badges dynamically
  const earnedBadges = [];
  earnedBadges.push("Early Adopter"); // default
  if (approvedCount > 0) earnedBadges.push(`Founder Level ${Math.min(approvedCount, 3)}`);
  if (user.reviewsCount >= 5) earnedBadges.push("Local Critic");

  const stats = [
    { label: "Reviews", value: user.reviewsCount, icon: <Star className="w-4 h-4" /> },
    { label: "Saved", value: savedVenues.length, icon: <Bookmark className="w-4 h-4" /> },
    { label: "Badges", value: earnedBadges.length, icon: <MapPin className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-4xl mx-auto px-8 md:px-12 py-12">
      <div className="clean-card rounded-2xl md:rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-zinc-50 shadow-md flex items-center justify-center bg-primary-container text-white text-5xl font-black shrink-0">
            {getInitials(user.full_name)}
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              {isEditing ? (
                <input 
                  className="text-3xl font-extrabold text-primary-container tracking-tight bg-zinc-50 border-b border-primary-container outline-none w-full md:w-auto p-2"
                  value={editForm.full_name}
                  onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                />
              ) : (
                <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">{user.full_name}</h2>
              )}
              {user.is_premium && (
                <span className="inline-flex items-center self-center md:self-auto px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                  Admin / Premium
                </span>
              )}
            </div>
            
            {isEditing ? (
              <input 
                className="text-sm font-bold text-zinc-500 mb-4 bg-zinc-50 border-b outline-none w-full p-2 block"
                placeholder="Course / Program"
                value={editForm.course}
                onChange={e => setEditForm({...editForm, course: e.target.value})}
              />
            ) : (
              user.course && <p className="text-sm font-bold text-zinc-400 mb-4 tracking-wide uppercase">{user.course}</p>
            )}

            {isEditing ? (
              <textarea 
                className="text-zinc-500 text-lg mb-6 leading-relaxed w-full p-2 bg-zinc-50 border rounded-lg outline-none resize-none"
                value={editForm.bio}
                rows={3}
                placeholder="Write a bio..."
                onChange={e => setEditForm({...editForm, bio: e.target.value})}
              />
            ) : (
              <p className="text-zinc-500 text-lg mb-6 leading-relaxed max-w-xl">
                {user.bio || "No bio added yet."}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-zinc-50 text-primary-container border border-zinc-100">
                    {stat.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-tight">{stat.value}</span>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest leading-tight">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all active:scale-[0.98] border ${isEditing ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'}`}
        >
          <Settings className="w-5 h-5" />
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
        {isEditing && (
          <button 
            onClick={handleUpdateProfile}
            className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary-container text-white font-bold hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Save Changes
          </button>
        )}
        <button 
          onClick={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
          className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all active:scale-[0.98] bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      {/* Suggested Spots Tracker */}
      <div className="space-y-6 mb-16">
        <h3 className="text-2xl font-bold text-primary-container flex items-center gap-2">
          <Info className="w-5 h-5" /> Suggested Spots Tracker
        </h3>
        
        {(!user.submissions || user.submissions.length === 0) ? (
          <p className="text-zinc-400 text-sm italic">You haven't suggested any spots yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {user.submissions.map(sub => (
              <div key={sub.id} className="clean-card p-6 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-zinc-900 text-lg">{sub.venue_name}</h4>
                  {sub.status === 'pending' && <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 bg-amber-50 text-amber-600 rounded-full"><Clock className="w-3 h-3"/> Pending</span>}
                  {sub.status === 'accepted' && <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full"><CheckCircle2 className="w-3 h-3"/> Approved</span>}
                  {sub.status === 'rejected' && <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 bg-red-50 text-red-600 rounded-full"><XCircle className="w-3 h-3"/> Rejected</span>}
                </div>
                <p className="text-xs text-zinc-400 font-medium">Submitted on {new Date(sub.submitted_at).toLocaleDateString()}</p>
                
                {sub.status === 'rejected' && sub.rejection_feedback && (
                  <div className="mt-2 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                    <p className="text-xs font-bold text-red-800 mb-1">Reason for Rejection:</p>
                    <p className="text-sm text-red-600">{sub.rejection_feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-primary-container flex items-center gap-2">
            <Bookmark className="w-5 h-5" /> Saved Spots
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {savedVenues.map(venue => (
              <Link to={`/venue/${venue.id}`} key={venue.id} className="clean-card p-4 rounded-xl flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-zinc-900 line-clamp-1">{venue.name}</h4>
                  <p className="text-xs text-zinc-500 mb-1">{venue.type}</p>
                  <span className="font-mono text-xs font-bold text-primary-container">{venue.price_range?.replace('$', '₱')}</span>
                </div>
              </Link>
            ))}
            {savedVenues.length === 0 && <p className="text-zinc-400 text-sm italic">No saved spots yet.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-primary-container flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Badges History
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {earnedBadges.map((badge, idx) => (
              <div key={idx} className="clean-card p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-amber-500">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">{badge}</h4>
                  <p className="text-xs text-zinc-500">Achieved for your contributions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
