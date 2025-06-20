
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { nin } = await req.json()

    // Nigerian NIN validation: 11 digits
    const ninRegex = /^\d{11}$/
    const cleanNin = nin.replace(/[\s-]/g, '')

    const isValid = ninRegex.test(cleanNin)

    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid NIN: Must be an 11-digit number' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ valid: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in validate-nin:', error)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Please enter a valid 11-digit NIN' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
