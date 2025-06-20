
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, data } = await req.json();
    
    // Get SendGrid API key from environment
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    
    if (!sendGridApiKey) {
      throw new Error("SendGrid API key not configured");
    }

    let subject = '';
    let htmlContent = '';
    
    if (type === 'confirmation') {
      subject = 'Welcome to ShopNaija - Confirm Your Account';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Your ShopNaija Account</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #00A862 0%, #007A4C 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .button { 
              display: inline-block; 
              padding: 15px 30px; 
              background: linear-gradient(135deg, #00A862 0%, #007A4C 100%); 
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 20px 0;
              font-weight: bold;
              text-align: center;
            }
            .footer { text-align: center; padding: 30px 20px; color: #666; background: #f8f8f8; }
            .logo { font-size: 24px; font-weight: bold; }
            .url-box { background: #f8f8f8; padding: 15px; border-radius: 5px; word-break: break-all; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ShopNaija</div>
              <h1>Welcome to ShopNaija!</h1>
            </div>
            <div class="content">
              <h2>Confirm Your Account</h2>
              <p>Hello ${data.name || 'there'},</p>
              <p>Thank you for joining ShopNaija, Nigeria's premier e-commerce platform for small businesses!</p>
              <p>To complete your registration and start building your online store, please confirm your email address by clicking the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.confirmationUrl}" class="button">Confirm Your Account</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <div class="url-box">${data.confirmationUrl}</div>
              
              <p><strong>This link will expire in 24 hours for security reasons.</strong></p>
              
              <p>Once confirmed, you'll be able to:</p>
              <ul>
                <li>✅ Create your custom online store</li>
                <li>✅ Add unlimited products</li>
                <li>✅ Manage orders and customers</li>
                <li>✅ Accept payments through PayStack</li>
              </ul>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br><strong>The ShopNaija Team</strong></p>
              <p>Empowering Nigerian entrepreneurs to build successful online businesses</p>
              <p><small>© 2024 ShopNaija. All rights reserved.</small></p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === 'reset_password') {
      subject = 'Reset Your ShopNaija Password';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your ShopNaija Password</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #00A862 0%, #007A4C 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .button { 
              display: inline-block; 
              padding: 15px 30px; 
              background: linear-gradient(135deg, #00A862 0%, #007A4C 100%); 
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 20px 0;
              font-weight: bold;
              text-align: center;
            }
            .footer { text-align: center; padding: 30px 20px; color: #666; background: #f8f8f8; }
            .logo { font-size: 24px; font-weight: bold; }
            .url-box { background: #f8f8f8; padding: 15px; border-radius: 5px; word-break: break-all; margin: 15px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ShopNaija</div>
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password for your ShopNaija account.</p>
              <p>Click the button below to create a new password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <div class="url-box">${data.resetUrl}</div>
              
              <div class="warning">
                <p><strong>⚠️ Important Security Information:</strong></p>
                <ul>
                  <li>This link will expire in 1 hour for security reasons</li>
                  <li>Only use this link if you requested a password reset</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged and your account is secure.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br><strong>The ShopNaija Team</strong></p>
              <p>Your security is our priority</p>
              <p><small>© 2024 ShopNaija. All rights reserved.</small></p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send email using SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: email }],
            subject: subject,
          },
        ],
        from: { 
          email: 'noreply@shopnaija.com.ng', 
          name: 'ShopNaija' 
        },
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid API error:', errorText);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully via SendGrid',
      subject,
      email 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to send email via SendGrid'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
