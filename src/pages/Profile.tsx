import React, { useEffect, useState } from "react";
import { LogOut, MapPin, Star, Bookmark, Settings, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface UserProfile {
  username: string;
  full_name: string;
  bio: string;
  is_premium: boolean;
  reviewsCount: number;
  savedCount: number;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [savedVenues, setSavedVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", bio: "" });

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
          setEditForm({ full_name: profileData.full_name, bio: profileData.bio });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-container" />
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { label: "Reviews", value: user.reviewsCount, icon: <Star className="w-4 h-4" /> },
    { label: "Saved", value: savedVenues.length, icon: <Bookmark className="w-4 h-4" /> },
    { label: "Badges", value: "5", icon: <MapPin className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-4xl mx-auto px-8 md:px-12 py-12">
      <div className="clean-card rounded-2xl md:rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-zinc-50 shadow-md overflow-hidden bg-white">
            <img 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
              alt={user.full_name}
            />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
              {isEditing ? (
                <input 
                  className="text-3xl font-extrabold text-primary-container tracking-tight bg-zinc-50 border-b border-primary-container outline-none w-full md:w-auto"
                  value={editForm.full_name}
                  onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                />
              ) : (
                <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">{user.full_name}</h2>
              )}
              {user.is_premium && (
                <span className="inline-flex items-center self-center md:self-auto px-3 py-1 rounded-full bg-primary-container text-white text-[10px] font-bold uppercase tracking-wider">
                  Premium Member
                </span>
              )}
            </div>
            {isEditing ? (
              <textarea 
                className="text-zinc-500 text-lg mb-6 leading-relaxed w-full p-2 bg-zinc-50 border rounded-lg outline-none"
                value={editForm.bio}
                onChange={e => setEditForm({...editForm, bio: e.target.value})}
              />
            ) : (
              <p className="text-zinc-500 text-lg mb-6 leading-relaxed max-w-xl">
                {user.bio}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
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
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-primary-container flex items-center gap-2">
          <Bookmark className="w-5 h-5" /> Saved Spots
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {savedVenues.map(venue => (
            <Link to={`/venue/${venue.id}`} key={venue.id} className="clean-card p-4 rounded-xl flex items-center gap-4 group">
              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-zinc-900 line-clamp-1">{venue.name}</h4>
                <p className="text-xs text-zinc-500 mb-2">{venue.type}</p>
                <span className="font-mono text-xs font-bold text-primary-container">{venue.price_range?.replace('$', '₱')}</span>
              </div>
            </Link>
          ))}
          {savedVenues.length === 0 && <p className="text-zinc-400 text-sm italic">You haven't saved any spots yet. Start exploring!</p>}
        </div>
      </div>
    </div>
  );
}
