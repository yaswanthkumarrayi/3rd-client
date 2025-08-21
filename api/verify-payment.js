import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    
    console.log('Verification request:', { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature: razorpay_signature ? 'PRESENT' : 'MISSING' 
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Missing fields for verification',
        received: { 
          razorpay_order_id: !!razorpay_order_id, 
          razorpay_payment_id: !!razorpay_payment_id, 
          razorpay_signature: !!razorpay_signature 
        }
      });
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
      return res.status(400).json({ 
        valid: false, 
        error: 'Invalid signature',
        details: 'Signature verification failed. This could be due to tampering or incorrect secret key.'
      });
    }

    return res.json({ 
      valid: true, 
      message: 'Signature verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
  } catch (error) {
    console.error('Signature verification error:', error);
    return res.status(500).json({ 
      valid: false, 
      error: 'Signature verification failed',
      details: error.message 
    });
  }
}
