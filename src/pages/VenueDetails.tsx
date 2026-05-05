import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Clock, ArrowLeft, Bookmark, Share2, Info, Loader2 } from "lucide-react";

interface Venue {
  id: number;
  name: string;
  type: string;
  price_range: string;
  rating: number;
  location: string;
  description: string;
  image_url: string;
  operating_hours?: string;
  review_count: number;
}

export default function VenueDetails() {
  const { id } = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const currentUserId = user?.id || 1;

    fetch(`/api/restaurants/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          setVenue(data);
        } else {
          setVenue(null);
        }
      })
      .catch(console.error);

    fetch(`/api/restaurants/${id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Check if bookmarked
    if (user) {
      fetch(`/api/bookmarks/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setIsBookmarked(data.some((b: any) => b.id === Number(id)));
          }
        });
    }
  }, [id]);

  const toggleBookmark = async () => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      alert("Please log in to save hotspots!");
      return;
    }
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: id, user_id: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setIsBookmarked(data.action === 'added');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      alert("Please log in to review!");
      return;
    }
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: id,
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowReviewForm(false);
        // Refresh component
        window.location.reload();
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

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto py-24 px-8 text-center text-zinc-400">
        Venue not found in your database.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-8 md:px-12">
      <Link to="/catalogue" className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary-container mb-8 font-bold transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={venue.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"} alt={venue.name} />
            <div className="absolute top-6 right-6 flex gap-3">
              <button 
                onClick={toggleBookmark}
                className={`p-3 backdrop-blur-md rounded-full transition-all active:scale-95 border ${isBookmarked ? 'bg-primary-container text-white border-primary-container' : 'bg-white/20 text-white border-white/30 hover:bg-white/40'}`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all active:scale-95 border border-white/30">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center gap-2">
              <div className="p-2 rounded-lg bg-white shadow-sm text-amber-500 mb-1">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <span className="font-bold text-lg">{Number(venue.rating).toFixed(1)}</span>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest leading-none">Rating</span>
            </div>
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center gap-2">
              <div className="p-2 rounded-lg bg-white shadow-sm text-primary-container mb-1">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs truncate w-full">{venue.location}</span>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest leading-none">Location</span>
            </div>
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center gap-2">
              <div className="p-2 rounded-lg bg-white shadow-sm text-zinc-600 mb-1">
                <Clock className="w-5 h-5" />
              </div>
              <span className="font-bold text-[10px]">{venue.operating_hours || "Varies"}</span>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest leading-none">Hours</span>
            </div>
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center gap-2 text-zinc-600">
              <div className="p-2 rounded-lg bg-white shadow-sm mb-1 text-xs font-mono font-bold">
                {venue.price_range?.replace('$', '₱')}
              </div>
              <span className="font-bold text-sm">Budget</span>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest leading-none">Price</span>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-primary-container">Community Reviews</h3>
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-sm font-bold text-primary-container hover:underline"
              >
                {showReviewForm ? "Cancel" : "Write a Review"}
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={submitReview} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 space-y-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-zinc-400 mb-2">Rating</label>
                  <select 
                    value={newReview.rating}
                    onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})}
                    className="w-full p-3 rounded-xl border border-zinc-200 bg-white"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-zinc-400 mb-2">Your Experience</label>
                  <textarea 
                    required
                    value={newReview.comment}
                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Tell us about the food..."
                    className="w-full p-4 rounded-xl border border-zinc-200 bg-white h-32"
                  ></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-primary-container text-white font-bold rounded-xl active:scale-95 transition-all">Submit Review</button>
              </form>
            )}

            <div className="space-y-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-6 border-b border-zinc-100 last:border-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-zinc-900">{rev.full_name}</h4>
                      <span className="text-[10px] text-zinc-400">@{rev.username} • {new Date(rev.visit_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold text-xs">{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-zinc-600 text-sm leading-relaxed italic">"{rev.comment}"</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-center text-zinc-400 py-8">No reviews yet.</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-zinc-100 text-[10px] uppercase font-black tracking-widest text-zinc-500">{venue.type}</span>
            <span className="text-[10px] uppercase font-black tracking-widest text-primary-container/60">{venue.review_count || 0} reviews</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary-container mb-8 tracking-tighter leading-tight">{venue.name}</h1>
          
          <p className="text-zinc-500 text-lg md:text-xl leading-relaxed mb-12">
            {venue.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button className="flex-1 py-5 px-8 bg-primary-container text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary-container/20">
              Get Directions
            </button>
            <button 
              onClick={() => setShowReviewForm(true)}
              className="flex-1 py-5 px-8 bg-white text-primary-container border-2 border-primary-container rounded-2xl font-bold hover:bg-zinc-50 transition-all active:scale-[0.98]"
            >
              Write Review
            </button>
          </div>
          
          <div className="mt-12 p-6 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-4">
            <div className="p-3 rounded-full bg-white text-primary-container shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-primary-container mb-1 tracking-tight">Student-Verified Spot</h5>
              <p className="text-sm text-zinc-500">This spot has been checked and verified by fellow students in the Talamban area.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
