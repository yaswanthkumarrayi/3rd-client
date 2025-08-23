// Secure Razorpay order creation endpoint
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Utility functions
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
  // Set CORS and security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    setJson(res);
    return res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }

  console.log('📦 Create order request received:', {
    timestamp: new Date().toISOString(),
    method: req.method
  });

  try {
    // Check environment variables - use the correct variable names
    const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      console.error('❌ Razorpay credentials not found in environment variables');
      setJson(res);
      return res.status(500).end(JSON.stringify({ 
        error: 'Payment gateway not configured. Please contact support.',
        code: 'MISSING_CREDENTIALS'
      }));
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await parseBody(req);
    const { amount, currency = 'INR', customer_details, order_metadata, receipt, notes } = body || {};

    console.log('📋 Order request details:', {
      amount,
      currency,
      hasCustomerDetails: !!customer_details
    });

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
      amount: Math.round(parseInt(amount)), // Ensure it's an integer
      currency: currency.toUpperCase(),
      receipt: receipt || generateSecureReceipt(),
      payment_capture: 1, // Auto capture payment
      notes: {
        source: '3rd-client',
        environment: keyId?.startsWith('rzp_live') ? 'LIVE' : 'TEST',
        created_at: new Date().toISOString(),
        ...notes,
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

    console.log('🏗️ Creating Razorpay order with data:', {
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      notes_count: Object.keys(orderData.notes).length
    });

    const order = await razorpay.orders.create(orderData);

    console.log('✅ Razorpay order created successfully:', {
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

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Handle specific Razorpay errors
    let errorMessage = 'Failed to create payment order';
    let statusCode = 500;

    if (error.statusCode) {
      statusCode = error.statusCode;
      if (error.error && error.error.description) {
        errorMessage = error.error.description;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    setJson(res);
    return res.status(statusCode).end(JSON.stringify({ 
      error: errorMessage,
      code: error.error?.code || 'CREATE_ORDER_FAILED'
    }));
  }
}
