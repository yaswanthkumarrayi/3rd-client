import crypto from 'crypto';

const HDFC_CONFIG = {
  API_KEY: process.env.HDFC_API_KEY || "D5B755878234D26AC0C865AA253012",
  MERCHANT_ID: process.env.HDFC_MERCHANT_ID || "SG3514",
  CLIENT_ID: process.env.HDFC_CLIENT_ID || "hdfcmaster",
  BASE_URL: process.env.HDFC_BASE_URL || "https://smartgatewayuat.hdfcbank.com", // UAT environment
  PAYMENT_ENDPOINT: process.env.HDFC_PAYMENT_ENDPOINT || "/v4/session", // Modern HDFC v4 Session API endpoint
  RESPONSE_KEY: process.env.HDFC_RESPONSE_KEY || "9EFC035E8F043AFB88F37DEF30C16D",
  ENVIRONMENT: "uat", // UAT environment for testing with current credentials
  LAST_UPDATED: "2024-12-28-v4-session" // Force deployment update
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🏦 HDFC Create order request received:', {
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    const { amount, productinfo, firstname, lastname, email, phone, address, city, state, pincode } = req.body;

    console.log('🔧 HDFC Debug - Request received:', { amount, firstname, email, phone });

    // Validate required fields
    if (!amount || !firstname || !email || !phone) {
      console.log('❌ HDFC validation failed:', { amount, firstname, email, phone });
      return res.status(400).json({ 
        error: 'Missing required fields: amount, firstname, email, phone' 
      });
    }

    console.log('✅ HDFC validation passed, creating simple payment order...');

    // Generate unique order ID (HDFC compliant format)
    // Requirements: <21 chars, alphanumeric, non-sequential, no special chars
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random chars
    const orderId = `AKT${timestamp}${randomStr}`; // AKT + timestamp + random = ~17 chars
    const formattedAmount = parseFloat(amount).toFixed(2);
    
    // Create return URL for HDFC callback (backend URL)
    const backendUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://textilesbackend.vercel.app';
    const returnUrl = `${backendUrl}/api/hdfc-payment-response`;
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.ashokkumartextiles.com';
    const successUrl = `${frontendUrl}/payment/success`;
    const failureUrl = `${frontendUrl}/payment/failure`;

    // HDFC Order Session Data (simplified without PaymentHandler)
    const orderSessionData = {
      order_id: orderId,
      amount: formattedAmount,
      currency: "INR",
      return_url: returnUrl,
      surl: successUrl, // Success URL
      furl: failureUrl, // Failure URL 
      customer_id: email,
      customer_email: email,
      customer_phone: phone,
      billing_name: `${firstname} ${lastname || ''}`.trim(),
      billing_address: address || '',
      billing_city: city || '',
      billing_state: state || '',
      billing_zip: pincode || '',
      billing_country: 'India',
      product_info: productinfo || "Online Purchase",
      payment_page_client_id: HDFC_CONFIG.CLIENT_ID,
      merchant_id: HDFC_CONFIG.MERCHANT_ID,
      apikey: HDFC_CONFIG.API_KEY,
      response_key: HDFC_CONFIG.RESPONSE_KEY
    };

    console.log('📦 Creating HDFC v4 Session:', orderId);

    // Generate HDFC v4 Session API URL
    const sessionUrl = `${HDFC_CONFIG.BASE_URL}${HDFC_CONFIG.PAYMENT_ENDPOINT}`;

    // HDFC v4 Session API payload structure (simplified)
    const sessionPayload = {
      merchant_id: HDFC_CONFIG.MERCHANT_ID,
      order_id: orderId,
      amount: formattedAmount,
      currency: "INR",
      customer_email: email,
      customer_phone: phone,
      billing_name: `${firstname} ${lastname || ''}`.trim(),
      product_info: productinfo || "Online Purchase",
      return_url: returnUrl,
      payment_page_client_id: HDFC_CONFIG.CLIENT_ID,
      api_key: HDFC_CONFIG.API_KEY
    };

    console.log('✅ HDFC v4 Session created (form-based)');

    return res.status(200).json({
      success: true,
      order_id: orderId,
      payment_url: sessionUrl,
      payment_data: sessionPayload,
      redirect_form: generateHDFCForm(sessionPayload, sessionUrl),
      return_url: returnUrl,
      api_version: "v4",
      endpoint: "session"
    });

  } catch (error) {
    console.error('HDFC Create Order Error:', error);
    return res.status(500).json({ 
      error: 'Failed to create HDFC payment order',
      details: error.message,
      type: error.constructor.name
    });
  }
}

function generateHDFCForm(paymentData, actionUrl) {
  let formHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting to HDFC Payment Gateway...</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .loader {
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid #fff;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .details {
          background: rgba(255,255,255,0.2);
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🏦 HDFC Bank Payment Gateway</div>
        <h2>Redirecting to Secure Payment...</h2>
        <div class="loader"></div>
        
        <div class="details">
          <strong>Order ID:</strong> ${paymentData.order_id}<br>
          <strong>Amount:</strong> ₹${paymentData.amount}<br>
          <strong>Customer:</strong> ${paymentData.billing_name}
        </div>
        
        <p>Please wait while we redirect you to the secure HDFC payment page...</p>
        <p><small>If you are not redirected automatically, click the button below.</small></p>
        
        <form id="hdfcPaymentForm" action="${actionUrl}" method="POST">
  `;

  // Add all form fields
  Object.keys(paymentData).forEach(key => {
    if (paymentData[key] !== undefined && paymentData[key] !== null) {
      formHTML += `          <input type="hidden" name="${key}" value="${paymentData[key]}" />\n`;
    }
  });

  formHTML += `
        </form>
        
        <button onclick="document.getElementById('hdfcPaymentForm').submit()" 
                style="background: #28a745; color: white; border: none; padding: 12px 24px; 
                       border-radius: 6px; cursor: pointer; font-size: 16px;">
          Continue to Payment
        </button>
      </div>

      <script>
        // Auto-submit after 3 seconds
        setTimeout(function() {
          document.getElementById('hdfcPaymentForm').submit();
        }, 3000);
      </script>
    </body>
    </html>
  `;

  return formHTML;
}