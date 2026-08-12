import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ImageUpload from '../components/ImageUpload';
import { Plus, Trash2, ArrowLeft, Pencil } from 'lucide-react';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Vegetarian', 'Quick & Easy'];

export default function EditRecipe({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Ingredients & Instructions Dynamic List
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);

  useEffect(() => {
    const fetchRecipeForEdit = async () => {
      try {
        setLoading(true);

        const { data: recipe, error: recipeErr } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();

        if (recipeErr) throw recipeErr;

        if (user && recipe.user_id !== user.id) {
          alert('Unauthorized access! You can only edit your own recipes.');
          navigate('/');
          return;
        }

        setTitle(recipe.title || '');
        setDescription(recipe.description || '');
        setCategory(recipe.category || 'Breakfast');
        setPrepTime(recipe.prep_time_minutes || '');
        setCookTime(recipe.cook_time_minutes || '');
        setServings(recipe.servings || '');
        setImageUrl(recipe.image_url || '');

        const { data: ingData } = await supabase
          .from('ingredients')
          .select('*')
          .eq('recipe_id', id);

        setIngredients(ingData || []);

        const { data: instData } = await supabase
          .from('instructions')
          .select('*')
          .eq('recipe_id', id)
          .order('step_number', { ascending: true });

        setInstructions(instData || []);

      } catch (err) {
        console.error('Error fetching recipe for edit:', err);
        setError('Failed to load recipe details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipeForEdit();
    }
  }, [id, navigate, user]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { item_name: '', quantity: '', unit: '' }]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, { step_number: instructions.length + 1, description: '', timer_minutes: '' }]);
  };

  const handleRemoveInstruction = (index) => {
    const updated = instructions.filter((_, i) => i !== index).map((step, idx) => ({
      ...step,
      step_number: idx + 1
    }));
    setInstructions(updated);
  };

  const handleInstructionChange = (index, field, value) => {
    const updated = [...instructions];
    updated[index][field] = value;
    setInstructions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { error: updateErr } = await supabase
        .from('recipes')
        .update({
          title,
          description,
          category,
          prep_time_minutes: parseInt(prepTime) || 0,
          cook_time_minutes: parseInt(cookTime) || 0,
          servings: parseInt(servings) || 1,
          image_url: imageUrl
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateErr) throw updateErr;

      await supabase.from('ingredients').delete().eq('recipe_id', id);
      if (ingredients.length > 0) {
        const cleanIngs = ingredients
          .filter(ing => ing.item_name.trim() !== '')
          .map(ing => ({
            recipe_id: id,
            item_name: ing.item_name,
            quantity: ing.quantity || '1',
            unit: ing.unit || ''
          }));
        if (cleanIngs.length > 0) {
          await supabase.from('ingredients').insert(cleanIngs);
        }
      }

      await supabase.from('instructions').delete().eq('recipe_id', id);
      if (instructions.length > 0) {
        const cleanInsts = instructions
          .filter(inst => inst.description.trim() !== '')
          .map((inst, index) => ({
            recipe_id: id,
            step_number: index + 1,
            description: inst.description,
            timer_minutes: inst.timer_minutes ? parseInt(inst.timer_minutes) : null
          }));
        if (cleanInsts.length > 0) {
          await supabase.from('instructions').insert(cleanInsts);
        }
      }

      navigate(`/recipe/${id}`);
    } catch (err) {
      console.error('Update Error:', err);
      setError(err.message || 'Failed to update recipe.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-emerald-400 font-semibold">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading recipe for editing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & Back
      </button>

      <div className="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Pencil className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" /> Edit Recipe
        </h1>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-2xl text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Recipe Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <ImageUpload 
                  currentImageUrl={imageUrl} 
                  onImageUploaded={(url) => setImageUrl(url)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Prep (mins)</label>
                <input
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Cook (mins)</label>
                <input
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Servings</label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Ingredients Section */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-white">Ingredients</h3>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {ingredients.map((ing, idx) => (
              <div key={idx} className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ingredient Name"
                    value={ing.item_name}
                    onChange={(e) => handleIngredientChange(idx, 'item_name', e.target.value)}
                    className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition shrink-0"
                    title="Delete Ingredient"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Instructions Section */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-white">Instructions</h3>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
              >
                <Plus className="w-4 h-4" /> Add Step
              </button>
            </div>

            {instructions.map((inst, idx) => (
              <div key={idx} className="space-y-2.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-400">Step {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">Remove</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Step description..."
                  value={inst.description}
                  onChange={(e) => handleInstructionChange(idx, 'description', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:opacity-95 text-slate-950 font-black py-3.5 rounded-2xl transition duration-200 shadow-xl"
          >
            {submitting ? 'Updating Recipe...' : 'Save Recipe Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}