import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatPrice, formatDate } from '../../utils/helpers'
import { ShoppingBag } from 'lucide-react'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('orders').select('*, products(name), users(full_name)').order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [])

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
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">All Orders</h1>
      <p className="text-sm text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex justify-between">
                <div>
                  <div className="h-4 bg-gray-100 rounded w-40 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-100 rounded w-16 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 border border-gray-200 rounded-lg py-12 text-center">
          <ShoppingBag size={28} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">No orders yet.</p>
        </div>
      ) : (
        <div className="mt-6 border border-gray-200 rounded-lg divide-y divide-gray-200">
          {orders.map(o => (
            <div key={o.id} className="flex items-center justify-between px-4 py-3.5">
              <div className="min-w-0 mr-3">
                <div className="text-sm font-medium text-gray-900 truncate">{o.products?.name || 'Product'}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {o.users?.full_name || 'Unknown'} · {formatDate(o.created_at)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold tabular-nums">{formatPrice(o.total_price)}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{statusLabel(o.status)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}