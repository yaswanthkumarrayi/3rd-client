import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = "INR" } = req.body;
    
    if (!Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({ 
        error: 'Invalid amount. Must be integer paise and at least 100.' 
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: { source: '3rd-client' },
    });

    console.log("Created Razorpay order:", { 
      id: order.id, 
      amount: order.amount, 
      currency: order.currency 
    });
    
    res.status(200).json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: err.message });
  }
}
