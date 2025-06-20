import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const categoryFields = {
  'Babies & Kids': ['name', 'price', 'agerange', 'description'],
  'Fashion': ['name', 'price', 'size', 'color', 'description'],
  'Beauty & Personal Care': ['name', 'price', 'skintype', 'description'],
  'Shoes': ['name', 'price', 'size', 'material', 'description'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    const { category, ...productData } = await req.json();

    if (!category || !categoryFields[category]) {
      throw new Error('Invalid or unsupported category');
    }

    const requiredFields = categoryFields[category];
    const missingCategoryFields = requiredFields.filter((field) => !productData[field]);
    if (missingCategoryFields.length > 0) {
      throw new Error(`Missing required fields for category ${category}: ${missingCategoryFields.join(', ')}`);
    }

    // Validate mandatory fields from schema
    if (!productData.admin_id) throw new Error('Admin ID is required.');
    if (!productData.locationState) throw new Error('Location state is required.');
    if (!productData.locationAddress) throw new Error('Location address is required.');
    if (!productData.lga) throw new Error('Local Government Area is required.');
    if (productData.price === undefined || productData.price === '' || isNaN(Number(productData.price))) throw new Error('Valid price is required.');
    if (productData.units_available === undefined || productData.units_available === '' || isNaN(Number(productData.units_available))) throw new Error('Units available is required.');

    const { data, error } = await supabase
      .from('products')
      .insert({
        admin_id: productData.admin_id,
        title: productData.title || null,
        description: productData.description || null,
        price: Number(productData.price),
        adjusted_price: productData.adjusted_price !== undefined && productData.adjusted_price !== null && productData.adjusted_price !== '' ? Number(productData.adjusted_price) : null,
        paystack_fee: productData.paystack_fee !== undefined && productData.paystack_fee !== null && productData.paystack_fee !== '' ? Number(productData.paystack_fee) : null,
        superadmin_fee: productData.superadmin_fee !== undefined && productData.superadmin_fee !== null && productData.superadmin_fee !== '' ? Number(productData.superadmin_fee) : null,
        image_url: productData.image_url || null,
        image_public_id: productData.image_public_id || null,
        location_state: productData.locationState,
        location_address: productData.locationAddress,
        lga: productData.lga,
        units_available: Number(productData.units_available) || 1,
        original_price: productData.original_price !== undefined && productData.original_price !== null && productData.original_price !== '' ? Number(productData.original_price) : 0.00,
        name: productData.name || null,
        category: productData.category,
        agerange: productData.agerange || null,
        size: productData.size || null,
        color: productData.color || null,
        skintype: productData.skintype || null,
        material: productData.material || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Manage-product error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});