// Razorpay configuration status endpoint for Vercel
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const hasSecret = !!process.env.RAZORPAY_KEY_SECRET;
    
    // Determine mode
    const currentMode = keyId?.startsWith('rzp_live') ? 'LIVE' : 'TEST';
    
    // Determine status
    let status = 'MISCONFIGURED';
    if (keyId && hasSecret) {
      status = 'CONFIGURED';
    }

    const response = {
      mode: currentMode,
      keyIdPrefix: keyId ? keyId.substring(0, 8) + '...' : 'NOT_SET',
      hasSecret: hasSecret,
      status: status,
      timestamp: new Date().toISOString(),
      service: 'razorpay-payment-gateway',
      version: '1.0.0',
      environment: 'vercel'
    };

    console.log('🔍 Razorpay status check:', {
      mode: currentMode,
      status: status,
      timestamp: response.timestamp
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error checking Razorpay status:', error);
    
    return res.status(500).json({ 
      error: 'Status check failed',
      timestamp: new Date().toISOString()
    });
  }
}
