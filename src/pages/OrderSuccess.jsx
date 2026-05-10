import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, Package, LogIn } from 'lucide-react'

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setErrorMsg('Your session was lost during the Paystack redirect. Please log in again to view your order.')
      setLoading(false)
      return
    }

    if (!orderId) {
      setErrorMsg('No order ID found in the URL.')
      setLoading(false)
      return
    }

    let interval
    const poll = async () => {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (fetchError) {
        console.error('Supabase Fetch Error:', fetchError)
        setErrorMsg('Database Error: ' + fetchError.message)
        setLoading(false)
        clearInterval(interval)
        return
      }

      setOrder(data)
      if (data?.status === 'paid' || data?.status === 'completed') {
        setLoading(false)
        clearInterval(interval)
      }
    }
    poll()
    interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [orderId, user, authLoading])

  // Auth loading
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-[#0c0c0c] mx-auto mb-3" />
        <p className="text-xs text-gray-500">Loading secure session…</p>
      </div>
    )
  }

  // Error state
  if (errorMsg) {
    const redirectUrl = `/order-success?order_id=${orderId}`
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <h1 className="text-lg font-bold mb-2">Action Required</h1>
        <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
        <Link
          to={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
          className="inline-flex items-center gap-2 bg-[#0c0c0c] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogIn size={15} /> Log In to View Order
        </Link>
      </div>
    )
  }

  // Polling state
  if (loading) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-[#0c0c0c] mx-auto mb-4" />
        <h1 className="text-lg font-bold">Verifying payment</h1>
        <p className="text-xs text-gray-400 mt-1.5 font-mono">{orderId}</p>
        <p className="text-sm text-gray-500 mt-3">Please wait while we confirm your payment.</p>
      </div>
    )
  }

  // Success
  return (
    <div className="max-w-md mx-auto px-5 py-16 md:py-20">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={20} className="text-emerald-600" />
        </div>
        <h1 className="text-lg font-bold">Payment Successful</h1>
        <p className="text-sm text-gray-500 mt-1">Your order has been confirmed.</p>
      </div>

      {/* Credentials */}
      {order?.delivery_details?.credentials && (
        <div className="mt-8 border border-gray-200 rounded-lg">
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Package size={12} /> Your Delivery
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 rounded-b-lg">
            <div className="space-y-2 text-sm">
              {typeof order.delivery_details.credentials === 'object' ? (
                Object.entries(order.delivery_details.credentials).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-gray-500 capitalize text-xs">{k}</span>
                    <span className="font-mono text-xs font-medium text-right break-all">{String(v)}</span>
                  </div>
                ))
              ) : (
                <div className="font-mono text-xs break-all">{String(order.delivery_details.credentials)}</div>
              )}
            </div>
          </div>
          <div className="px-4 py-2.5 border-t border-gray-200">
            <p className="text-[11px] text-amber-700">
              Save these credentials securely — they may not be shown again.
            </p>
          </div>
        </div>
      )}

      {/* Missing credentials fallback */}
      {order?.status === 'completed' && !order?.delivery_details?.credentials && (
        <div className="mt-8 border border-amber-200 rounded-lg px-4 py-3 bg-amber-50">
          <p className="text-xs text-amber-800">
            Payment confirmed, but credentials are missing. Please contact support with your Order ID.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-2">
        <Link
          to={`/orders/${orderId}`}
          className="text-center bg-[#0c0c0c] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          View Order
        </Link>
        <Link
          to="/products"
          className="text-center text-sm text-gray-500 hover:text-gray-900 py-2 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}