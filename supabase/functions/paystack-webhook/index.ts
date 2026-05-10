import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // INSTANT LOG: This proves if Paystack is even reaching us
  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  await supabaseAdmin.from('logs').insert({ function_name: 'webhook-hit', level: 'info', message: 'Webhook endpoint was just hit!' })

  try {
    const body = await req.text()
    const event = JSON.parse(body)

    if (event.event === 'charge.success') {
      const reference = event.data?.reference
      if (!reference) throw new Error("Missing reference")

      // 1. Find the pending order
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*, products!inner(supplier_id, is_sold, credentials)')
        .eq('payment_reference', reference)
        .single()

      if (orderError || !order || order.status !== 'pending_payment') {
        return new Response('Ignored', { status: 200, headers: corsHeaders })
      }

      // SECURITY: Verify amount
      const paidAmountKobo = event.data.amount;
      const expectedAmountKobo = Number(order.total_price) * 100;
      if (paidAmountKobo !== expectedAmountKobo) {
        await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
        await supabaseAdmin.from('logs').insert({ function_name: 'webhook', level: 'error', message: `Amount mismatch. Expected ${expectedAmountKobo}, got ${paidAmountKobo}` })
        return new Response('Amount mismatch', { status: 400, headers: corsHeaders })
      }

      if (order.products.is_sold) {
        await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
        return new Response('Sold out', { status: 200, headers: corsHeaders })
      }

      await supabaseAdmin.from('products').update({ is_sold: true }).eq('id', order.product_id)
      await supabaseAdmin.from('orders').update({
        status: 'completed', 
        delivery_details: { credentials: order.products.credentials }
      }).eq('id', order.id)
      
      const supplierId = order.products.supplier_id
      await supabaseAdmin.from('payouts').insert({ supplier_id: supplierId, order_id: order.id, amount: order.supplier_share, status: 'auto_settled', paid_at: new Date().toISOString() })
      await supabaseAdmin.from('transactions').insert({ order_id: order.id, amount: order.total_price, type: 'customer_payment', status: 'success', gateway_reference: String(event.data.id) })
      await supabaseAdmin.from('notifications').insert([
        { user_id: order.customer_id, type: 'order', title: 'Order Completed!', message: 'Your order has been delivered.' },
        { user_id: supplierId, type: 'payout', title: 'New Sale!', message: `You made a sale! ₦${order.supplier_share} sent to bank.` }
      ])
    }
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    await supabaseAdmin.from('logs').insert({ function_name: 'webhook', level: 'error', message: err.message })
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})