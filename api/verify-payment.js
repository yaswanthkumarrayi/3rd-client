import crypto from 'crypto';

function setJson(res) {
  res.setHeader('Content-Type', 'application/json');
}

async function parseBody(req) {
  if (req.body) return req.body;
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    setJson(res);
    return res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const body = await parseBody(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};
    
    console.log('Verification request:', { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature: razorpay_signature ? 'PRESENT' : 'MISSING' 
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      setJson(res);
      return res.status(400).end(JSON.stringify({ 
        valid: false, 
        error: 'Missing fields for verification',
        received: { 
          razorpay_order_id: !!razorpay_order_id, 
          razorpay_payment_id: !!razorpay_payment_id, 
          razorpay_signature: !!razorpay_signature 
        }
      }));
    }

    // Create HMAC SHA256 hash
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    hmac.update(text);
    const expectedSignature = hmac.digest('hex');
    
    console.log('Signature verification:', {
      text,
      expectedSignature: expectedSignature.substring(0, 10) + '...',
      receivedSignature: razorpay_signature.substring(0, 10) + '...',
      isValid: expectedSignature === razorpay_signature
    });
    
    const isValid = expectedSignature === razorpay_signature;
    
    if (!isValid) {
      setJson(res);
      return res.status(400).end(JSON.stringify({ 
        valid: false, 
        error: 'Invalid signature',
        details: 'Signature verification failed. This could be due to tampering or incorrect secret key.'
      }));
    }

    setJson(res);
    return res.status(200).end(JSON.stringify({ 
      valid: true, 
      message: 'Signature verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    }));
  } catch (error) {
    console.error('Signature verification error:', error);
    setJson(res);
    return res.status(500).end(JSON.stringify({ 
      valid: false, 
      error: 'Signature verification failed',
      details: error.message 
    }));
  }
}
