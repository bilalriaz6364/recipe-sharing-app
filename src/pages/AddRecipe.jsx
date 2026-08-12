import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import ImageUpload from '../components/ImageUpload';
import { Plus, Trash2, Sparkles, ChefHat, Clock, Users, ArrowLeft } from 'lucide-react'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Vegetarian', 'Quick & Easy'];

export default function AddRecipe({ session }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Breakfast')
  const [prepTime, setPrepTime] = useState(15)
  const [cookTime, setCookTime] = useState(30)
  const [servings, setServings] = useState(4)
  const [imageUrl, setImageUrl] = useState('')

  // Dynamic Lists State
  const [ingredients, setIngredients] = useState([
    { item_name: '', quantity: '', unit: 'grams' }
  ])
  const [instructions, setInstructions] = useState([
    { step_number: 1, description: '', timer_minutes: '' }
  ])

  // Handlers for Ingredients
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { item_name: '', quantity: '', unit: 'grams' }])
  }

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  // Handlers for Instructions
  const handleAddInstruction = () => {
    setInstructions([
      ...instructions,
      { step_number: instructions.length + 1, description: '', timer_minutes: '' }
    ])
  }

  const handleRemoveInstruction = (index) => {
    const filtered = instructions.filter((_, i) => i !== index)
    const renumbered = filtered.map((item, i) => ({ ...item, step_number: i + 1 }))
    setInstructions(renumbered)
  }

  const handleInstructionChange = (index, field, value) => {
    const updated = [...instructions]
    updated[index][field] = value
    setInstructions(updated)
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: authData, error: userError } = await supabase.auth.getUser()
      const activeUser = authData?.user || session?.user

      if (userError || !activeUser) {
        throw new Error('Session expired. Please log out and log in again!')
      }

      // 1. Insert Main Recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert([
          {
            user_id: activeUser.id,
            title,
            description,
            category,
            prep_time_minutes: parseInt(prepTime) || 0,
            cook_time_minutes: parseInt(cookTime) || 0,
            servings: parseInt(servings) || 1,
            image_url: imageUrl || null,
          }
        ])
        .select()
        .single()

      if (recipeError) throw recipeError

      const recipeId = recipeData.id

      // 2. Insert Ingredients
      const validIngredients = ingredients
        .filter(ing => ing.item_name.trim() !== '')
        .map((ing) => ({
          recipe_id: recipeId,
          item_name: ing.item_name,
          quantity: parseFloat(ing.quantity) || 0,
          unit: ing.unit || '',
        }))

      if (validIngredients.length > 0) {
        const { error: ingError } = await supabase
          .from('ingredients')
          .insert(validIngredients)
        if (ingError) throw ingError
      }

      // 3. Insert Instructions
      const validInstructions = instructions
        .filter(inst => inst.description.trim() !== '')
        .map((inst) => ({
          recipe_id: recipeId,
          step_number: inst.step_number,
          description: inst.description,
          timer_minutes: parseInt(inst.timer_minutes) || null,
        }))

      if (validInstructions.length > 0) {
        const { error: instError } = await supabase
          .from('instructions')
          .insert(validInstructions)
        if (instError) throw instError
      }

      navigate('/')
    } catch (err) {
      console.error('Submit Error:', err)
      setError(err.message || 'Failed to save recipe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          Create New <span className="text-gradient-emerald-gold">Recipe</span> 🍳
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Share your gourmet creation with the world community.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-2xl text-red-200 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Details */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ChefHat className="w-5 h-5 text-emerald-400" /> Basic Information
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Recipe Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Creamy Garlic Butter Pasta"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Short Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of the flavor profile, origin, or serving suggestions..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] sm:text-xs font-bold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-xs font-semibold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-300 mb-1">Prep (mins)</label>
              <input
                type="number"
                min="0"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-2.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-300 mb-1">Cook (mins)</label>
              <input
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="w-full px-2.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-300 mb-1">Servings</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full px-2.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <ImageUpload 
              currentImageUrl={imageUrl} 
              onImageUploaded={(url) => setImageUrl(url)} 
            />
          </div>
        </div>

        {/* Section 2: Ingredients */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-white">Ingredients</h2>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="flex items-center gap-1 text-xs bg-slate-900 hover:bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-800 font-bold transition"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {ingredients.map((ing, index) => (
            <div key={index} className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ingredient Name (e.g. Olive Oil)"
                  value={ing.item_name}
                  onChange={(e) => handleIngredientChange(index, 'item_name', e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition shrink-0"
                    title="Delete Ingredient"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Qty (e.g. 2)"
                  value={ing.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Unit (e.g. tbsp, grams)"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Section 3: Instructions */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-white">Instructions & Steps</h2>
            <button
              type="button"
              onClick={handleAddInstruction}
              className="flex items-center gap-1 text-xs bg-slate-900 hover:bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-800 font-bold transition"
            >
              <Plus className="w-4 h-4" /> Add Step
            </button>
          </div>

          {instructions.map((inst, index) => (
            <div key={index} className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-400 text-xs">Step #{inst.step_number}</span>
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(index)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">Remove</span>
                  </button>
                )}
              </div>
              <textarea
                rows="2"
                placeholder="Describe step instructions..."
                value={inst.description}
                onChange={(e) => handleInstructionChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Timer in minutes (optional)"
                value={inst.timer_minutes}
                onChange={(e) => handleInstructionChange(index, 'timer_minutes', e.target.value)}
                className="w-full sm:w-48 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:opacity-95 text-slate-950 font-black py-3.5 rounded-2xl transition duration-200 text-base shadow-xl disabled:opacity-50 active:scale-[0.99]"
        >
          {loading ? 'Publishing Precious Recipe...' : 'Publish Recipe 🚀'}
        </button>
      </form>
    </div>
  )
}