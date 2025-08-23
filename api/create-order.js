// Secure Razorpay order creation endpoint for Vercel
import Razorpay from 'razorpay';

export default async function handler(req, res) {
  console.log('📦 API Create order request:', {
    method: req.method,
    timestamp: new Date().toISOString(),
    hasBody: !!req.body
  });

  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get environment variables - check both possible names
    const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log('🔑 Environment check:', {
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
      keyIdPrefix: keyId ? keyId.substring(0, 8) + '...' : 'NOT_SET'
    });
    
    if (!keyId || !keySecret) {
      console.error('❌ Razorpay credentials missing:', {
        keyId: !!keyId,
        keySecret: !!keySecret
      });
      return res.status(500).json({ 
        error: 'Payment gateway not configured. Please contact support.',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Initialize Razorpay with error handling
    let razorpay;
    try {
      razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log('✅ Razorpay initialized successfully');
    } catch (initError) {
      console.error('❌ Razorpay initialization failed:', initError);
      return res.status(500).json({ 
        error: 'Payment gateway initialization failed',
        code: 'RAZORPAY_INIT_FAILED'
      });
    }

    const { amount, currency = 'INR', customer_details, order_metadata, receipt, notes } = req.body || {};

    console.log('📋 Order request details:', {
      amount,
      currency,
      hasCustomerDetails: !!customer_details,
      hasOrderMetadata: !!order_metadata
    });

    // Validate required fields
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Validate amount
    if (!Number.isInteger(amount) || amount < 100 || amount > 15000000) {
      return res.status(400).json({ 
        error: 'Invalid amount. Must be between ₹1 and ₹1,50,000 (in paise: 100-15000000)' 
      });
    }

    // Validate currency
    const supportedCurrencies = ['INR', 'USD', 'EUR'];
    if (!supportedCurrencies.includes(currency)) {
      return res.status(400).json({ 
        error: 'Unsupported currency. Supported: INR, USD, EUR' 
      });
    }

    // Prepare order data
    const orderOptions = {
      amount: Math.round(amount), // amount in paise
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        orderOptions.notes.customer_email = customer_details.email;
      }
      if (customer_details.phone) {
        orderOptions.notes.customer_phone = customer_details.phone;
      }
    }

    console.log('🏗️ Creating Razorpay order with options:', {
      amount: orderOptions.amount,
      currency: orderOptions.currency,
      receipt: orderOptions.receipt,
      notesCount: Object.keys(orderOptions.notes).length
    });

    // Create the order
    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
      console.log('✅ Razorpay order created successfully:', {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status
      });
    } catch (razorpayError) {
      console.error('❌ Razorpay order creation failed:', {
        message: razorpayError.message,
        statusCode: razorpayError.statusCode,
        error: razorpayError.error
      });
      
      let statusCode = 500;
      let errorMessage = 'Failed to create payment order';

      if (razorpayError.statusCode) {
        statusCode = razorpayError.statusCode;
      }
      
      if (razorpayError.error && razorpayError.error.description) {
        errorMessage = razorpayError.error.description;
      } else if (razorpayError.message) {
        errorMessage = razorpayError.message;
      }

      return res.status(statusCode).json({ 
        error: errorMessage,
        code: razorpayError.error?.code || 'RAZORPAY_ORDER_FAILED'
      });
    }

    const response = {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      created_at: order.created_at
    };

    console.log('📤 Sending response:', response);
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Unexpected error in create-order:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'UNEXPECTED_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
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
