import 'dotenv/config';
import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import crypto from 'crypto';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Initialize Razorpay
let razorpay = null;
try {
  const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    console.error('❌ Razorpay credentials not found in environment variables');
    console.log('Please check your .env file for RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  } else {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log('✅ Razorpay initialized successfully');
  }
} catch (error) {
  console.error('❌ Error initializing Razorpay:', error.message);
}

const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
const currentMode = keyId?.startsWith('rzp_live') ? 'LIVE' : 'TEST';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mode: currentMode,
    service: '3rd-client-payment-server',
    version: '2.0.0'
  });
});

// Razorpay status endpoint
app.get('/api/razorpay-status', (req, res) => {
  const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const hasSecret = !!process.env.RAZORPAY_KEY_SECRET;
  
  res.json({
    mode: currentMode,
    keyIdPrefix: keyId ? keyId.substring(0, 8) + '...' : 'NOT_SET',
    hasSecret: hasSecret,
    status: keyId && hasSecret ? 'CONFIGURED' : 'MISCONFIGURED',
    timestamp: new Date().toISOString(),
    service: 'razorpay-payment-gateway',
    version: '1.0.0'
  });
});

// Create Razorpay order
app.post('/api/create-order', async (req, res) => {
  console.log('📦 Create order request received:', {
    amount: req.body.amount,
    currency: req.body.currency,
    timestamp: new Date().toISOString()
  });

  try {
    if (!razorpay) {
      throw new Error('Razorpay not initialized. Check your credentials.');
    }

    const { amount, currency = "INR", customer_details, order_metadata, receipt, notes } = req.body;

    // Validate amount
    if (!amount || !Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({ 
        error: 'Invalid amount. Must be integer paise and at least 100 (₹1).' 
      });
    }

    // Create order
    const orderOptions = {
      amount: Math.round(amount),
      currency: currency,
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payment_capture: 1, // Auto capture payment
      notes: { 
        source: '3rd-client',
        environment: currentMode,
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
      receipt: orderOptions.receipt
    });

    const order = await razorpay.orders.create(orderOptions);

    console.log('✅ Razorpay order created successfully:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      created_at: order.created_at
    });

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    
    let statusCode = 500;
    let errorMessage = 'Failed to create payment order';

    if (error.statusCode) {
      statusCode = error.statusCode;
    }
    
    if (error.error && error.error.description) {
      errorMessage = error.error.description;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({ 
      error: errorMessage,
      code: error.error?.code || 'CREATE_ORDER_FAILED'
    });
  }
});

// Verify payment signature
app.post('/api/verify-payment', (req, res) => {
  console.log('🔐 Payment verification request received');

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    console.log('🔍 Verification request details:', {
      hasOrderId: !!razorpay_order_id,
      hasPaymentId: !!razorpay_payment_id,
      hasSignature: !!razorpay_signature
    });
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Missing required payment verification data',
        received: { 
          razorpay_order_id: !!razorpay_order_id, 
          razorpay_payment_id: !!razorpay_payment_id, 
          razorpay_signature: !!razorpay_signature 
        }
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('❌ Razorpay secret key not found');
      return res.status(500).json({ 
        valid: false, 
        error: 'Payment verification service not configured'
      });
    }

    // Create expected signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');
    
    // Verify signature using timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );
    
    console.log('🔐 Payment verification result:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      isValid: isValid,
      timestamp: new Date().toISOString()
    });
    
    if (isValid) {
      res.json({ 
        valid: true, 
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        verified_at: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        valid: false, 
        error: 'Payment signature verification failed',
        code: 'INVALID_SIGNATURE'
      });
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'Payment verification service error',
      code: 'VERIFICATION_ERROR'
    });
  }
});

// Test endpoint for debugging
app.post('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called with body:', req.body);
  res.json({ 
    message: 'Test endpoint working',
    receivedData: req.body,
    timestamp: new Date().toISOString(),
    server: 'express-3rd-client'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  if (!res.headersSent) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Payment Server v2.0.0 running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💳 Payment status: http://localhost:${PORT}/api/razorpay-status`);
  console.log(`🔧 Razorpay mode: ${currentMode}`);
  
  if (razorpay) {
    console.log('✅ Razorpay integration ready');
  } else {
    console.log('⚠️  Razorpay not configured - check environment variables');
  }
  
  console.log('📋 Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/razorpay-status');
  console.log('  POST /api/create-order');
  console.log('  POST /api/verify-payment');
  console.log('  POST /api/test');
});