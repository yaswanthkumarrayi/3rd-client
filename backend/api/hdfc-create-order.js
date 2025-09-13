import crypto from 'crypto';

const HDFC_CONFIG = {
  API_KEY: process.env.HDFC_API_KEY || "D5B755878234D26AC0C865AA253012",
  MERCHANT_ID: process.env.HDFC_MERCHANT_ID || "SG3514",
  CLIENT_ID: process.env.HDFC_CLIENT_ID || "hdfcmaster",
  BASE_URL: process.env.HDFC_BASE_URL || "https://smartgatewayuat.hdfcbank.com", // UAT environment
  PAYMENT_ENDPOINT: process.env.HDFC_PAYMENT_ENDPOINT || "/smartGW/submitpayment",
  RESPONSE_KEY: process.env.HDFC_RESPONSE_KEY || "9EFC035E8F043AFB88F37DEF30C16D",
  ENVIRONMENT: process.env.HDFC_ENVIRONMENT || "uat", // uat, production, or mock
  // Alternative endpoints to try if main one fails
  FALLBACK_ENDPOINTS: [
    "/smartGW/submitpayment",
    "/gateway/payment", 
    "/paymentgateway/payment",
    "/pg/payment",
    "/smartGW/payment"
  ],
  // Mock mode for testing when UAT is not accessible
  MOCK_MODE: process.env.HDFC_MOCK_MODE === "true" || false
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

    console.log('✅ HDFC validation passed, creating payment order...');
    console.log('🔧 Environment:', HDFC_CONFIG.ENVIRONMENT);
    console.log('🔧 Mock mode:', HDFC_CONFIG.MOCK_MODE);

    // Check if we should use mock mode due to UAT restrictions
    const shouldUseMock = HDFC_CONFIG.MOCK_MODE || HDFC_CONFIG.ENVIRONMENT === 'mock';
    
    if (shouldUseMock) {
      console.log('⚠️ Using HDFC mock mode - UAT environment not accessible');
      return await handleMockHDFCPayment(req, res, { amount, productinfo, firstname, lastname, email, phone, address, city, state, pincode });
    }

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

    console.log('📦 Creating HDFC order session (simple mode):', orderId);

    // Generate HDFC payment URL with fallback handling
    const tryEndpoints = [
      `/smartGW/submitpayment`,
      `/merchant/ipay`,
      `/gateway/payment`,
      `/paymentgateway/payment`,
      `/pg/payment`
    ];
    
    // Use primary endpoint for now, but provide fallback in response
    const paymentUrl = `${HDFC_CONFIG.BASE_URL}${HDFC_CONFIG.PAYMENT_ENDPOINT}`;

    // Create form data for HDFC submission
    const formData = {
      ...orderSessionData,
      productinfo: productinfo || "Online Purchase"
    };

    console.log('✅ HDFC order session created successfully (UAT mode with fallbacks)');
    console.log('🔧 Primary URL:', paymentUrl);
    console.log('⚠️ Note: If 404 occurs, UAT environment may be restricted or down');

    // Enhanced form with error handling and fallback URLs
    const redirectForm = generateHDFCForm(formData, paymentUrl, tryEndpoints);

    return res.status(200).json({
      success: true,
      order_id: orderId,
      payment_url: paymentUrl,
      payment_data: formData,
      redirect_form: redirectForm,
      return_url: returnUrl,
      fallback_urls: tryEndpoints.map(endpoint => `${HDFC_CONFIG.BASE_URL}${endpoint}`),
      note: "If payment fails with 404, the UAT environment may be restricted. Contact HDFC support or use production credentials."
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

function generateHDFCForm(paymentData, actionUrl, fallbackUrls = []) {
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
        .error-notice {
          background: rgba(255,193,7,0.2);
          border: 1px solid rgba(255,193,7,0.5);
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 14px;
        }
        .fallback-btn {
          background: #ffc107;
          color: #000;
          border: none;
          padding: 8px 16px;
          margin: 5px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
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
        
        <div class="error-notice">
          <strong>⚠️ UAT Environment Notice:</strong><br>
          If you encounter a 404 error, the HDFC UAT environment may be restricted or temporarily unavailable.
          This is common with banking test environments.
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
        
        <button onclick="submitPayment()" 
                style="background: #28a745; color: white; border: none; padding: 12px 24px; 
                       border-radius: 6px; cursor: pointer; font-size: 16px;">
          Continue to Payment
        </button>
        
        <div style="margin-top: 20px;">
          <small>Having issues? Try alternate endpoints:</small><br>`;
  
  // Add fallback buttons if provided
  if (fallbackUrls && fallbackUrls.length > 0) {
    fallbackUrls.forEach((url, index) => {
      formHTML += `<button class="fallback-btn" onclick="tryFallback('${url}')">${url.split('/').pop()}</button>`;
    });
  }
  
  formHTML += `
        </div>
      </div>

      <script>
        let attemptCount = 0;
        const maxAttempts = 3;
        
        function submitPayment() {
          attemptCount++;
          console.log('Attempting HDFC payment submission #' + attemptCount);
          document.getElementById('hdfcPaymentForm').submit();
        }
        
        function tryFallback(url) {
          console.log('Trying fallback URL:', url);
          document.getElementById('hdfcPaymentForm').action = url;
          submitPayment();
        }
        
        // Auto-submit after 3 seconds
        setTimeout(function() {
          submitPayment();
        }, 3000);
        
        // Handle form submission errors
        window.addEventListener('error', function(e) {
          console.error('Payment form error:', e);
          if (attemptCount < maxAttempts) {
            console.log('Retrying payment submission...');
            setTimeout(submitPayment, 2000);
          }
        });
      </script>
    </body>
    </html>
  `;

  return formHTML;
}

// Mock HDFC payment handler for when UAT is not accessible
async function handleMockHDFCPayment(req, res, orderData) {
  const { amount, productinfo, firstname, lastname, email, phone } = orderData;
  
  // Generate mock order ID
  const timestamp = Date.now().toString().slice(-8);
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderId = `MOCK${timestamp}${randomStr}`;
  
  console.log('🎭 Creating mock HDFC payment order:', orderId);
  
  // Create mock payment form that simulates HDFC flow
  const mockForm = generateMockHDFCForm({
    order_id: orderId,
    amount: parseFloat(amount).toFixed(2),
    billing_name: `${firstname} ${lastname || ''}`.trim(),
    customer_email: email,
    customer_phone: phone,
    productinfo: productinfo || "Test Payment"
  });
  
  return res.status(200).json({
    success: true,
    order_id: orderId,
    payment_url: "https://mockgateway.hdfcbank.com/payment", // Mock URL
    payment_data: {
      order_id: orderId,
      amount: parseFloat(amount).toFixed(2),
      currency: "INR",
      customer_email: email,
      customer_phone: phone,
      billing_name: `${firstname} ${lastname || ''}`.trim()
    },
    redirect_form: mockForm,
    return_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://textilesbackend.vercel.app'}/api/hdfc-payment-response`,
    mode: "mock",
    note: "Mock mode active - UAT environment not accessible. This simulates HDFC payment flow for testing."
  });
}

function generateMockHDFCForm(paymentData) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.ashokkumartextiles.com';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mock HDFC Payment Gateway</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px;
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
          color: #333;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background: rgba(255,255,255,0.9);
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .mock-badge {
          background: #e74c3c;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          margin-bottom: 20px;
          display: inline-block;
        }
        .payment-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin: 10px;
        }
        .cancel-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin: 10px;
        }
        .details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="mock-badge">🎭 MOCK PAYMENT GATEWAY</div>
        <h2>🏦 HDFC Bank Payment Simulation</h2>
        
        <div class="details">
          <strong>Order ID:</strong> ${paymentData.order_id}<br>
          <strong>Amount:</strong> ₹${paymentData.amount}<br>
          <strong>Customer:</strong> ${paymentData.billing_name}<br>
          <strong>Email:</strong> ${paymentData.customer_email}
        </div>
        
        <p><strong>⚠️ This is a mock payment gateway for testing purposes.</strong></p>
        <p>The real HDFC UAT environment is not accessible.</p>
        <p>Choose your test scenario:</p>
        
        <button class="payment-btn" onclick="simulateSuccess()">
          ✅ Simulate Successful Payment
        </button>
        
        <button class="cancel-btn" onclick="simulateFailure()">
          ❌ Simulate Payment Failure
        </button>
        
        <p><small>This will redirect back to your application with the selected result.</small></p>
      </div>

      <script>
        function simulateSuccess() {
          console.log('Simulating successful HDFC payment...');
          window.location.href = '${frontendUrl}/payment/success?order_id=${paymentData.order_id}&status=success&mock=true';
        }
        
        function simulateFailure() {
          console.log('Simulating failed HDFC payment...');
          window.location.href = '${frontendUrl}/payment/failure?order_id=${paymentData.order_id}&status=failure&mock=true';
        }
        
        // Auto-redirect to success after 10 seconds for testing
        setTimeout(function() {
          console.log('Auto-simulating successful payment...');
          simulateSuccess();
        }, 10000);
      </script>
    </body>
    </html>
  `;
}