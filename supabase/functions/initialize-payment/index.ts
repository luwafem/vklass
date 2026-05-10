import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, customer_email } = await req.json()
    if (!order_id || !customer_email) throw new Error('Missing order_id or customer_email')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Server is missing required environment variables.')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, products!inner(supplier_id)')
      .eq('id', order_id)
      .single()

    if (orderError) {
      return new Response(JSON.stringify({ error: 'DB Error: ' + orderError.message }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (order.status !== 'pending_payment') throw new Error('Order already processed')

    // Fetch supplier's bank details securely
    const { data: supplier } = await supabase
      .from('users')
      .select('bank_details')
      .eq('id', order.products.supplier_id)
      .single()

    const subaccount_code = supplier?.bank_details?.subaccount_code || null
    const platform_share_kobo = Math.round((Number(order.commission) + Number(order.platform_fee)) * 100)

    // CHANGED: Return secure split parameters to the frontend instead of calling Paystack API
    // The frontend will use these to open the Inline Modal securely
    return new Response(
      JSON.stringify({ 
        subaccount_code: subaccount_code,
        platform_share_kobo: platform_share_kobo,
        order_total_kobo: order.total_price * 100
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})