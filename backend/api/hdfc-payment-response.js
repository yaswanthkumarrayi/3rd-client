module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET request for testing
  if (req.method === 'GET') {
    console.log('🧪 HDFC Payment Response - GET request for testing');
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.ashokkumartextiles.com';
    return res.redirect(`${frontendUrl}/payment/failure?error=test_access&message=This endpoint is for HDFC payment callbacks only`);
  }

  console.log('🏦 HDFC Payment Response received:', {
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  try {
    // Extract order_id from multiple possible sources
    let orderId = null;
    let status = null;
    let amount = null;
    let hash = null;

    // Check if we have request body
    if (req.body && typeof req.body === 'object') {
      orderId = req.body.order_id || req.body.orderId || req.body.txnid;
      status = req.body.status || req.body.payment_status;
      amount = req.body.amount;
      hash = req.body.hash;
    }

    // Fallback to query parameters
    if (!orderId && req.query) {
      orderId = req.query.order_id || req.query.orderId || req.query.txnid;
      status = status || req.query.status || req.query.payment_status;
      amount = amount || req.query.amount;
      hash = hash || req.query.hash;
    }

    console.log('🔍 Extracted payment data:', { orderId, status, amount, hash });

    if (!orderId) {
      console.error('❌ Missing order_id in HDFC response', {
        bodyKeys: req.body ? Object.keys(req.body) : [],
        queryKeys: req.query ? Object.keys(req.query) : []
      });
      const frontendUrl = process.env.FRONTEND_URL || 'https://www.ashokkumartextiles.com';
      return res.redirect(`${frontendUrl}/payment/failure?error=missing_order_id`);
    }

    // Validate HMAC if present (simplified validation)
    let validSignature = true;
    if (hash) {
      // In production, implement proper HMAC validation
      console.log('🔐 HDFC response signature validation (implement in production)');
    }

    if (!validSignature) {
      console.error('❌ HDFC signature validation failed');
      const frontendUrl = process.env.FRONTEND_URL || 'https://www.ashokkumartextiles.com';
      return res.redirect(`${frontendUrl}/payment/failure?error=signature_validation_failed&order_id=${orderId}`);
    }

    // Determine payment status and redirect accordingly
    let redirectUrl;
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.ashokkumartextiles.com';

    switch (status) {
      case 'CHARGED':
      case 'SUCCESS':
      case 'COMPLETED':
        console.log('✅ HDFC payment successful for order:', orderId);
        redirectUrl = `${frontendUrl}/payment/success?status=success&order_id=${orderId}&gateway=HDFC&amount=${amount || ''}`;
        break;
        
      case 'PENDING':
      case 'PENDING_VBV':
        console.log('⏳ HDFC payment pending for order:', orderId);
        redirectUrl = `${frontendUrl}/payment/success?status=pending&order_id=${orderId}&gateway=HDFC&amount=${amount || ''}&message=Payment is being processed`;
        break;
        
      case 'AUTHORIZATION_FAILED':
      case 'AUTHENTICATION_FAILED':
      case 'FAILED':
      case 'CANCELLED':
      default:
        console.log('❌ HDFC payment failed for order:', orderId, 'Status:', status);
        redirectUrl = `${frontendUrl}/payment/failure?status=failed&order_id=${orderId}&gateway=HDFC&error=${status || 'payment_failed'}`;
        break;
    }

    // Log the transaction for record keeping
    console.log('💾 HDFC Transaction logged:', {
      order_id: orderId,
      status: status,
      amount: amount,
      timestamp: new Date().toISOString(),
      redirect_url: redirectUrl
    });

    // Redirect to the appropriate page
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('💥 HDFC Payment Response Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.ashokkumartextiles.com';
    return res.redirect(`${frontendUrl}/payment/failure?error=server_error&message=${encodeURIComponent(error.message)}`);
  }
}