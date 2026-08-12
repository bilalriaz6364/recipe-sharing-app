import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Lock, Mail, User } from 'lucide-react'

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        })
        if (signUpError) throw signUpError
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
      }
      navigate('/')
    } catch (err) {
      const message = err?.error_description || err?.message || 'An error occurred during authentication'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-6 sm:my-12 p-5 sm:p-8 glass-panel rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl space-y-5 sm:space-y-6 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 blur-[60px] pointer-events-none" />

      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        </h2>
        <p className="text-slate-400 text-xs font-medium">
          {isSignUp ? 'Join RecipeCraft gourmet community' : 'Access your saved recipes and favorites'}
        </p>
      </div>

      {error && (
        <div className="p-3.5 text-xs font-semibold bg-red-950/60 border border-red-500/40 rounded-2xl text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-300">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-xs font-medium"
                placeholder="e.g. MasterChef"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold mb-1.5 text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-xs font-medium"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-xs font-medium"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:opacity-95 text-slate-950 font-black py-3 rounded-xl transition duration-200 shadow-lg text-sm disabled:opacity-50 active:scale-[0.99] mt-2"
        >
          {loading ? 'Processing...' : isSignUp ? 'Create Precious Account' : 'Log In Now'}
        </button>
      </form>

      <p className="pt-2 text-center text-xs text-slate-400 font-medium">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
          }}
          className="text-emerald-400 hover:underline font-bold"
        >
          {isSignUp ? 'Log In' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}