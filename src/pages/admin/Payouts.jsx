import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatPrice, formatDate } from '../../utils/helpers'
import { DollarSign } from 'lucide-react'

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('payouts').select('*, users(full_name)').order('created_at', { ascending: false })
      .then(({ data }) => { setPayouts(data || []); setLoading(false) })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Payouts</h1>
      <p className="text-sm text-gray-500 mt-1">{payouts.length} payout{payouts.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex justify-between">
                <div><div className="h-4 bg-gray-100 rounded w-24 mb-2" /><div className="h-3 bg-gray-100 rounded w-20" /></div>
                <div className="text-right"><div className="h-4 bg-gray-100 rounded w-16 mb-2" /><div className="h-3 bg-gray-100 rounded w-10" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : payouts.length === 0 ? (
        <div className="mt-6 border border-gray-200 rounded-lg py-12 text-center">
          <DollarSign size={28} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">No payouts yet.</p>
        </div>
      ) : (
        <div className="mt-6 border border-gray-200 rounded-lg divide-y divide-gray-200">
          {payouts.map(p => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3.5">
              <div className="min-w-0 mr-3">
                <div className="text-sm font-medium text-gray-900">{p.users?.full_name || 'Supplier'}</div>
                <div className="text-xs text-gray-400 mt-0.5">{formatDate(p.created_at)}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold tabular-nums">{formatPrice(p.amount)}</div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 inline-block px-2 py-0.5 rounded ${
                  p.status === 'paid' ? 'bg-[#0c0c0c] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {p.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}