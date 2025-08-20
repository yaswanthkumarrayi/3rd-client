import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const currentMode = (process.env.RAZORPAY_KEY_ID || '').startsWith('rzp_live') ? 'LIVE' : 'TEST';
console.log(`Razorpay mode: ${currentMode}`);

// Diagnostic endpoint to verify Razorpay configuration
app.get('/api/razorpay-status', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const hasSecret = !!process.env.RAZORPAY_KEY_SECRET;
  
  res.json({
    mode: currentMode,
    keyIdPrefix: keyId ? keyId.substring(0, 8) + '...' : 'NOT_SET',
    hasSecret: hasSecret,
    status: keyId && hasSecret ? 'CONFIGURED' : 'MISCONFIGURED'
  });
});

// Test signature generation endpoint for debugging
app.post('/api/test-signature', (req, res) => {
  const { order_id, payment_id } = req.body;
  
  if (!order_id || !payment_id) {
    return res.status(400).json({ error: 'Missing order_id or payment_id' });
  }
  
  try {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    const text = `${order_id}|${payment_id}`;
    hmac.update(text);
    const signature = hmac.digest('hex');
    
    res.json({
      order_id,
      payment_id,
      text,
      signature,
      signature_length: signature.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-order', async (req, res) => {
  const { amount, currency = "INR" } = req.body;
  try {
    if (!Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount. Must be integer paise and at least 100.' });
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: { source: '3rd-client' },
    });
    console.log("Created Razorpay order:", { id: order.id, amount: order.amount, currency: order.currency });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment signature
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  
  console.log('Verification request:', { razorpay_order_id, razorpay_payment_id, razorpay_signature: razorpay_signature ? 'PRESENT' : 'MISSING' });
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ 
      valid: false, 
      error: 'Missing fields for verification',
      received: { razorpay_order_id: !!razorpay_order_id, razorpay_payment_id: !!razorpay_payment_id, razorpay_signature: !!razorpay_signature }
    });
  }

  try {
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
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));