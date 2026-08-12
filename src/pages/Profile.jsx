import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Clock, Utensils, Bookmark, Edit, Trash2, Check, Pencil, Sparkles, ChefHat, Camera, Loader2, Upload } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ username: '', avatar_url: '' });
  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  const [activeTab, setActiveTab] = useState('my-recipes');
  const [myRecipes, setMyRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Avatar Upload States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const currentUser = session.user;
        setUser(currentUser);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        const finalUsername = 
          profileData?.username || 
          currentUser.user_metadata?.username || 
          currentUser.user_metadata?.full_name || 
          currentUser.email?.split('@')[0];

        setProfile({
          username: finalUsername,
          avatar_url: profileData?.avatar_url || currentUser.user_metadata?.avatar_url || ''
        });
        setNewUsername(finalUsername);

        const { data: recipesData } = await supabase
          .from('recipes')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        setMyRecipes(recipesData || []);

        const { data: favsData } = await supabase
          .from('favorites')
          .select('*, recipes(*)')
          .eq('user_id', currentUser.id);

        if (favsData) {
          const extractedFavs = favsData.map(f => f.recipes).filter(Boolean);
          setFavorites(extractedFavs);
        }

      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Avatar Upload Handler (Supports both file input click & drag-and-drop)
  const handleAvatarUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    try {
      setUploadingAvatar(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${user.id}_${Date.now()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // 3. Upsert to DB `profiles` table
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username || newUsername,
          avatar_url: publicUrl
        });

      if (dbError) throw dbError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      alert('Profile picture updated successfully! 🎉');

    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Failed to upload avatar: ' + err.message);
    } finally {
      setUploadingAvatar(false);
      setIsDraggingAvatar(false);
    }
  };

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (!newUsername.trim()) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: newUsername.trim(),
          avatar_url: profile.avatar_url
        });

      if (error) throw error;

      setProfile(prev => ({ ...prev, username: newUsername.trim() }));
      setEditingName(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;

      setMyRecipes(myRecipes.filter(r => r.id !== recipeId));
    } catch (err) {
      alert('Failed to delete recipe: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-emerald-400 font-semibold">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading chef profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4 space-y-8">
      {/* Profile Header Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          
          {/* Glowing Avatar Box with Drag-and-Drop & File Click Upload */}
          <div className="flex flex-col items-center gap-2">
            <div 
              onDrop={handleAvatarDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingAvatar(true); }}
              onDragLeave={() => setIsDraggingAvatar(false)}
              className={`relative group w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-amber-400 p-0.5 shadow-xl shadow-emerald-500/20 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 ${
                isDraggingAvatar ? 'ring-4 ring-amber-400 scale-105' : ''
              }`}
            >
              <input
                type="file"
                accept="image/*"
                disabled={uploadingAvatar}
                onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                title="Click or Drag & Drop your Profile Photo here"
              />

              <div className="w-full h-full bg-slate-950 rounded-[22px] overflow-hidden flex items-center justify-center relative">
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                ) : profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-gradient-emerald-gold font-black text-3xl">
                    {profile.username ? profile.username.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}

                {/* Hover Camera Icon Overlay */}
                <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-emerald-400 transition-opacity duration-300 z-10">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[9px] font-black uppercase text-slate-100 tracking-wider">Change Pic</span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Upload className="w-3 h-3 text-emerald-400" /> Click/Drag Photo
            </span>
          </div>

          <div className="space-y-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-slate-950 border border-emerald-500 rounded-xl px-3 py-1 text-white text-base focus:outline-none"
                />
                <button
                  onClick={handleUpdateProfile}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {profile.username || user?.email?.split('@')[0]}
                </h1>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-slate-400 hover:text-emerald-400 transition p-1"
                  title="Edit Username"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-slate-400 text-xs font-semibold">{user?.email}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-2xl font-bold text-xs transition"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('my-recipes')}
            className={`flex items-center gap-2 pb-2 font-extrabold text-xs sm:text-sm transition border-b-2 ${
              activeTab === 'my-recipes'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ChefHat className="w-4 h-4" /> My Published Recipes ({myRecipes.length})
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 pb-2 font-extrabold text-xs sm:text-sm transition border-b-2 ${
              activeTab === 'favorites'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" /> Saved Favorites ({favorites.length})
          </button>
        </div>

        <Link
          to="/add-recipe"
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 rounded-xl text-xs font-black transition shadow-md"
        >
          + Create New Recipe
        </Link>
      </div>

      {/* Content Grid */}
      {activeTab === 'my-recipes' ? (
        myRecipes.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl border border-slate-800 space-y-3">
            <p className="text-slate-400 text-xs sm:text-sm font-semibold">You haven't uploaded any recipes yet.</p>
            <Link to="/add-recipe" className="inline-block text-emerald-400 font-bold hover:underline text-xs">
              Create your first gourmet recipe now →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRecipes.map((recipe) => (
              <div key={recipe.id} className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group">
                <Link to={`/recipe/${recipe.id}`}>
                  <div className="h-44 bg-slate-950 relative overflow-hidden">
                    {recipe.image_url ? (
                      <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-semibold">No Image</div>
                    )}
                    <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] uppercase font-black px-2.5 py-1 rounded-full border border-slate-800">
                      {recipe.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition line-clamp-1">
                      {recipe.title}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2">{recipe.description}</p>
                  </div>
                </Link>

                {/* Actions Bar */}
                <div className="p-4 pt-0 flex justify-between items-center border-t border-slate-800/80 mt-2">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} mins
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/edit-recipe/${recipe.id}`}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-xl transition border border-slate-800"
                      title="Edit Recipe"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition border border-red-500/20"
                      title="Delete Recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        favorites.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl border border-slate-800">
            <p className="text-slate-400 text-xs sm:text-sm font-semibold">No saved favorite recipes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recipe/${recipe.id}`}
                className="glass-card rounded-3xl overflow-hidden group"
              >
                <div className="h-44 bg-slate-950 relative overflow-hidden">
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-semibold">No Image</div>
                  )}
                  <span className="absolute top-3 right-3 bg-amber-500/20 backdrop-blur-md text-amber-400 text-[10px] uppercase font-black px-2.5 py-1 rounded-full border border-amber-500/30">
                    {recipe.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-2">{recipe.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}