import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"; 

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      password, 
      name, 
      phone, 
      location, 
      website_name, 
      subdomain,
      nin,
      bank_name,
      bank_code, 
      account_name, 
      account_number,
      paystack_subaccount_code, // Allow manual input
      primary_color,
      referral_code,
      is_active = true
    } = await req.json();

    // --- Validation ---
    if (!email || !password || !name || !website_name || !subdomain || !nin) {
        return new Response(JSON.stringify({ 
          error: "Missing required fields. Required: email, password, name, website_name, subdomain, nin" 
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // --- Supabase Admin Client Initialization ---
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    
    // --- Paystack Subaccount Creation (if not provided manually) ---
    let finalSubaccountCode = paystack_subaccount_code;
    
    if (!finalSubaccountCode) {
      // Only create Paystack subaccount if bank details are provided and subaccount code is not provided
      if (bank_name && bank_code && account_name && account_number) {
        const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
        if (!paystackSecretKey) {
          throw new Error("PAYSTACK_SECRET_KEY is not set for automatic subaccount creation.");
        }

        const paystackResponse = await fetch('https://api.paystack.co/subaccount', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            business_name: website_name,
            bank_code: bank_code,
            account_number: account_number,
            account_name: account_name,
            percentage_charge: 1.5, // Default charge
          })
        });

        const paystackData = await paystackResponse.json();
        if (!paystackData.status) {
          throw new Error(`Paystack error: ${paystackData.message}`);
        }
        finalSubaccountCode = paystackData.data.subaccount_code;
      }
    }

    // --- Create Auth User ---
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { 
        name,
        role: 'admin',
        subdomain,
        website_name,
      }
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user.id;

    // --- Insert User Profile into public.users (matching exact schema) ---
    const userProfileData = {
      id: userId,
      name,
      email,
      phone: phone || null,
      role: 'admin' as const,
      subdomain,
      website_name,
      location: location || null,
      nin,
      bank_name: bank_name || null,
      bank_code: bank_code || null,
      account_name: account_name || null,
      account_number: account_number || null,
      paystack_subaccount_code: finalSubaccountCode || null,
      primary_color: primary_color || null,
      referral_code: referral_code || null,
      is_active,
      email_verified: true,
      phone_verified: false,
      must_reset_password: false,
      is_plan_active: false,
      payment_status: null,
      temp_password: null,
      logo_url: null,
      referral_discount: null,
      referred_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert(userProfileData)
      .select()
      .single();

    if (profileError) {
      // If profile insert fails, delete the auth user to prevent orphans
      await supabaseAdmin.auth.admin.deleteUser(userId); 
      throw profileError;
    }

    // --- Return Success Response ---
    return new Response(JSON.stringify({ 
      success: true,
      user: authData.user, 
      profile: profileData,
      paystack_subaccount_code: finalSubaccountCode 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Create admin error:', error);
    
    // --- Error Handling ---
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: error.details || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
