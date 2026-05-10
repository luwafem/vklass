import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatPrice, formatDate } from '../../utils/helpers'
import { DollarSign } from 'lucide-react'

export default function SupplierPayouts() {
  const { user } = useAuth()
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('payouts').select('*').eq('supplier_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setPayouts(data || []); setLoading(false) })
  }, [user])

  const statusLabel = (status) => status === 'paid' ? 'Paid' : 'Pending'

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Payouts</h1>
      <p className="text-sm text-gray-500 mt-0.5">Processed automatically to your bank account</p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
          ))}
        </div>
      ) : payouts.length === 0 ? (
        <div className="mt-6 border border-gray-200 rounded-lg py-12 text-center">
          <DollarSign size={28} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">No payouts yet.</p>
          <p className="text-xs text-gray-400 mt-1">Payouts are processed automatically to your bank.</p>
        </div>
      ) : (
        <div className="mt-6 border border-gray-200 rounded-lg divide-y divide-gray-200">
          {payouts.map(p => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3.5">
              <div>
                <div className="text-sm font-semibold tabular-nums">{formatPrice(p.amount)}</div>
                <div className="text-xs text-gray-400 mt-0.5">{formatDate(p.created_at)}</div>
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                p.status === 'paid' ? 'bg-[#0c0c0c] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {statusLabel(p.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}