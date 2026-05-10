import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { formatPrice, calcOrderBreakdown } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const { productId, itemName, itemPrice } = location.state || {}

  if (!productId || !user) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-sm text-gray-500">No checkout session found.</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 text-sm font-medium text-[#0c0c0c] hover:underline"
        >
          Browse Products
        </button>
      </div>
    )
  }

  const price = Number(itemPrice)
  const breakdown = calcOrderBreakdown(price)

  const handlePayment = async () => {
    setLoading(true)
    try {
      const reference = `vklass_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          product_id: productId,
          subtotal: breakdown.subtotal,
          platform_fee: breakdown.platformFee,
          payment_reference: reference,
          status: 'pending_payment',
        })
        .select()
        .single()

      if (orderError) throw orderError

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('initialize-payment', {
        body: { order_id: order.id, customer_email: user.email },
      })

      if (paymentError) {
        let errMsg = paymentError.message
        try {
          const resText = await paymentError.context?.text()
          if (resText) {
            const parsed = JSON.parse(resText)
            errMsg = parsed.error || errMsg
          }
        } catch (e) {}
        throw new Error(errMsg)
      }

      if (window.PaystackPop) {
        const transactionArgs = {
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: user.email,
          amount: breakdown.totalPrice * 100,
          reference: reference,
          onSuccess: () => {
            toast.success('Payment successful! Verifying…')
            navigate(`/order-success?order_id=${order.id}`)
          },
          onCancel: () => {
            toast('Payment window closed', { icon: '⚠️' })
            setLoading(false)
          },
        }

        if (paymentData?.subaccount_code) {
          transactionArgs.subaccount = paymentData.subaccount_code
          transactionArgs.transaction_charge = paymentData.platform_share_kobo
        }

        new window.PaystackPop().newTransaction(transactionArgs)
      } else {
        throw new Error('Payment gateway failed to load. Please refresh the page.')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16 md:py-20">
      <h1 className="text-xl font-bold tracking-tight">Checkout</h1>
      <p className="text-sm text-gray-500 mt-1">Review your order before paying</p>

      <div className="mt-8 border border-gray-200 rounded-lg">
        {/* Item */}
        <div className="px-5 pt-5 pb-4">
          <h2 className="font-semibold text-sm">{itemName}</h2>
        </div>

        {/* Breakdown */}
        <div className="border-t border-gray-200 px-5 py-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Product Price</span>
            <span className="tabular-nums">{formatPrice(breakdown.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Platform Fee</span>
            <span className="tabular-nums">{formatPrice(breakdown.platformFee)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 px-5 py-3 flex justify-between items-center">
          <span className="font-bold text-sm">Total</span>
          <span className="font-bold text-lg tabular-nums">{formatPrice(breakdown.totalPrice)}</span>
        </div>

        {/* Pay button */}
        <div className="border-t border-gray-200 px-5 py-4">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#0c0c0c] text-white font-semibold text-sm py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Processing…' : `Pay ${formatPrice(breakdown.totalPrice)}`}
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-3">
            A secure Paystack pop-up will appear. You won't leave this page.
          </p>
        </div>
      </div>
    </div>
  )
}