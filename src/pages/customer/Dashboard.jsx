import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatPrice, formatDate } from '../../utils/helpers'
import { ShoppingBag, DollarSign, Package } from 'lucide-react'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ totalSpent: 0, totalOrders: 0, activeOrders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, products(name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    if (data) {
      setStats({
        totalSpent: data.reduce((s, o) => s + Number(o.total_price), 0),
        totalOrders: data.length,
        activeOrders: data.filter(o => ['pending_payment', 'paid', 'processing'].includes(o.status)).length,
      })
    }
    setLoading(false)
  }

  const statusLabel = (status) => {
    const map = {
      pending_payment: 'Pending',
      paid: 'Paid',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }
    return map[status] || status
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1">
        {user?.email}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-5 mt-8">
        <div className="border border-gray-200 rounded-lg p-3 md:p-4">
          <ShoppingBag size={16} className="text-gray-400 mb-2" strokeWidth={1.5} />
          <div className="text-lg md:text-xl font-bold tabular-nums">{stats.totalOrders}</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Orders</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 md:p-4">
          <DollarSign size={16} className="text-gray-400 mb-2" strokeWidth={1.5} />
          <div className="text-lg md:text-xl font-bold tabular-nums">{formatPrice(stats.totalSpent)}</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Spent</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 md:p-4">
          <Package size={16} className="text-gray-400 mb-2" strokeWidth={1.5} />
          <div className="text-lg md:text-xl font-bold tabular-nums">{stats.activeOrders}</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Active</div>
        </div>
      </div>

      {/* Orders */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Orders</h2>

        {orders.length === 0 ? (
          <div className="border border-gray-200 rounded-lg py-12 text-center">
            <Package size={32} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
            <p className="text-sm text-gray-500">No orders yet.</p>
            <Link
              to="/products"
              className="inline-block bg-[#0c0c0c] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors mt-4"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {orders.map(o => (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 mr-3">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {o.products?.name || 'Product'}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatDate(o.created_at)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold tabular-nums">{formatPrice(o.total_price)}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{statusLabel(o.status)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}