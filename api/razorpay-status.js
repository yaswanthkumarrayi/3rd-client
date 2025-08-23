function setJson(res) {
  res.setHeader('Content-Type', 'application/json');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    setJson(res);
    return res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const hasSecret = !!process.env.RAZORPAY_KEY_SECRET;
    const currentMode = (keyId || '').startsWith('rzp_live') ? 'LIVE' : 'TEST';
    
    setJson(res);
    return res.status(200).end(JSON.stringify({
      mode: currentMode,
      keyIdPrefix: keyId ? keyId.substring(0, 8) + '...' : 'NOT_SET',
      hasSecret: hasSecret,
      status: keyId && hasSecret ? 'CONFIGURED' : 'MISCONFIGURED'
    }));
  } catch (error) {
    console.error('Status check error:', error);
    setJson(res);
    return res.status(500).end(JSON.stringify({ error: error.message }));
  }
}
