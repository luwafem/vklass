import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatPrice, formatDate } from '../utils/helpers'
import { ArrowLeft, Package } from 'lucide-react'

const STATUS_STEPS = ['pending_payment', 'paid', 'processing', 'completed']

function StatusTimeline({ status }) {
  const currentIdx = STATUS_STEPS.indexOf(status)
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="py-3 text-center">
        <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
          Cancelled
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0 my-5">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-initial">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              i <= currentIdx
                ? 'bg-[#0c0c0c] text-white'
                : 'border border-gray-300 text-gray-400'
            }`}
          >
            {i < currentIdx ? '✓' : i + 1}
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-1.5 ${i < currentIdx ? 'bg-[#0c0c0c]' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, products(name, platform)')
        .eq('id', id)
        .single()
      setOrder(data)
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="h-5 bg-gray-100 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="h-5 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center">
        <Package size={32} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-gray-800">Order not found</h2>
        <Link
          to="/customer/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0c0c0c] mt-3 hover:underline"
        >
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>
    )
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
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <Link
        to="/customer/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Orders
      </Link>

      <div className="border border-gray-200 rounded-lg">
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold">Order Details</h1>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{order.id}</p>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {statusLabel(order.status)}
            </span>
          </div>

          <StatusTimeline status={order.status} />
        </div>

        {/* Order info */}
        <div className="px-5 pb-5 space-y-2.5 text-sm border-t border-gray-200 pt-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Product</span>
            <span className="text-right font-medium ml-3">{order.products?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Platform Fee</span>
            <span className="tabular-nums">{formatPrice(order.platform_fee)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-gray-200 pt-2.5 mt-1">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.total_price)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-gray-500">Created</span>
            <span className="text-gray-500">{formatDate(order.created_at)}</span>
          </div>
        </div>

        {/* Credentials */}
        {(order.status === 'paid' || order.status === 'completed') && order.delivery_details?.credentials && (
          <div className="border-t border-gray-200 px-5 py-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <Package size={13} /> Delivery
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-sm space-y-2">
              {Object.entries(order.delivery_details.credentials).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-gray-500 capitalize text-xs">{k}</span>
                  <span className="font-mono text-xs font-medium text-right break-all">{String(v)}</span>
                </div>
              ))}
            </div>
            {order.delivery_details.attributes && Object.keys(order.delivery_details.attributes).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {Object.entries(order.delivery_details.attributes).map(([k, v]) => (
                  <span
                    key={k}
                    className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                  >
                    {k}: {String(v)}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}