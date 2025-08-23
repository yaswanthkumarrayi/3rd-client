import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      setJson(res);
      return res.status(500).end(JSON.stringify({ error: 'Razorpay keys not configured' }));
    }

    const body = await parseBody(req);
    const { amount, currency = 'INR' } = body || {};

    if (!Number.isInteger(amount) || amount < 100) {
      setJson(res);
      return res.status(400).end(JSON.stringify({
        error: 'Invalid amount. Must be integer paise and at least 100.'
      }));
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: { source: '3rd-client' },
    });

    console.log('Created Razorpay order:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });

    setJson(res);
    return res.status(200).end(JSON.stringify(order));
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    setJson(res);
    return res.status(500).end(JSON.stringify({ error: err.message }));
  }
}
