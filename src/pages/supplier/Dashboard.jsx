import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatPrice } from '../../utils/helpers'
import { 
  ShoppingBag, DollarSign, Package, AlertTriangle, Plus, List, 
  Receipt, Landmark, Store, Copy, ExternalLink, Settings 
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SupplierDashboard() {
  const { user, profile, refreshProfile } = useAuth()
  const [stats, setStats] = useState({ products: 0, items: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  
  // Storefront settings state
  const [storeSettings, setStoreSettings] = useState({
    store_name: profile?.store_name || '',
    store_bio: profile?.store_bio || '',
    store_slug: profile?.store_slug || '',
    store_enabled: profile?.store_enabled || false,
  })
  const [savingStore, setSavingStore] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (user) {
      fetchStats()
      // Sync profile changes to store settings
      setStoreSettings({
        store_name: profile?.store_name || '',
        store_bio: profile?.store_bio || '',
        store_slug: profile?.store_slug || '',
        store_enabled: profile?.store_enabled || false,
      })
    }
  }, [user, profile])

  const fetchStats = async () => {
    const { data: prods } = await supabase
      .from('products')
      .select('id')
      .eq('supplier_id', user.id)
    
    const productIds = prods?.map(p => p.id) || []
    
    const { data: items } = await supabase
      .from('product_items')
      .select('id')
      .eq('is_sold', false)
      .in('product_id', productIds)
    
    const { data: orders } = await supabase
      .from('orders')
      .select('supplier_share')
      .eq('status', 'completed')
      .in('product_id', productIds)

    setStats({
      products: prods?.length || 0,
      items: items?.length || 0,
      revenue: orders?.reduce((s, o) => s + Number(o.supplier_share), 0) || 0
    })
    setLoading(false)
  }

  const needsBankSetup = !profile?.bank_details?.subaccount_code

  // Storefront URL helpers
  const storeUrl = storeSettings.store_slug
    ? `${window.location.origin}/store/slug/${storeSettings.store_slug}`
    : `${window.location.origin}/store/${user?.id}`

  const copyStoreLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl)
      setCopiedLink(true)
      toast.success('Store link copied!')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  // Save storefront settings
  const saveStoreSettings = async (e) => {
    e.preventDefault()
    setSavingStore(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          store_name: storeSettings.store_name.trim() || null,
          store_bio: storeSettings.store_bio.trim() || null,
          store_slug: storeSettings.store_slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || null,
          store_enabled: storeSettings.store_enabled,
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      // Refresh profile to update context
      await refreshProfile?.()
      toast.success('Store settings saved!')
    } catch (err) {
      console.error('Error saving store settings:', err)
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSavingStore(false)
    }
  }

  const quickLinks = [
    { to: '/supplier/products/new', icon: Plus, label: 'Add Product' },
    { to: '/supplier/products', icon: List, label: 'My Products' },
    { to: '/supplier/orders', icon: Receipt, label: 'View Sales' },
    { to: '/supplier/bank', icon: Landmark, label: 'Bank Details', alert: needsBankSetup },
  ]

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1">{user?.email}</p>

      {/* Bank setup banner */}
      {needsBankSetup && (
        <Link to="/supplier/bank"
          className="mt-6 flex items-center gap-3 border border-amber-200 bg-amber-50 rounded-lg px-4 py-3 hover:bg-amber-100 transition-colors group">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Set up bank details</p>
            <p className="text-xs text-amber-700 mt-0.5">You won't receive automatic payouts until you add your bank account.</p>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-5 mt-8">
        <div className="border border-gray-200 rounded-lg p-3 md:p-4">
          <Package size={16} className="text-gray-400 mb-2" strokeWidth={1.5} />
          <div className="text-lg md:text-xl font-bold tabular-nums">{stats.products}</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Products</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 md:p-4">
          <ShoppingBag size={16} className="text-gray-400 mb-2" strokeWidth={1.5} />
          <div className="text-lg md:text-xl font-bold tabular-nums">{stats.items}</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">In Stock</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 md:p-4">
          <DollarSign size={16} className="text-gray-400 mb-2" strokeWidth={1.5} />
          <div className="text-lg md:text-xl font-bold tabular-nums">{formatPrice(stats.revenue)}</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Revenue</div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`border rounded-lg p-4 flex flex-col items-center gap-2.5 transition-colors ${
                link.alert
                  ? 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <link.icon size={20} className={link.alert ? 'text-amber-600' : 'text-gray-400'} strokeWidth={1.5} />
              <span className={`text-xs font-medium ${link.alert ? 'text-amber-800' : 'text-gray-700'}`}>
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 🏪 Storefront Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Store size={16} className="text-gray-400" strokeWidth={1.5} />
          <h2 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400">
            Your Storefront
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
          {/* Store status + link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {storeSettings.store_enabled ? '✅ Store is live' : '⏸️ Store is hidden'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {storeSettings.store_enabled 
                  ? 'Customers can visit your store via the link below' 
                  : 'Enable your store to start sharing it with customers'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {storeSettings.store_enabled && (
                <>
                  <Link
                    to={`/store/${user?.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0c0c0c] hover:underline"
                  >
                    <ExternalLink size={12} /> Preview
                  </Link>
                  <button
                    onClick={copyStoreLink}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {copiedLink ? <Copy size={12} className="text-green-500" /> : <Copy size={12} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Store Settings Form */}
          <form onSubmit={saveStoreSettings} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Store Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Store Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={storeSettings.store_name}
                  onChange={e => setStoreSettings(s => ({ ...s, store_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  placeholder="My Digital Store"
                  maxLength={50}
                />
              </div>

              {/* Custom Slug */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Custom URL <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 whitespace-nowrap">/store/slug/</span>
                  <input
                    type="text"
                    value={storeSettings.store_slug}
                    onChange={e => setStoreSettings(s => ({ 
                      ...s, 
                      store_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                    }))}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="my-store"
                    pattern="[a-z0-9-]+"
                    maxLength={30}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Letters, numbers, hyphens only</p>
              </div>
            </div>

            {/* Store Bio */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Store Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={storeSettings.store_bio}
                onChange={e => setStoreSettings(s => ({ ...s, store_bio: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                placeholder="Tell customers what you sell..."
                maxLength={200}
              />
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {storeSettings.store_bio.length}/200
              </p>
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Enable Storefront</p>
                <p className="text-xs text-gray-500">Make your store publicly visible</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={storeSettings.store_enabled}
                  onChange={e => setStoreSettings(s => ({ ...s, store_enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0c0c0c]"></div>
              </label>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {storeSettings.store_enabled && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <Store size={12} /> Live: {storeUrl.replace(/^https?:\/\//, '').split('/')[0]}
                </span>
              )}
              <button
                type="submit"
                disabled={savingStore}
                className="inline-flex items-center gap-1.5 bg-[#0c0c0c] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Settings size={12} />
                {savingStore ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}