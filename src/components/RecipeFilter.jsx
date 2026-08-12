import { Search, X, Flame } from 'lucide-react';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Vegetarian', 'Quick & Easy'];

export default function RecipeFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 mb-8 shadow-2xl space-y-4 border border-slate-800/80">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search delicious recipes, ingredients..."
            className="w-full pl-12 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white placeholder-slate-500 transition text-sm font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 shrink-0 mr-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <Flame className="w-3.5 h-3.5 fill-amber-400" /> Categories
        </div>

        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition duration-200 whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 shadow-lg shadow-emerald-500/25 font-extrabold'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}