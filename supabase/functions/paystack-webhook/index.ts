
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

    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()
    
    // Enhanced webhook signature verification with proper secret
    const secretKey = Deno.env.get('PAYSTACK_LIVE_SECRET_KEY')
    if (!secretKey) {
      console.error('Paystack secret key not configured')
      return new Response('Server configuration error', { status: 500 })
    }

    // Verify webhook signature using the correct secret key
    const hash = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secretKey),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    )
    
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      hash,
      new TextEncoder().encode(body)
    )
    
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedHex) {
      console.log('Invalid webhook signature')
      return new Response('Unauthorized', { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('PayStack webhook event:', event)

    if (event.event === 'charge.success') {
      const { data } = event
      const reference = data.reference
      
      // Validate payment data
      if (!reference || !data.amount || !data.customer?.email) {
        console.error('Invalid payment data received')
        return new Response('Invalid payment data', { status: 400 })
      }

      // Update order status with additional security checks
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_date: new Date().toISOString(),
          payment_reference: reference
        })
        .eq('order_reference', reference)
        .eq('total_amount', data.amount / 100) // Convert from kobo and verify amount
        .select('*, admin_id, customer_name, customer_email, total_amount')
        .single()

      if (orderError) {
        console.error('Error updating order:', orderError)
        throw orderError
      }

      // Verify the order belongs to the correct admin
      const { data: admin, error: adminError } = await supabase
        .from('users')
        .select('name, phone, website_name, account_number')
        .eq('id', orderData.admin_id)
        .eq('role', 'admin')
        .single()

      if (!adminError && admin) {
        // Send push notification to admin
        await supabase.functions.invoke('send-push-notification', {
          body: {
            recipient_id: orderData.admin_id,
            title: '🎉 New Sale!',
            body: `${orderData.customer_name} just bought items worth ₦${orderData.total_amount.toLocaleString()}`,
            data: { 
              type: 'sale_notification', 
              order_id: orderData.id,
              amount: orderData.total_amount,
              customer: orderData.customer_name
            }
          }
        })

        // Create notification in database with audit logging
        await supabase.from('notifications').insert({
          recipient_id: orderData.admin_id,
          message: `New order ₦${orderData.total_amount.toLocaleString()} from ${orderData.customer_name}`,
          type: 'sale_notification'
        })

        // Log audit trail
        await supabase.from('audit_logs').insert({
          user_id: orderData.admin_id,
          action: 'payment_completed',
          table_name: 'orders',
          record_id: orderData.id,
          new_values: { payment_status: 'completed', reference },
          ip_address: req.headers.get('x-forwarded-for'),
          user_agent: req.headers.get('user-agent')
        })
      }

      console.log('Payment processed successfully for order:', reference)
    }

    return new Response(
      JSON.stringify({ status: 'success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in paystack-webhook:', error)
    
    // Log security errors for monitoring
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabase.from('audit_logs').insert({
        action: 'webhook_error',
        table_name: 'paystack_webhook',
        new_values: { error: error.message },
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent')
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
