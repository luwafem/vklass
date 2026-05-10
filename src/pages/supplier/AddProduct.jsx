import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PLATFORMS, PRODUCT_TYPES } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function AddProduct() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'account',
    platform: 'instagram',
    base_price: '',
    age: '',
    username: '',
    password: '',
    extras: ''
  })

  const credentialHint = useMemo(() => {
    const { type } = form
    if (type === 'vpn') return 'Enter VPN email and password. Include server location or config notes in Extra Details.'
    if (type === 'streaming') return 'Provide streaming service login. Specify profile name, region, or 4K status in Extra Details.'
    if (type === 'email') return 'Enter email address and password. Include recovery info or 2FA status in Extra Details.'
    if (type === 'dating') return 'Provide dating profile login. Add bio highlights or verification status in Extra Details.'
    if (type === 'gaming') return 'Enter gaming account credentials. Specify game titles, level, or skins in Extra Details.'
    if (type === 'phone') return 'Enter phone number in Username. Password can be "N/A" or include SMS forwarding instructions in Extra Details.'
    if (type === 'bank') return '⚠️ Only list accounts you legally own. Provide account number in Username and login in Password.'
    return 'Enter username/email and password. Add 2FA codes, recovery keys, or setup instructions in Extra Details.'
  }, [form.type])

  const renderExtraAttributes = () => {
    if (form.type === 'vpn') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Server Location</label>
            <input type="text" name="vpn_location" value={form.vpn_location || ''} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="e.g. US, UK, Netherlands" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Subscription Tier</label>
            <select name="vpn_tier" value={form.vpn_tier || ''} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white">
              <option value="">Select tier</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
        </div>
      )
    }
    if (form.type === 'streaming') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Region</label>
            <input type="text" name="stream_region" value={form.stream_region || ''} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="e.g. US, NG, UK" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Profile Count</label>
            <input type="number" name="stream_profiles" min="1" max="6" value={form.stream_profiles || ''} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="1-6" />
          </div>
        </div>
      )
    }
    if (form.type === 'gaming') {
      return (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Game Titles / Features</label>
          <textarea name="gaming_features" rows={2} value={form.gaming_features || ''} onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
            placeholder="e.g. Fortnite Level 200, 50 skins, V-Bucks included" />
        </div>
      )
    }
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Account Age (Optional)</label>
        <input type="text" name="age" value={form.age} onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
          placeholder="e.g. 2 years, 6 months, Aged, New" />
        <p className="text-[11px] text-gray-400 mt-1">Displayed to buyers as a trust feature.</p>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'type') {
      setForm(prev => ({
        ...prev,
        vpn_location: '',
        vpn_tier: '',
        stream_region: '',
        stream_profiles: '',
        gaming_features: '',
        age: value === 'account' || value === 'email' || value === 'dating' ? prev.age : ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const credentials = { username: form.username, password: form.password }
      if (form.extras) credentials.extras = form.extras

      const attributes = {}
      if (form.age) attributes.age = form.age
      if (form.type === 'vpn') {
        if (form.vpn_location) attributes.location = form.vpn_location
        if (form.vpn_tier) attributes.tier = form.vpn_tier
      }
      if (form.type === 'streaming') {
        if (form.stream_region) attributes.region = form.stream_region
        if (form.stream_profiles) attributes.profiles = Number(form.stream_profiles)
      }
      if (form.type === 'gaming' && form.gaming_features) {
        attributes.features = form.gaming_features
      }

      const { error } = await supabase.from('products').insert({
        supplier_id: user.id,
        name: form.name,
        description: form.description,
        type: form.type,
        platform: form.platform,
        base_price: Number(form.base_price),
        attributes: Object.keys(attributes).length > 0 ? attributes : null,
        credentials: credentials,
      })
      if (error) throw error
      toast.success('Product created')
      navigate('/supplier/products')
    } catch (err) {
      console.error('Product creation error:', err)
      toast.error(err.message || 'Failed to create product')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Add New Product</h1>
      <p className="text-sm text-gray-500 mt-1">List a new digital product for sale</p>

      <form onSubmit={handleSubmit} className="mt-8 border border-gray-200 rounded-lg">
        {/* Basic Info */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Product Name</label>
            <input type="text" name="name" required value={form.name} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="e.g. Premium Netflix Account — US Region" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
              placeholder="Include key features, region, guarantees, etc." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white">
                {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Platform / Service</label>
              <select name="platform" value={form.platform} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white">
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Price (₦)</label>
            <input type="number" name="base_price" required min="100" value={form.base_price} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="Enter amount in Naira" />
          </div>
        </div>

        {/* Attributes */}
        <div className="border-t border-gray-200 p-5">
          <h3 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-3">Product Attributes</h3>
          {renderExtraAttributes()}
        </div>

        {/* Credentials */}
        <div className="border-t border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400">Credentials</h3>
            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Hidden until purchase</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">{credentialHint}</p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {form.type === 'phone' ? 'Phone Number' : 'Username / Email / Account ID'}
            </label>
            <input type="text" name="username" required value={form.username} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder={form.type === 'phone' ? '+234 801 234 5678' : 'account@email.com'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {form.type === 'phone' ? 'SMS Forwarding / Notes' : 'Password / Access Key'}
            </label>
            <input type="text" name="password" required value={form.password} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder={form.type === 'phone' ? 'Instructions for receiving SMS' : 'Account password'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Extra Details (Optional)</label>
            <textarea name="extras" rows={2} value={form.extras} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
              placeholder="2FA code, recovery email, setup instructions, warranty terms…" />
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-gray-200 p-5">
          <button type="submit" disabled={loading}
            className="w-full bg-[#0c0c0c] text-white font-semibold text-sm py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving…' : 'Create Product'}
          </button>
          <p className="text-[11px] text-center text-gray-400 mt-3">
            By listing this product, you confirm you have the legal right to sell it.
          </p>
        </div>
      </form>
    </div>
  )
}