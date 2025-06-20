
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

    const { admin_id, order_reference } = await req.json()

    // Get admin details
    const { data: admin, error } = await supabase
      .from('users')
      .select('name, phone')
      .eq('id', admin_id)
      .single()

    if (error || !admin) {
      throw new Error('Admin not found')
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = admin.phone?.replace(/\D/g, '')
    
    if (!cleanPhone) {
      return new Response(
        JSON.stringify({
          success: false,
          admin_name: admin.name,
          message: 'WhatsApp contact not available. Please contact the store directly.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ensure phone has country code
    const phoneWithCountryCode = cleanPhone.startsWith('234') ? cleanPhone : `234${cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone}`

    const message = encodeURIComponent(
      `Hello! I just purchased from your store. Order Reference: ${order_reference}. Please confirm my order and provide delivery details.`
    )

    const whatsappLink = `https://wa.me/${phoneWithCountryCode}?text=${message}`

    return new Response(
      JSON.stringify({
        success: true,
        admin_name: admin.name,
        admin_phone: admin.phone,
        whatsapp_link: whatsappLink,
        order_reference
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-whatsapp-link:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
