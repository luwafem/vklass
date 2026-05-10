import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get('redirect') || '/'
      navigate(redirectTo)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16 md:py-24">
      <h1 className="text-xl font-bold text-center">Sign In</h1>
      <p className="text-sm text-gray-500 text-center mt-1.5">Welcome back to vklass</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0c0c0c] text-white font-semibold text-sm py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-5">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[#0c0c0c] font-medium hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  )
}