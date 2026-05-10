import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PLATFORMS, PRODUCT_TYPES } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: '',
    platform: '',
    base_price: '',
    username: '',
    password: '',
    extras: ''
  })

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          name: data.name,
          description: data.description,
          type: data.type,
          platform: data.platform,
          base_price: data.base_price,
          username: data.credentials?.username || '',
          password: data.credentials?.password || '',
          extras: data.credentials?.extras || ''
        })
      }
    })
  }, [id])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const credentials = { username: form.username, password: form.password }
      if (form.extras) credentials.extras = form.extras

      const { error } = await supabase.from('products').update({
        name: form.name,
        description: form.description,
        type: form.type,
        platform: form.platform,
        base_price: Number(form.base_price),
        credentials: credentials
      }).eq('id', id)

      if (error) throw error
      toast.success('Updated')
      navigate('/supplier/products')
    } catch (err) {
      toast.error(err.message || 'Failed to update product')
    }
    setLoading(false)
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors'
  const selectClass = inputClass + ' bg-white'

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Edit Product</h1>
      <p className="text-sm text-gray-500 mt-1">Update product details and credentials</p>

      <form onSubmit={handleSubmit} className="mt-8 border border-gray-200 rounded-lg">
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Product Name</label>
            <input type="text" name="name" required value={form.name} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange}
              className={inputClass + ' resize-none'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className={selectClass}>
                {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Platform</label>
              <select name="platform" value={form.platform} onChange={handleChange} className={selectClass}>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Base Price (₦)</label>
            <input type="number" name="base_price" required min="100" value={form.base_price} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Credentials */}
        <div className="border-t border-gray-200 p-5 space-y-4">
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-1">Credentials</h3>
            <p className="text-[11px] text-gray-500">Hidden until a customer purchases the product.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Username / Email</label>
            <input type="text" name="username" required value={form.username} onChange={handleChange} className={inputClass}
              placeholder="account@email.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
            <input type="text" name="password" required value={form.password} onChange={handleChange} className={inputClass}
              placeholder="Account password" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Extra Details (Optional)</label>
            <textarea name="extras" rows={2} value={form.extras} onChange={handleChange}
              className={inputClass + ' resize-none'}
              placeholder="2FA code, recovery keys, instructions…" />
          </div>
        </div>

        <div className="border-t border-gray-200 p-5">
          <button type="submit" disabled={loading}
            className="w-full bg-[#0c0c0c] text-white font-semibold text-sm py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving…' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  )
}