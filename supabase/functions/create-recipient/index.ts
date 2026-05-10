import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { bank_name, bank_code, account_number, account_name } = await req.json()
    
    if (!bank_name || !bank_code || !account_number || !account_name) {
      throw new Error("Missing required bank details")
    }

    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackKey) throw new Error("Paystack secret key missing in environment")

    // Call Paystack API to create a Sub-Account
    const response = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: `${account_name} - vklass Supplier`,
        bank_code: bank_code,
        account_number: account_number,
        percentage_charge: 0, // We handle dynamic split amounts in initialize-payment
      }),
    })

    const data = await response.json()

    if (!data.status) {
      throw new Error(data.message || 'Failed to create Paystack subaccount')
    }

    // Return the unique subaccount code to be saved in the supplier's profile
    return new Response(
      JSON.stringify({ subaccount_code: data.data.subaccount_code }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})