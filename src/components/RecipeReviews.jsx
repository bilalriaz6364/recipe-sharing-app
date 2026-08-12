import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, MessageSquare, Trash2, Send } from 'lucide-react';

export default function RecipeReviews({ recipeId, currentUserId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // useEffect ke andar hi fetch function define kar diya
  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('reviews')
          .select('*, profiles(username)')
          .eq('recipe_id', recipeId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (recipeId) {
      fetchReviews();
    }

    return () => {
      isMounted = false;
    };
  }, [recipeId]);

  // Submit ke waqt alag se call karne ke liye helper function
  const reloadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(username)')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error reloading reviews:', err.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      alert('Please log in to leave a review.');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('reviews').insert([
        {
          recipe_id: recipeId,
          user_id: currentUserId,
          rating,
          comment: comment.trim(),
        },
      ]);

      if (error) throw error;

      setComment('');
      setRating(5);
      reloadReviews();
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert('Error deleting review: ' + err.message);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="mt-12 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-white">Reviews & Ratings</h3>
        </div>

        {avgRating && (
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-white">{avgRating}</span>
            <span className="text-xs text-slate-400">({reviews.length})</span>
          </div>
        )}
      </div>

      {currentUserId ? (
        <form onSubmit={handleSubmitReview} className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Your Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of this recipe?"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      ) : (
        <div className="text-sm text-slate-400 bg-slate-900/40 p-4 rounded-xl text-center border border-slate-800">
          Please log in to leave a review for this recipe.
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-4">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-2 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-emerald-400">
                    {rev.profiles?.username || 'Anonymous'}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {currentUserId === rev.user_id && (
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="text-slate-500 hover:text-red-400 transition"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-300">{rev.comment}</p>
              <span className="text-[10px] text-slate-500 block">
                {new Date(rev.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}