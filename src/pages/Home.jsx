import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import RecipeCard from '../components/RecipeCard';
import RecipeFilter from '../components/RecipeFilter';
import { useDebounce } from '../hooks/useDebounce';
import { Sparkles, Utensils, Award, ChefHat, HeartHandshake } from 'lucide-react';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Debounced search term for high performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecipes(data || []);
      } catch (err) {
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || recipe.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 py-4 sm:py-8">
      {/* Hero Banner */}
      <div className="relative text-center space-y-5 py-10 px-4 rounded-3xl glass-panel border border-slate-800/80 shadow-2xl overflow-hidden">
        {/* Background glow ornaments */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-40 h-40 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>The Precious Culinary Sharing Hub</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
          Discover & Share <br />
          <span className="text-gradient-emerald-gold">Precious Gourmet Recipes</span>
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Unleash your inner chef, explore handcrafted recipes from around the globe, and share your favorite culinary creations in style.
        </p>

        {/* Feature Highlights */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <ChefHat className="w-4 h-4 text-emerald-400" />
            <span>Master Chef Recipes</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Community Rated</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>100% Free Sharing</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Component */}
      <RecipeFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Recipe Grid Listing */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-emerald-400 font-semibold">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm tracking-wide text-slate-400">Loading culinary masterpieces...</p>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 glass-panel rounded-3xl border border-slate-800/80 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Recipes Found</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            We couldn't find any recipes matching "{debouncedSearch || selectedCategory}". Try searching for another ingredient or reset filters.
          </p>
        </div>
      )}
    </div>
  );
}