import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Star, Loader2, Search } from "lucide-react";

interface Restaurant {
  id: number;
  name: string;
  type: string;
  price_range: string;
  rating: number;
  description: string;
  image_url: string;
}

export default function Catalogue() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Spots");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "All Spots") params.append("category", activeCategory);
    if (searchQuery) params.append("search", searchQuery);

    fetch(`/api/restaurants?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRestaurants(data);
        } else {
          console.error("Invalid data format for restaurants:", data);
          setRestaurants([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-container" />
      </div>
    );
  }

  const categories = ['All Spots', 'Cafe', 'Carinderia', 'Fast Food', 'Resto', 'Snack Bar'];

  return (
    <div className="max-w-7xl mx-auto px-8 md:px-12 py-12">
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-container tracking-tighter">Campus Culinary Catalogue</h1>
            <p className="text-zinc-500 max-w-2xl text-lg">Discover authentic University of San Carlos dining experiences. From quick bites to student-favorite hidden gems across Talamban.</p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary-container transition-colors" />
            <input 
              type="text"
              placeholder="Search by name or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border-2 border-transparent rounded-2xl p-4 pl-12 text-zinc-900 font-bold focus:ring-4 focus:ring-primary-container/10 focus:border-primary-container/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all active:scale-95 border ${
                activeCategory === cat 
                ? 'bg-primary-container text-white border-primary-container' 
                : 'bg-white border-zinc-200 text-zinc-500 hover:border-primary-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {restaurants.map((res) => (
          <Link key={res.id} to={`/venue/${res.id}`} className="group clean-card rounded-2xl overflow-hidden block">
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src={res.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"} 
                alt={res.name}
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-primary-container text-balance">{res.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary-container text-primary-container" />
                  <span className="text-sm font-bold">{res.rating || "0.0"}</span>
                </div>
              </div>
              <p className="text-zinc-500 mb-4 line-clamp-2">{res.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm tracking-widest text-primary-container font-bold">{res.price_range?.replace('$', '₱')}</span>
                <span className="px-2 py-1 rounded bg-zinc-100 text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-sans">{res.type}</span>
              </div>
            </div>
          </Link>
        ))}
        {restaurants.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
            <Search className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-600 font-extrabold text-xl">Could not reach the campus database</p>
            <p className="text-zinc-400 text-sm mt-3 max-w-md mx-auto">
              Please check your <b>DB_HOST</b> in the Settings menu. If you are using a remote USC server, ensure you've provided the correct hostname instead of 'localhost'.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
