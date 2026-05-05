import { useEffect, useState } from "react";
import { Clock, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface HistoryItem {
  id: number;
  restaurant_name: string;
  visit_date: string;
  comment: string;
  rating: number;
  image_url: string;
}

export default function History() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user) {
      window.location.href = "/login";
      return;
    }

    fetch(`/api/history/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistoryItems(data);
        } else {
          console.error("Invalid data format for history:", data);
          setHistoryItems([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
                <span className="font-mono font-bold text-zinc-900">{item.rating}/5 Stars</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500 mb-6 font-medium">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Visited
                </span>
                <span>•</span>
                <span>{new Date(item.visit_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              
              <p className="text-sm text-zinc-500 mb-6 italic">"{item.comment}"</p>

              <div className="flex items-center gap-3">
                <button className="text-xs font-bold uppercase tracking-widest text-primary-container hover:underline underline-offset-4 flex items-center gap-1 transition-all">
                  Edit Review
                </button>
                <Link to={`/venue/${item.id}`} className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center gap-1 transition-all">
                  View Detail <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
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
