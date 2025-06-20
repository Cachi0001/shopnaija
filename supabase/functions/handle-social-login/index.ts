
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

    const { user, metadata } = await req.json()

    // Validate required fields for admin social login
    const requiredFields = ['name', 'email', 'phone', 'nin']
    const missingFields = requiredFields.filter(field => !metadata[field])

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: `Incomplete profile. Missing: ${missingFields.join(', ')}. Please complete your profile to continue.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate NIN format (11 digits)
    const ninRegex = /^\d{11}$/
    if (!ninRegex.test(metadata.nin)) {
      return new Response(
        JSON.stringify({ error: 'Invalid NIN: Must be an 11-digit number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user profile with admin metadata
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: metadata.name,
        phone: metadata.phone,
        nin: metadata.nin,
        role: 'admin',
        subdomain: metadata.subdomain,
        website_name: metadata.website_name,
        primary_color: metadata.primary_color || '#00A862',
        is_active: true,
        email_verified: false,
        phone_verified: false
      })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, subdomain: metadata.subdomain }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in handle-social-login:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
