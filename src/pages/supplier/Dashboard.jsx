import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatPrice } from '../../utils/helpers'
import { ShoppingBag, DollarSign, Package, AlertTriangle, Plus, List, Receipt, Landmark } from 'lucide-react'

export default function SupplierDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ products: 0, items: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchStats()
  }, [user])

  const fetchStats = async () => {
    const { data: prods } = await supabase.from('products').select('id').eq('supplier_id', user.id)
    const { data: items } = await supabase.from('product_items').select('id').eq('is_sold', false).in('product_id', prods?.map(p => p.id) || [])
    const { data: orders } = await supabase.from('orders').select('supplier_share').eq('status', 'completed').in('product_id', prods?.map(p => p.id) || [])

    setStats({
      products: prods?.length || 0,
      items: items?.length || 0,
      revenue: orders?.reduce((s, o) => s + Number(o.supplier_share), 0) || 0
    })
    setLoading(false)
  }

  const needsBankSetup = !profile?.bank_details?.subaccount_code

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
    </div>
  )
}