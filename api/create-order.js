import Razorpay from 'razorpay';
import crypto from 'crypto';

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

function validateAmount(amount) {
  return Number.isInteger(amount) && amount >= 100 && amount <= 15000000; // Max 1.5 lakh INR
}

function validateCurrency(currency) {
  const supportedCurrencies = ['INR', 'USD', 'EUR'];
  return supportedCurrencies.includes(currency);
}

function generateSecureReceipt() {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `rcpt_${timestamp}_${randomBytes}`;
}

export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method !== 'POST') {
    setJson(res);
    return res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    // Check if Razorpay is properly configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      setJson(res);
      return res.status(500).end(JSON.stringify({ 
        error: 'Payment gateway not configured. Please contact support.' 
      }));
    }

    const body = await parseBody(req);
    const { amount, currency = 'INR', customer_details, order_metadata } = body || {};

    // Validate required fields
    if (!amount) {
      setJson(res);
      return res.status(400).end(JSON.stringify({
        error: 'Amount is required'
      }));
    }

    // Validate amount
    if (!validateAmount(amount)) {
      setJson(res);
      return res.status(400).end(JSON.stringify({
        error: 'Invalid amount. Must be between ₹1 and ₹1,50,000 (in paise: 100-15000000)'
      }));
    }

    // Validate currency
    if (!validateCurrency(currency)) {
      setJson(res);
      return res.status(400).end(JSON.stringify({
        error: 'Unsupported currency. Supported: INR, USD, EUR'
      }));
    }

    // Prepare order data
    const orderData = {
      amount: parseInt(amount),
      currency: currency.toUpperCase(),
      receipt: generateSecureReceipt(),
      notes: {
        source: '3rd-client',
        environment: process.env.NODE_ENV || 'development',
        created_at: new Date().toISOString(),
        ...order_metadata
      },
    };

    // Add customer details if provided
    if (customer_details) {
      if (customer_details.email) {
        orderData.notes.customer_email = customer_details.email;
      }
      if (customer_details.phone) {
        orderData.notes.customer_phone = customer_details.phone;
      }
    }

    console.log('Creating Razorpay order with data:', {
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      notes_count: Object.keys(orderData.notes).length
    });

    const order = await razorpay.orders.create(orderData);

    console.log('Created Razorpay order successfully:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      receipt: order.receipt
    });

    // Return essential order information
    const response = {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      created_at: order.created_at
    };

    setJson(res);
    return res.status(200).end(JSON.stringify(response));
  } catch (err) {
    console.error('Error creating Razorpay order:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    // Handle specific Razorpay errors
    let errorMessage = 'Failed to create payment order';
    let statusCode = 500;

    if (err.statusCode) {
      statusCode = err.statusCode;
      if (err.error && err.error.description) {
        errorMessage = err.error.description;
      }
    }

    setJson(res);
    return res.status(statusCode).end(JSON.stringify({ 
      error: errorMessage,
      code: err.error?.code || 'UNKNOWN_ERROR'
    }));
  }
}
