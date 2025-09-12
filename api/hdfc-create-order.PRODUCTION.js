// PRODUCTION VERSION - Replace in api/hdfc-create-order.js when going live

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

    // Validate required fields
    if (!amount || !firstname || !email || !phone) {
      console.log('❌ HDFC validation failed:', { amount, firstname, email, phone });
      return res.status(400).json({ 
        error: 'Missing required fields: amount, firstname, email, phone' 
      });
    }

    console.log('✅ HDFC validation passed, processing payment...');

    // Generate unique transaction ID
    const txnid = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Format amount (HDFC expects amount in rupees, not paisa)
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Production URLs - Update these with your actual domain
    const productionBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
    
    // Prepare payment data for PRODUCTION
    const paymentData = {
      apikey: process.env.HDFC_API_KEY,
      txnid: txnid,
      amount: formattedAmount,
      productinfo: productinfo || "Online Purchase",
      firstname: firstname,
      lastname: lastname || "",
      email: email,
      phone: phone,
      address1: address || "",
      city: city || "",
      state: state || "",
      zipcode: pincode || "",
      country: "India",
      merchant_id: process.env.HDFC_MERCHANT_ID,
      payment_page_client_id: process.env.HDFC_CLIENT_ID,
      action: "paymentPage",
      currency: "INR",
      // PRODUCTION callback URLs
      surl: `${productionBaseUrl}/api/hdfc-payment-success`,
      furl: `${productionBaseUrl}/api/hdfc-payment-failure`,
      curl: `${productionBaseUrl}/api/hdfc-payment-cancel`,
      return_url: `${productionBaseUrl}/payment/success`
    };

    // Generate hash for HDFC
    const hashString = `${paymentData.apikey}|${paymentData.txnid}|${paymentData.amount}|${paymentData.productinfo}|${paymentData.firstname}|${paymentData.email}|||||||||||${process.env.HDFC_RESPONSE_KEY}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    paymentData.hash = hash;

    // PRODUCTION HDFC Gateway URL
    const productionPaymentUrl = `${process.env.HDFC_BASE_URL}/PaymentGateway/TransactionHandler`;
    
    return res.status(200).json({
      success: true,
      txnid: txnid,
      paymentData: paymentData,
      paymentUrl: productionPaymentUrl,
      redirectForm: generateRedirectForm(paymentData, productionPaymentUrl),
      environment: 'PRODUCTION'
    });

  } catch (error) {
    console.error('HDFC Create Order Error:', error);
    return res.status(500).json({ 
      error: 'Failed to create HDFC payment order',
      details: error.message 
    });
  }
}

function generateRedirectForm(paymentData, actionUrl) {
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
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
      </style>
    </head>
    <body>
      <h2>Redirecting to HDFC Payment Gateway...</h2>
      <div class="loader"></div>
      <p>Please wait while we redirect you to the secure payment page.</p>
      
      <form id="hdfcPaymentForm" action="${actionUrl}" method="POST" style="display:none;">
  `;

  Object.keys(paymentData).forEach(key => {
    if (paymentData[key]) {
      formHTML += `<input type="hidden" name="${key}" value="${paymentData[key]}" />`;
    }
  });

  formHTML += `
      </form>
      <script>
        setTimeout(function() {
          document.getElementById('hdfcPaymentForm').submit();
        }, 2000);
      </script>
    </body>
    </html>
  `;

  return formHTML;
}