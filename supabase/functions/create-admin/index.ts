import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"; 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      password, 
      name, 
      role, 
      phone, 
      location, 
      website_name, 
      primary_color, 
      account_name, 
      account_number, 
      bank_name, 
      bank_code, // Added bank_code
      logo_url, 
      is_active, 
      nin, 
      subdomain 
    } = await req.json();

    // Basic validation for required fields for admin role
    if (role === 'admin' && (!account_name || !account_number || !bank_name || !bank_code || !website_name)) {
        return new Response(
            JSON.stringify({ error: "Bank details (account name, number, bank name, bank code) and website name are required for admin role." }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const supabaseServiceRoleKey = Deno.env.get("SUPABASE-SERVICE-ROLE-KEY");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY"); // Fetch Paystack Secret Key

    if (!supabaseServiceRoleKey) {
      throw new Error("SUPABASE-SERVICE-ROLE-KEY is not set in environment variables.");
    }

    if (role === 'admin' && !paystackSecretKey) {
        throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables. Cannot create Paystack subaccount.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false, 
        },
      }
    );

    // NIN Validation
    const ninValidationRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/validate-nin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nin: nin }) 
    });

    const ninResult = await ninValidationRes.json();
    if (!ninResult.valid) {
      return new Response(
        JSON.stringify({ error: ninResult.error || "NIN validation failed." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let paystackSubaccountCode = null;

    // Create Paystack Subaccount if role is admin
    if (role === 'admin' && account_name && account_number && bank_code && website_name && paystackSecretKey) {
        try {
            const paystackSubaccountResponse = await fetch('https://api.paystack.co/subaccount', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${paystackSecretKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    account_name: account_name,
                    account_number: account_number,
                    bank_code: bank_code,
                    business_name: website_name, // Use website_name as business_name
                    split_value: 9500, // 95% in kobo (95 * 100)
                })
            });

            const paystackSubaccountData = await paystackSubaccountResponse.json();

            if (!paystackSubaccountData.status) {
                console.error('Paystack subaccount creation failed:', paystackSubaccountData.message);
                // Throw an error to prevent admin creation without a subaccount
                throw new Error(`Failed to create Paystack subaccount: ${paystackSubaccountData.message}`);
            }

            paystackSubaccountCode = paystackSubaccountData.data.subaccount_code;
            console.log('Paystack subaccount created:', paystackSubaccountCode);

        } catch (paystackError: any) {
             console.error('Error calling Paystack API:', paystackError);
             throw new Error(`Paystack subaccount creation failed: ${paystackError.message || 'An unknown error occurred'}`);
        }
    }

    // Create Auth user in Supabase
    const { data: newUserAuthData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        name,
        role,
        subdomain,
        website_name,
        primary_color,
        phone,
        nin,
        account_name,
        account_number,
        bank_name,
        bank_code, // Include bank_code in metadata
        paystack_subaccount_code: paystackSubaccountCode, // Include subaccount code in metadata
        logo_url,
        is_active,
      }
    });

    if (authError) {
      console.error('Supabase Auth createUser error:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    const userId = newUserAuthData.user.id;
    const userEmail = newUserAuthData.user.email;

    // Insert user profile into public.users table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: userEmail,
        name: name,
        role: role,
        phone: phone || null, 
        location: location || null,
        website_name: website_name || null,
        primary_color: primary_color || null,
        account_name: account_name || null,
        account_number: account_number || null,
        bank_name: bank_name || null,
        bank_code: bank_code || null, // Insert bank_code
        paystack_subaccount_code: paystackSubaccountCode, // Insert Paystack subaccount code
        logo_url: logo_url || null,
        is_active: is_active ?? true,
        nin: nin || null,
        email_verified: true,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Public users table insert error:', profileError);
      // Attempt to delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId); 
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    // Send notification for new admin creation
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient_id: 'superadmin', 
        title: 'New Admin Created',
        body: `Admin ${name} has been registered`,
        data: { type: 'admin_created' }
      })
    });

    return new Response(JSON.stringify({ user: newUserAuthData.user, profile }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in create-admin Edge Function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
