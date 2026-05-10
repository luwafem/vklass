import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatPrice, formatDate } from '../../utils/helpers'
import { Receipt } from 'lucide-react'

export default function SupplierOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: prods } = await supabase.from('products').select('id').eq('supplier_id', user.id)
      const prodIds = prods?.map(p => p.id) || []
      if (prodIds.length === 0) { setLoading(false); return }
      const { data } = await supabase.from('orders').select('*, products(name)').in('product_id', prodIds).order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  const statusLabel = (status) => {
    const map = { pending_payment: 'Pending', paid: 'Paid', processing: 'Processing', completed: 'Completed', cancelled: 'Cancelled' }
    return map[status] || status
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Sales</h1>
      <p className="text-sm text-gray-500 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 border border-gray-200 rounded-lg py-12 text-center">
          <Receipt size={28} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">No sales yet.</p>
        </div>
      ) : (
        <div className="mt-6 border border-gray-200 rounded-lg divide-y divide-gray-200">
          {orders.map(o => (
            <div key={o.id} className="flex items-center justify-between px-4 py-3.5">
              <div className="min-w-0 mr-3">
                <div className="text-sm font-medium text-gray-900 truncate">{o.products?.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{formatDate(o.created_at)}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold tabular-nums">{formatPrice(o.supplier_share)}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{statusLabel(o.status)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}