import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { Utensils, LogOut, PlusCircle, LogIn, User, Sparkles, Menu, X, Home as HomeIcon } from 'lucide-react'

import Home from './pages/Home'
import Auth from './pages/Auth'
import AddRecipe from './pages/AddRecipe'
import RecipeDetail from './pages/RecipeDetail'
import Profile from './pages/Profile'
import EditRecipe from './pages/EditRecipe'
import SmokyCursor from './components/SmokyCursor'

function NavigationHeader({ session, handleLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const location = useLocation();

  // Close mobile menu whenever location changes & fetch avatar
  useEffect(() => {
    setMobileMenuOpen(false);

    if (session?.user) {
      supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        });
    } else {
      setAvatarUrl('');
    }
  }, [location, session]);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-2xl border-b border-slate-800/80 shadow-2xl transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between max-w-6xl">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-400 text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <Utensils className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1">
              Recipe<span className="text-gradient-emerald-gold">Craft</span>
              <Sparkles className="w-4 h-4 text-amber-400 opacity-90 animate-pulse" />
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link 
            to="/" 
            className={`text-sm font-bold transition-all py-1.5 px-3 rounded-xl ${
              location.pathname === '/' 
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-900/60'
            }`}
          >
            Recipes
          </Link>
          
          {session ? (
            <>
              <Link 
                to="/add-recipe" 
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-95"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" /> Add Recipe
              </Link>

              <Link 
                to="/profile" 
                className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-all py-1.5 px-3 rounded-xl ${
                  location.pathname === '/profile'
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-900/60'
                }`}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-emerald-400" />
                ) : (
                  <User className="w-4 h-4 text-emerald-400" />
                )}
                <span>My Profile</span>
              </Link>

              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-xs sm:text-sm font-bold transition-colors py-1.5 px-3 rounded-xl hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:opacity-95 text-slate-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-95"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" /> Login / Signup
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button (Shown on Mobile only) */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white hover:bg-slate-800 focus:outline-none transition active:scale-95 shadow-md"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Menu className="w-6 h-6 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800/90 shadow-2xl animate-in slide-in-from-top duration-300 px-4 py-5 space-y-3 bg-slate-950/95 backdrop-blur-2xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition ${
              location.pathname === '/'
                ? 'bg-gradient-to-r from-emerald-500/20 to-amber-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <HomeIcon className="w-5 h-5 text-emerald-400" />
            <span>Explore All Recipes</span>
          </Link>

          {session ? (
            <>
              <Link
                to="/add-recipe"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition"
              >
                <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                <span>Create New Recipe</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition ${
                  location.pathname === '/profile'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-amber-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-emerald-400" />
                ) : (
                  <User className="w-5 h-5 text-emerald-400" />
                )}
                <span>My Profile & Favorites</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-red-400 bg-red-500/10 border border-red-500/20 font-black text-sm hover:bg-red-500/20 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition justify-center"
            >
              <LogIn className="w-5 h-5 stroke-[2.5]" />
              <span>Login / Register Account</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Router>
      {/* Global Interactive Smoky Cursor */}
      <SmokyCursor />

      <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        {/* Navigation Header with Responsive Mobile Drawer */}
        <NavigationHeader session={session} handleLogout={handleLogout} />

        {/* Main View Container */}
        <main className="flex-1 container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-6xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/add-recipe" element={session ? <AddRecipe session={session} /> : <Navigate to="/auth" />} />
            <Route path="/recipe/:id" element={<RecipeDetail session={session} />} />
            <Route path="/profile" element={session ? <Profile session={session} /> : <Navigate to="/auth" />} />
            <Route path="/edit-recipe/:id" element={session ? <EditRecipe session={session} /> : <Navigate to="/auth" />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}