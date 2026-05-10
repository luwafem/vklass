import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'customer' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp(form.email, form.password, {
      full_name: form.fullName,
      role: form.role,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created successfully!')
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16 md:py-24">
      <h1 className="text-xl font-bold text-center">Create Account</h1>
      <p className="text-sm text-gray-500 text-center mt-1.5">Start buying or selling on vklass</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
          <input
            type="text"
            name="fullName"
            required
            value={form.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            placeholder="Min 6 characters"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Account Type</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white"
          >
            <option value="customer">Customer — I want to buy</option>
            <option value="supplier">Supplier — I want to sell</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0c0c0c] text-white font-semibold text-sm py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-[#0c0c0c] font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  )
}