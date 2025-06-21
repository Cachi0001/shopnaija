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
    console.log('=== CREATE ADMIN EDGE FUNCTION STARTED ===');
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);
    const {
      email, password, name, nin, subdomain, website_name, account_name, account_number, bank_name, bank_code, phone, paystack_subaccount_code, primary_color, referral_code, location
    } = requestBody;
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseServiceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.");
    if (!supabaseUrl) throw new Error("SUPABASE_URL is not set in environment variables.");
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
    // Check if admin with email already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin.from('users').select('id, email').eq('email', email).single();
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    if (existingUser) throw new Error(`Admin with email ${email} already exists.`);
    // Check if subdomain is already taken
    const { data: existingSubdomain, error: subdomainError } = await supabaseAdmin.from('users').select('id, subdomain').eq('subdomain', subdomain).single();
    if (subdomainError && subdomainError.code !== 'PGRST116') throw subdomainError;
    if (existingSubdomain) throw new Error(`Subdomain ${subdomain} is already taken.`);
    // Validate NIN if validation function exists
    try {
      const ninValidationRes = await fetch(`${supabaseUrl}/functions/v1/validate-nin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceRoleKey}`
        },
        body: JSON.stringify({ nin })
      });
      if (ninValidationRes.ok) {
        const ninResult = await ninValidationRes.json();
        if (!ninResult.valid) throw new Error(ninResult.error || "NIN validation failed.");
      }
    } catch (ninError) {
      console.warn('NIN validation service unavailable, proceeding without validation:', ninError);
    }
    // Generate temporary password if not provided
    const tempPassword = password || Math.random().toString(36).slice(-8).toUpperCase();
    // Paystack subaccount code: use provided or auto-create
    let finalSubaccountCode = paystack_subaccount_code;
    if (!finalSubaccountCode && bank_name && bank_code && account_name && account_number) {
      const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackSecretKey) throw new Error("PAYSTACK_SECRET_KEY is not set for automatic subaccount creation.");
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
          percentage_charge: 1.5
        })
      });
      const paystackData = await paystackResponse.json();
      if (!paystackData.status) throw new Error(`Paystack error: ${paystackData.message}`);
      finalSubaccountCode = paystackData.data.subaccount_code;
    }
    // Create the authentication user using Supabase Admin Auth API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: name,
        role: 'admin',
        subdomain: subdomain,
        website_name: website_name,
        phone: phone,
        nin: nin,
        account_name: account_name,
        account_number: account_number,
        bank_name: bank_name,
        primary_color: primary_color || '#00A862'
      }
    });
    if (authError) throw new Error(`Failed to create authentication user: ${authError.message}`);
    // Insert the admin user record into the public users table
    const { data: newAdmin, error: insertError } = await supabaseAdmin.from('users').insert({
      id: authUser.user.id,
      email: email,
      name: name,
      role: 'admin',
      nin: nin || null,
      subdomain: subdomain,
      website_name: website_name,
      account_name: account_name || null,
      account_number: account_number || null,
      bank_name: bank_name || null,
      bank_code: bank_code || null,
      phone: phone || null,
      payment_status: 'pending',
      is_active: false,
      must_reset_password: true,
      temp_password: tempPassword,
      primary_color: primary_color || '#00A862',
      email_verified: true,
      paystack_subaccount_code: finalSubaccountCode || null,
      referral_code: referral_code || null,
      location: location || null,
      is_plan_active: false,
      phone_verified: false,
      logo_url: null,
      referral_discount: null,
      referred_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();
    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to create admin profile: ${insertError.message}`);
    }
    // Insert or update payment account
    try {
      const { data: superadmin, error: superadminError } = await supabaseAdmin.from('users').select('id').eq('role', 'superadmin').single();
      await supabaseAdmin.from('payment_accounts').upsert({
        user_id: superadmin?.id || newAdmin.id,
        account_name: account_name,
        account_number: account_number,
        bank_name: bank_name
      }, { onConflict: 'user_id' });
    } catch (paymentError) {
      console.warn('Payment account creation/update failed:', paymentError);
    }
    // Send email with temporary password
    try {
      const sendgridKey = Deno.env.get('SENDGRID_API_KEY');
      if (sendgridKey) {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: email }], subject: 'GrowthSmallBeez - Your Admin Account Created' }],
            from: { email: 'noreply@growthsmallbeez.com.ng', name: 'GrowthSmallBeez' },
            content: [{ type: 'text/html', value: `<h2>Welcome to GrowthSmallBeez!</h2><p>Dear ${name},</p><p>Your admin account has been created successfully. Here are your login credentials:</p><p><strong>Email:</strong> ${email}</p><p><strong>Temporary Password:</strong> ${tempPassword}</p><p><strong>Important:</strong> You must reset your password on first login for security.</p><p>Login at: <a href="https://growthsmallbeez.com.ng/login">https://growthsmallbeez.com.ng/login</a></p><p>Best regards,<br>GrowthSmallBeez Team</p>` }]
          })
        });
      }
    } catch (emailError) {
      console.warn('Email sending failed:', emailError);
    }
    // Send notification to superadmin
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceRoleKey}`
        },
        body: JSON.stringify({
          recipient_id: 'superadmin',
          title: 'New Admin Created',
          body: `Admin ${name} has been registered`,
          data: { type: 'admin_created' }
        })
      });
    } catch (notificationError) {
      console.warn('Notification sending failed:', notificationError);
    }
    return new Response(JSON.stringify({
      success: true,
      adminId: newAdmin.id,
      message: 'Admin created successfully',
      tempPassword: tempPassword,
      paystack_subaccount_code: finalSubaccountCode || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('=== CREATE ADMIN EDGE FUNCTION ERROR ===');
    console.error('Error details:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Admin creation failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
