
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    )

    const { method, admin_id, customer_id, items } = await req.json()

    if (method === 'GET') {
      const { data, error } = await supabase
        .from('cart')
        .select('*')
        .eq('admin_id', admin_id)
        .eq('customer_id', customer_id || null)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return new Response(
        JSON.stringify(data || { items: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (method === 'UPDATE') {
      const { data, error } = await supabase
        .from('cart')
        .upsert({
          admin_id,
          customer_id: customer_id || null,
          items
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in manage-cart:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
