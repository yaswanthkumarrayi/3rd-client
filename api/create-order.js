// Secure Razorpay order creation endpoint for Vercel
import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency, receipt, notes } = req.body;

  if (!amount || !currency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount), // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Razorpay order creation failed' });
  }
}
