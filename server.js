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
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ valid: false, error: 'Missing fields for verification' });
  }

  try {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');
    const isValid = expectedSignature === razorpay_signature;
    if (!isValid) {
      return res.status(400).json({ valid: false, error: 'Invalid signature' });
    }
    return res.json({ valid: true });
  } catch (error) {
    return res.status(500).json({ valid: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));