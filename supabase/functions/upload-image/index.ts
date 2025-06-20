
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
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)))
    const dataUrl = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const cloudinaryData = new FormData()
    cloudinaryData.append('file', dataUrl)
    cloudinaryData.append('upload_preset', 'shopnaija_preset') // You'll need to create this preset
    cloudinaryData.append('cloud_name', Deno.env.get('CLOUDINARY_CLOUD_NAME') || 'dkogzpxhn')

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${Deno.env.get('CLOUDINARY_CLOUD_NAME') || 'dkogzpxhn'}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryData,
      }
    )

    const result = await cloudinaryResponse.json()

    if (!cloudinaryResponse.ok) {
      throw new Error(result.error?.message || 'Upload failed')
    }

    return new Response(
      JSON.stringify({
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in upload-image:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
