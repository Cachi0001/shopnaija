import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { order_id, email, amount, admin_id, customer_name, customer_phone } = await req.json();
    // Get admin details
    const { data: admin, error: adminError } = await supabase.from('users').select('paystack_subaccount_code, phone, website_name').eq('id', admin_id).single();
    if (adminError || !admin) {
      throw new Error('Admin not found');
    }
    // Get order details
    const { data: order, error: orderError } = await supabase.from('orders').select('order_details').eq('id', order_id).single();
    if (orderError || !order || !order.order_details) {
      throw new Error('Order details not found');
    }
    // Fetch all product details in one query
    const productIds = order.order_details.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase.from('products').select('id, original_price, price, adjusted_price, paystack_fee').in('id', productIds);
    if (productsError || !products) {
      throw new Error('Failed to fetch product details');
    }
    // Calculate admin total original price with fallback
    let adminTotalOriginalPrice = 0;
    for (const item of order.order_details) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      const price = product.price || product.original_price || item.price || 0.00;
      adminTotalOriginalPrice += price * item.quantity;
    }
    // Generate unique order reference
    const orderReference = `GSB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    // Initialize Paystack payment with flat split
    const paystackSecretKey = Deno.env.get('PAYSTACK_LIVE_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }
    let subaccountConfig = [];
    if (admin.paystack_subaccount_code) {
      subaccountConfig = [
        {
          subaccount: admin.paystack_subaccount_code,
          share: adminTotalOriginalPrice * 100
        }
      ];
    } else {
      console.warn(`No subaccount code for admin ${admin_id}, using main account`);
      // Optionally use the main Paystack account without split
    }
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        reference: orderReference,
        callback_url: `https://preview--grow-small-beez.lovable.app/payment-success?reference=${orderReference}`,
        webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paystack-webhook`,
        metadata: {
          order_id,
          admin_id,
          customer_name,
          customer_phone,
          admin_phone: admin.phone,
          website_name: admin.website_name,
          custom_fields: [
            { display_name: "Order Reference", variable_name: "order_reference", value: orderReference },
            { display_name: "Store Name", variable_name: "store_name", value: admin.website_name }
          ]
        },
        split: subaccountConfig.length > 0 ? {
          type: "flat",
          currency: "NGN",
          subaccounts: subaccountConfig,
          bearer_type: "account",
          bearer_subaccount: undefined
        } : undefined // Remove split if no subaccount
      })
    });
    const paystackData = await paystackResponse.json();
    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Payment initialization failed');
    }
    // Update order with payment reference
    await supabase.from('orders').update({
      order_reference: orderReference,
      payment_status: 'pending',
      customer_name,
      customer_email: email,
      customer_phone,
      total_amount: amount
    }).eq('id', order_id);
    return new Response(JSON.stringify({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: orderReference,
      redirect_url: `https://wa.me/${admin.phone}?text=${encodeURIComponent(`Hello! I just completed payment for order ${orderReference} worth ₦${amount.toLocaleString()}. Please confirm and prepare my items for delivery. Customer: ${customer_name}, Phone: ${customer_phone}`)}`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in process-payment:', error.message, {
      stack: error.stack
    });
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});