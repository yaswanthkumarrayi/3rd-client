export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const hasSecret = !!process.env.RAZORPAY_KEY_SECRET;
    const currentMode = (keyId || '').startsWith('rzp_live') ? 'LIVE' : 'TEST';
    
    res.status(200).json({
      mode: currentMode,
      keyIdPrefix: keyId ? keyId.substring(0, 8) + '...' : 'NOT_SET',
      hasSecret: hasSecret,
      status: keyId && hasSecret ? 'CONFIGURED' : 'MISCONFIGURED'
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
}
