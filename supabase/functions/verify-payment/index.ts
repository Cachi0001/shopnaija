
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { reference } = await req.json()

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`
      }
    })

    const verifyData = await verifyResponse.json()

    if (!verifyData.status) {
      throw new Error('Payment verification failed')
    }

    const transaction = verifyData.data

    if (transaction.status === 'success') {
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_date: new Date().toISOString()
        })
        .eq('order_reference', reference)

      if (updateError) {
        throw updateError
      }

      // Send notification to admin
      const orderId = transaction.metadata.order_id
      const adminId = transaction.metadata.admin_id

      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: adminId,
          title: 'New Sale!',
          body: `Order ${reference} has been paid`,
          data: { type: 'sale_notification', order_id: orderId }
        })
      })

      return new Response(
        JSON.stringify({ success: true, transaction }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Update order as failed
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('order_reference', reference)

      return new Response(
        JSON.stringify({ success: false, message: 'Payment failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in verify-payment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
