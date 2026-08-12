import { Link } from 'react-router-dom';
import { Clock, Users, Utensils, Sparkles, ChevronRight } from 'lucide-react';

export default function RecipeCard({ recipe }) {
  const prepTime = recipe?.prep_time_minutes || 0;
  const cookTime = recipe?.cook_time_minutes || 0;
  const totalTime = prepTime + cookTime;

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group h-full relative">
      <div>
        {/* Fixed Image Container */}
        <div className="relative h-52 w-full bg-slate-950 overflow-hidden">
          {recipe?.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-gradient-to-b from-slate-900 to-slate-950">
              <Utensils className="w-12 h-12 stroke-1 text-slate-500 mb-2" />
              <span className="text-xs font-semibold text-slate-500">No Image Available</span>
            </div>
          )}

          {/* Shimmer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

          {/* Prominent Emerald Gold Category Badge */}
          <span className="absolute top-3.5 right-3.5 bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-emerald-500/20">
            {recipe?.category || 'General'}
          </span>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-2.5">
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 flex items-center justify-between">
            <span>{recipe?.title}</span>
          </h3>
          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
            {recipe?.description || 'Indulge in this delicious culinary creation prepared with authentic ingredients.'}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-5 pt-0 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-t border-slate-800/80 pt-3.5">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{totalTime || recipe?.prep_time_minutes || 15} mins</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-800">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{recipe?.servings || 2} servings</span>
          </div>
        </div>

        <Link
          to={`/recipe/${recipe.id}`}
          className="flex items-center justify-center gap-1.5 w-full bg-slate-900 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-500 text-slate-300 hover:text-slate-950 font-bold py-2.5 rounded-2xl transition duration-300 text-xs border border-slate-800 hover:border-transparent shadow-md group/btn"
        >
          <span>View Recipe Details</span>
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}