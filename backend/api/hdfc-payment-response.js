export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🏦 HDFC Payment Response received:', {
    method: req.method,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  try {
    const orderId = req.body.order_id || req.body.orderId || req.query.order_id;
    const status = req.body.status || req.query.status;
    const amount = req.body.amount || req.query.amount;
    const hash = req.body.hash || req.query.hash;

    if (!orderId) {
      console.error('❌ Missing order_id in HDFC response');
      const frontendUrl = process.env.FRONTEND_URL || 'https://ashok-textiles.vercel.app';
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
      const frontendUrl = process.env.FRONTEND_URL || 'https://ashok-textiles.vercel.app';
      return res.redirect(`${frontendUrl}/payment/failure?error=signature_validation_failed&order_id=${orderId}`);
    }

    // Determine payment status and redirect accordingly
    let redirectUrl;
    const frontendUrl = process.env.FRONTEND_URL || 'https://ashok-textiles.vercel.app';

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
    const frontendUrl = process.env.FRONTEND_URL || 'https://ashok-textiles.vercel.app';
    return res.redirect(`${frontendUrl}/payment/failure?error=server_error&message=${encodeURIComponent(error.message)}`);
  }
}