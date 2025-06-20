import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedOrigins = [
  'https://preview--grow-small-beez.lovable.app',
  'https://preview--grow-small-beez.lovable.app/admin/dashboard',
  'https://preview--grow-small-beez.lovable.app/auth',
  'https://preview--grow-small-beez.lovable.app/dashboard'
]; // Add more specific storefront subdomains as needed

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    ...(origin && allowedOrigins.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
  };

  // Handle CORS OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { order_id, email, amount, admin_id, customer_name, customer_phone } = await req.json();

    if (!order_id || !email || typeof amount !== 'number' || !admin_id || !customer_name || !customer_phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters for payment initiation.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: paymentData, error: invokeError } = await supabaseAdmin.functions.invoke('process-payment', {
      body: { order_id, email, amount, admin_id, customer_name, customer_phone },
    });

    if (invokeError) {
      console.error('Error invoking process-payment:', invokeError);
      if (invokeError.context && invokeError.context.body && invokeError.context.body.error) {
        return new Response(JSON.stringify({ error: invokeError.context.body.error }), {
          status: invokeError.context.status || 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(
          JSON.stringify({ error: `Failed to process payment: ${invokeError.message || 'An unknown error occurred.'}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(JSON.stringify(paymentData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in initiate-payment Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
