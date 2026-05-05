import { useEffect, useState } from "react";
import { Clock, ExternalLink, Loader2, Trash2, Edit2, Save, X } from "lucide-react";
import { Link } from "react-router-dom";

interface HistoryItem {
  id: number;
  restaurant_id: number;
  restaurant_name: string;
  visit_date: string;
  comment: string;
  rating: number;
  image_url: string;
}

export default function History() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user) {
      window.location.href = "/login";
      return;
    }

    fetchHistory(user.id);
  }, []);

  const fetchHistory = (userId: number) => {
    fetch(`/api/history/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistoryItems(data);
        } else {
          setHistoryItems([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleEditClick = (item: HistoryItem) => {
    setEditingId(item.id);
    setEditRating(item.rating);
    setEditComment(item.comment);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editRating, comment: editComment })
      });
      if (res.ok) {
        setHistoryItems(prev => prev.map(item => 
          item.id === id ? { ...item, rating: editRating, comment: editComment } : item
        ));
        setEditingId(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistoryItems(prev => prev.filter(item => item.id !== id));
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

  return (
    <div className="max-w-4xl mx-auto px-8 md:px-12 py-12">
      <div className="flex justify-between items-end mb-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-primary-container tracking-tighter">Visit History</h1>
          <p className="text-zinc-500">Keep track of your campus culinary journey.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-primary-container font-bold text-sm bg-primary-container/5 px-4 py-2 rounded-full">
          <Clock className="w-4 h-4" />
          <span>Last visit: {historyItems.length > 0 ? new Date(historyItems[0].visit_date).toLocaleDateString() : "No visits"}</span>
        </div>
      </div>

      <div className="space-y-6">
        {historyItems.map((item) => (
          <div key={item.id} className="clean-card rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 group">
            <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0">
              <img className="w-full h-full object-cover transition-transform group-hover:scale-110" src={item.image_url} alt={item.restaurant_name} />
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-primary-container">{item.restaurant_name}</h3>
                {editingId !== item.id && <span className="font-mono font-bold text-zinc-900">{item.rating}/5 Stars</span>}
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500 mb-6 font-medium">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Visited
                </span>
                <span>•</span>
                <span>{new Date(item.visit_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              
              {editingId === item.id ? (
                <div className="space-y-3 mb-4">
                  <select 
                    value={editRating} 
                    onChange={e => setEditRating(Number(e.target.value))}
                    className="p-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-bold"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                  <textarea
                    value={editComment}
                    onChange={e => setEditComment(e.target.value)}
                    className="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(item.id)} className="px-4 py-2 bg-primary-container text-white rounded-lg text-xs font-bold flex items-center gap-1">
                      <Save className="w-3 h-3" /> Save
                    </button>
                    <button onClick={handleCancelEdit} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold flex items-center gap-1">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 mb-6 italic">"{item.comment}"</p>
              )}

              {editingId !== item.id && (
                <div className="flex flex-wrap items-center gap-4">
                  <button onClick={() => handleEditClick(item)} className="text-xs font-bold uppercase tracking-widest text-primary-container hover:underline underline-offset-4 flex items-center gap-1 transition-all">
                    <Edit2 className="w-3 h-3" /> Edit Review
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs font-bold uppercase tracking-widest text-red-500 hover:underline underline-offset-4 flex items-center gap-1 transition-all">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  <Link to={`/venue/${item.restaurant_id}`} className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center gap-1 transition-all ml-auto">
                    View Detail <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {historyItems.length === 0 && (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-zinc-200" />
          </div>
          <h3 className="text-xl font-bold text-zinc-400">No visits recorded yet</h3>
          <p className="text-zinc-400 text-sm mt-2">Start exploring the campus dining spots!</p>
          <Link to="/" className="inline-block mt-8 px-8 py-3 bg-primary-container text-white rounded-full font-bold transition-all active:scale-95 shadow-sm">
            Discover Now
          </Link>
        </div>
      )}
    </div>
  );
}
