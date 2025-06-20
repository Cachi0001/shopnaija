import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    serve(async (req) => {
      if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        console.log('Using service role key:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Yes' : 'No');

        const { 
          admin_id, 
          customer_id, 
          customer_name, 
          customer_email, 
          customer_phone, 
          order_details, 
          total_amount 
        } = await req.json();

        // Validate required fields
        if (!admin_id || !customer_name || !customer_email || !customer_phone || !order_details || typeof total_amount !== 'number') {
          throw new Error('Missing required fields');
        }

        // Validate order_details structure
        if (!Array.isArray(order_details) || order_details.length === 0) {
          throw new Error('order_details must be a non-empty array');
        }

        for (const item of order_details) {
          if (!item.product_id || !item.quantity || typeof item.price !== 'number') {
            throw new Error('Each order item must have product_id, quantity, and price');
          }
          if (item.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
          }
          if (item.price < 0) {
            throw new Error('Price must be non-negative');
          }
        }

        // Fetch products to validate prices
        const productIds = order_details.map(item => item.product_id);
        const { data: products, error: productError } = await supabase
          .from('products')
          .select('id, price, original_price')
          .in('id', productIds);

        if (productError) throw productError;
        if (!products || products.length !== productIds.length) {
          throw new Error('One or more products not found');
        }

        // Validate order_details prices against products and calculate total
        let calculatedTotal = 0;
        for (const item of order_details) {
          const product = products.find(p => p.id === item.product_id);
          if (!product) {
            throw new Error(`Product ${item.product_id} not found`);
          }
          if (Math.abs(item.price - product.price) > 0.01) {
            throw new Error(`Price mismatch for product ${item.product_id}. Expected: ${product.price}, Received: ${item.price}`);
          }
          calculatedTotal += item.price * item.quantity;
        }

        // Validate total_amount
        if (Math.abs(calculatedTotal - total_amount) > 0.01) {
          throw new Error(`Total amount mismatch. Calculated: ${calculatedTotal}, Received: ${total_amount}`);
        }

        // Generate order reference
        const orderReference = `GSB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Create order
        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            admin_id,
            customer_id: customer_id || null,
            customer_name,
            customer_email,
            customer_phone,
            order_details,
            total_amount,
            order_reference: orderReference,
            payment_status: 'pending',
            tracking_status: 'processing'
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // If customer is not logged in, create/update customer record
        if (!customer_id && customer_email) {
          await supabase
            .from('users')
            .upsert({
              email: customer_email,
              name: customer_name,
              phone: customer_phone,
              role: 'customer'
            }, { 
              onConflict: 'email'
            });
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            order,
            order_reference: orderReference 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Checkout error:', error.message, { stack: error.stack });
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    });