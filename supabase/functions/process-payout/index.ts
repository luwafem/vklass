import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { supplier_id, order_id, amount } = await req.json()
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY')

    const { data: supplier } = await supabase.from('users').select('bank_details').eq('id', supplier_id).single()
    const recipient_code = supplier?.bank_details?.recipient_code || supplier?.bank_details?.subaccount_code

    if (!recipient_code) throw new Error('Supplier has no bank details configured')

    const response = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'balance', amount: amount * 100, recipient: recipient_code, reason: `vklass Manual Payout - Order ${order_id}` }),
    })

    const data = await response.json()

    if (data.status) {
      await supabase.from('payouts').update({ status: 'paid', paid_at: new Date().toISOString(), transfer_reference: data.data.transfer_code }).eq('order_id', order_id).eq('supplier_id', supplier_id)
      await supabase.from('notifications').insert({ user_id: supplier_id, type: 'payout', title: 'Manual Payout Processed!', message: `₦${amount} has been sent to your bank account by vklass Admin.` })
    } else {
      await supabase.from('payouts').update({ status: 'failed' }).eq('order_id', order_id).eq('supplier_id', supplier_id)
    }

    return new Response(JSON.stringify({ success: data.status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})