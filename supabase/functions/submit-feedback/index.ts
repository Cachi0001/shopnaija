
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

    const { 
      email, 
      phone, 
      order_reference, 
      product_id, 
      rating, 
      comment, 
      customer_name 
    } = await req.json()

    // Verify order exists and belongs to customer
    let orderQuery = supabase
      .from('orders')
      .select('admin_id, customer_id')
      .eq('order_reference', order_reference)
      .eq('payment_status', 'completed')

    if (email) {
      orderQuery = orderQuery.eq('customer_email', email)
    } else if (phone) {
      orderQuery = orderQuery.eq('customer_phone', phone)
    } else {
      throw new Error('Email or phone required')
    }

    const { data: order, error: orderError } = await orderQuery.maybeSingle()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found or payment not completed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create feedback
    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert({
        admin_id: order.admin_id,
        customer_id: order.customer_id,
        product_id,
        customer_name,
        rating,
        comment,
        is_review: true,
        is_approved: false
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Send notification to admin
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient_id: order.admin_id,
        title: 'New Review Received',
        body: `${customer_name} left a ${rating}-star review`,
        data: { type: 'feedback_received', feedback_id: feedback.id }
      })
    })

    return new Response(
      JSON.stringify({ success: true, feedback }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in submit-feedback:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
