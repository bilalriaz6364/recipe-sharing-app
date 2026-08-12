import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ShareButton from '../components/ShareButton';
import { Clock, Users, Utensils, ArrowLeft, Timer, Bookmark, BookmarkCheck, Pencil, Star, MessageSquare, Trash2, CheckCircle2, Sparkles } from 'lucide-react';

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState(null);

  // Reviews & Rating State
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Checked state for ingredients interactivity
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    const fetchRecipeFullDetails = async () => {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        setUser(currentUser);

        // 1. Fetch Recipe Info
        const { data: recipeData, error: recipeErr } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();

        if (recipeErr) throw recipeErr;
        setRecipe(recipeData);

        // 2. Fetch Ingredients
        const { data: ingData, error: ingErr } = await supabase
          .from('ingredients')
          .select('*')
          .eq('recipe_id', id);

        if (ingErr) throw ingErr;
        setIngredients(ingData || []);

        // 3. Fetch Instructions
        const { data: instData, error: instErr } = await supabase
          .from('instructions')
          .select('*')
          .eq('recipe_id', id)
          .order('step_number', { ascending: true });

        if (instErr) throw instErr;
        setInstructions(instData || []);

        // 4. Check Favorite Status
        if (currentUser) {
          const { data: favData } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('recipe_id', id)
            .single();

          if (favData) setIsFavorite(true);
        }

      } catch (err) {
        console.error('Fetch Error:', err);
        setError('Failed to load recipe details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const { data, error: revErr } = await supabase
          .from('recipe_reviews')
          .select('*')
          .eq('recipe_id', id)
          .order('created_at', { ascending: false });

        if (revErr) throw revErr;
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    if (id) {
      fetchRecipeFullDetails();
      fetchReviews();
    }
  }, [id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to leave a review!');
    if (!comment.trim()) return alert('Please write a comment!');

    try {
      setSubmittingReview(true);
      const newReview = {
        recipe_id: id,
        user_id: user.id,
        user_email: user.email,
        rating: Number(rating),
        comment: comment.trim()
      };

      const { data, error: submitErr } = await supabase
        .from('recipe_reviews')
        .insert([newReview])
        .select();

      if (submitErr) throw submitErr;

      setReviews([data[0], ...reviews]);
      setComment('');
      setRating(5);
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const { error: deleteErr } = await supabase
        .from('recipe_reviews')
        .delete()
        .eq('id', reviewId);

      if (deleteErr) throw deleteErr;
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      alert('Error deleting review: ' + err.message);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert('Please log in to save favorite recipes!');
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', id);

        setIsFavorite(false);
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: user.id, recipe_id: id }]);

        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const toggleIngredientCheck = (ingId) => {
    setCheckedIngredients(prev => ({ ...prev, [ingId]: !prev[ingId] }));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-emerald-400 font-semibold">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading recipe details...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-red-400 text-base font-bold">{error || 'Recipe not found!'}</p>
        <Link to="/" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg">
          Back to Recipes
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === recipe.user_id;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-8 pb-16">
      
      {/* 1. Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-2xl text-xs font-bold border border-slate-800 transition active:scale-95 shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" /> Back
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {isOwner && (
            <Link
              to={`/edit-recipe/${recipe.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 rounded-2xl text-xs font-bold active:scale-95 transition"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
          )}

          <button
            onClick={toggleFavorite}
            className={`inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-bold transition border active:scale-95 ${
              isFavorite
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {isFavorite ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" /> Saved
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-slate-400" /> Save
              </>
            )}
          </button>

          <ShareButton title={recipe.title} />
        </div>
      </div>

      {/* 2. Precious Hero Image Section */}
      <div className="relative w-full h-56 sm:h-96 rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-slate-800/80 shadow-2xl group">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
            <Utensils className="w-12 h-12 sm:w-16 sm:h-16 stroke-1 text-slate-500 mb-2" />
            <span className="text-xs sm:text-sm font-semibold text-slate-500">No Image Available</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-2 flex-wrap">
          <span className="bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 font-black text-[10px] sm:text-xs px-3 py-1 rounded-full shadow-lg">
            {recipe.category || 'General'}
          </span>
          {avgRating && (
            <span className="bg-slate-950/90 backdrop-blur-md text-amber-400 border border-amber-500/30 font-extrabold text-[10px] sm:text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {avgRating} ({reviews.length})
            </span>
          )}
        </div>
      </div>

      {/* 3. Recipe Title & Quick Stats */}
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          {recipe.title}
        </h1>
        <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
          {recipe.description || 'A delicious home-cooked recipe prepared with authentic easy ingredients.'}
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
          <div className="glass-panel p-2.5 sm:p-4 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mb-1" />
            <span className="text-[9px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-bold">Prep Time</span>
            <span className="text-xs sm:text-base font-extrabold text-white mt-0.5">{recipe.prep_time_minutes || 0}m</span>
          </div>
          <div className="glass-panel p-2.5 sm:p-4 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
            <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mb-1" />
            <span className="text-[9px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-bold">Cook Time</span>
            <span className="text-xs sm:text-base font-extrabold text-white mt-0.5">{recipe.cook_time_minutes || 0}m</span>
          </div>
          <div className="glass-panel p-2.5 sm:p-4 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mb-1" />
            <span className="text-[9px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-bold">Servings</span>
            <span className="text-xs sm:text-base font-extrabold text-white mt-0.5">{recipe.servings || 1}</span>
          </div>
        </div>
      </div>

      {/* 4. Ingredients Section */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>Ingredients</span> 🥗
          </h2>
          <span className="text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {ingredients.length} items
          </span>
        </div>

        {ingredients.length === 0 ? (
          <p className="text-slate-400 text-xs italic py-2">No ingredients listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ingredients.map((ing) => {
              const isChecked = checkedIngredients[ing.id];
              return (
                <button
                  key={ing.id} 
                  onClick={() => toggleIngredientCheck(ing.id)}
                  className={`flex justify-between items-center p-3 rounded-2xl border text-xs sm:text-sm text-left transition duration-200 gap-2 ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-400 line-through'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${isChecked ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="font-semibold truncate">{ing.item_name}</span>
                  </div>
                  <span className="font-bold text-amber-400 bg-slate-950 px-2.5 py-0.5 rounded-xl border border-slate-800 text-[11px] sm:text-xs shrink-0 whitespace-nowrap">
                    {ing.quantity} {ing.unit}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Instructions Section */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-xl font-black text-white border-b border-slate-800 pb-4 flex items-center gap-2">
          <span>Instructions & Steps</span> 👨‍🍳
        </h2>

        {instructions.length === 0 ? (
          <p className="text-slate-400 text-xs italic py-2">No step-by-step instructions available.</p>
        ) : (
          <div className="space-y-4">
            {instructions.map((inst) => (
              <div 
                key={inst.id} 
                className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 font-black text-xs shadow-md">
                    Step {inst.step_number}
                  </span>
                  {inst.timer_minutes && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      <Timer className="w-3.5 h-3.5" /> {inst.timer_minutes} mins timer
                    </span>
                  )}
                </div>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                  {inst.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Reviews & Rating Section */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
        <h2 className="text-xl font-black text-white flex items-center gap-2.5 border-b border-slate-800 pb-4">
          <MessageSquare className="w-5 h-5 text-emerald-400" /> Community Reviews & Ratings
        </h2>

        {/* Review Form */}
        {user ? (
          <form onSubmit={handleAddReview} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Rate this recipe:</span>
              <div className="flex gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none active:scale-125 transition"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience cooking this dish..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 rounded-xl text-xs font-black transition shadow-lg disabled:opacity-50 active:scale-[0.98]"
            >
              {submittingReview ? 'Submitting Review...' : 'Post Review 🚀'}
            </button>
          </form>
        ) : (
          <div className="bg-slate-900/80 p-4 rounded-2xl text-slate-400 text-xs border border-slate-800 text-center font-medium">
            Please log in to leave your feedback and rating for this recipe.
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-3.5 pt-2">
          {reviews.length === 0 ? (
            <p className="text-slate-500 text-xs italic text-center py-4">No reviews yet. Be the first to try and review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-200 truncate max-w-[200px]">
                      {rev.user_email || 'Verified Home Chef'}
                    </p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {user?.id === rev.user_id && (
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-slate-500 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}