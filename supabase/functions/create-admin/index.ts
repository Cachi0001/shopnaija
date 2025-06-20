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
      account_number
    } = await req.json();
    
    // --- Validation ---
    if (!email || !password || !name || !website_name || !subdomain || !nin || !bank_name || !bank_code || !account_name || !account_number) {
        return new Response(JSON.stringify({ error: "Missing required fields for admin creation." }), {
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
    
    // --- Paystack Subaccount Creation ---
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
        throw new Error("PAYSTACK_SECRET_KEY is not set.");
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
            percentage_charge: 1.5, // Example charge
        })
    });

    const paystackData = await paystackResponse.json();
    if (!paystackData.status) {
        throw new Error(`Paystack error: ${paystackData.message}`);
    }
    const paystack_subaccount_code = paystackData.data.subaccount_code;

    // --- Create Auth User ---
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { 
        name,
        role: 'admin',
        subdomain,
      }
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user.id;

    // --- Insert User Profile into public.users ---
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        name,
        email,
        phone,
        role: 'admin',
        subdomain,
        website_name,
        location,
        nin,
        bank_name,
        bank_code,
        account_name,
        account_number,
        paystack_subaccount_code,
        is_active: true,
        email_verified: true,
      })
      .select()
      .single();

    if (profileError) {
      // If profile insert fails, delete the auth user to prevent orphans
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw profileError;
    }

    // --- Return Success Response ---
    return new Response(JSON.stringify({ user: authData.user, profile: profileData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    // --- Error Handling ---
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
