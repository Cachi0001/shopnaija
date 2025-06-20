
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation helper
function validateAndSanitizeInput(input: string | null, maxLength: number = 100): string | null {
  if (!input) return null;
  
  // Remove potentially harmful characters
  const sanitized = input.replace(/[<>\"']/g, '').trim();
  
  // Limit length to prevent abuse
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
}

function validateNumericInput(input: string | null): number | null {
  if (!input) return null;
  
  const num = parseInt(input);
  return isNaN(num) || num < 0 ? null : num;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    
    // Validate and sanitize all inputs
    const subdomain = validateAndSanitizeInput(url.searchParams.get('subdomain'), 50)
    const search = validateAndSanitizeInput(url.searchParams.get('search'), 200)
    const category = validateAndSanitizeInput(url.searchParams.get('category'), 50)
    const location = validateAndSanitizeInput(url.searchParams.get('location'), 100)
    const limit = validateNumericInput(url.searchParams.get('limit')) || 50
    const offset = validateNumericInput(url.searchParams.get('offset')) || 0

    // Enforce reasonable limits to prevent abuse
    const safeLimit = Math.min(limit, 100)
    const safeOffset = Math.max(offset, 0)

    let query = supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        image_url,
        location,
        created_at,
        admin_id,
        categories(name),
        feedback(rating, comment, is_approved)
      `)

    // Apply subdomain filter with proper validation
    if (subdomain) {
      // First verify the subdomain exists and is active
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('id, is_active')
        .eq('subdomain', subdomain)
        .eq('role', 'admin')
        .single()

      if (adminError || !adminData?.is_active) {
        return new Response(
          JSON.stringify({ error: 'Store not found or inactive' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      query = query.eq('admin_id', adminData.id)
    }

    // Apply search filters with proper escaping
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }
    
    if (category) {
      query = query.eq('category_id', category)
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    // Apply pagination and ordering
    const { data: products, error } = await query
      .order('created_at', { ascending: false })
      .range(safeOffset, safeOffset + safeLimit - 1)

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // Process products to include approved feedback only and calculate ratings
    const processedProducts = products?.map(product => {
      const approvedFeedback = product.feedback?.filter((f: any) => f.is_approved) || []
      const totalRating = approvedFeedback.reduce((sum: number, f: any) => sum + f.rating, 0)
      const averageRating = approvedFeedback.length > 0 ? totalRating / approvedFeedback.length : 0

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        location: product.location,
        created_at: product.created_at,
        admin_id: product.admin_id,
        categories: product.categories,
        feedback: approvedFeedback,
        average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        review_count: approvedFeedback.length
      }
    }) || []

    // Log successful request for analytics (without sensitive data)
    try {
      await supabase.from('audit_logs').insert({
        action: 'products_browsed',
        table_name: 'products',
        new_values: { 
          subdomain: subdomain || 'all', 
          search: search || null,
          results_count: processedProducts.length 
        },
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent')
      })
    } catch (logError) {
      // Don't fail the request if logging fails
      console.warn('Failed to log browse request:', logError)
    }

    return new Response(
      JSON.stringify({
        products: processedProducts,
        total: processedProducts.length,
        limit: safeLimit,
        offset: safeOffset
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in browse-products:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch products' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
