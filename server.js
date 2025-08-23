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
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ Razorpay credentials not found in environment variables');
    console.log('Please check your .env file for RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  } else {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
  }
} catch (error) {
  console.error('❌ Error initializing Razorpay:', error.message);
}

const currentMode = (process.env.RAZORPAY_KEY_ID || '').startsWith('rzp_live') ? 'LIVE' : 'TEST';
console.log(`🔧 Razorpay mode: ${currentMode}`);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mode: currentMode
  });
});

// Razorpay status endpoint
app.get('/api/razorpay-status', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const hasSecret = !!process.env.RAZORPAY_KEY_SECRET;
  
  res.json({
    mode: currentMode,
    keyIdPrefix: keyId ? keyId.substring(0, 8) + '...' : 'NOT_SET',
    hasSecret: hasSecret,
    status: keyId && hasSecret ? 'CONFIGURED' : 'MISCONFIGURED',
    timestamp: new Date().toISOString()
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

    const { amount, currency = "INR" } = req.body;

    // Validate amount
    if (!amount || !Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({ 
        error: 'Invalid amount. Must be integer paise and at least 100 (₹1).' 
      });
    }

    // Create order
    const orderOptions = {
      amount: amount,
      currency: currency,
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: { 
        source: '3rd-client',
        environment: currentMode,
        created_at: new Date().toISOString()
      },
    };

    console.log('🏗️ Creating Razorpay order with options:', orderOptions);

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
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Missing required payment verification data'
      });
    }

    // Create expected signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
    
    // Verify signature
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );
    
    console.log('🔐 Payment verification result:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      isValid: isValid
    });
    
    if (isValid) {
      res.json({ 
        valid: true, 
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
      });
    } else {
      res.status(400).json({ 
        valid: false, 
        error: 'Payment signature verification failed'
      });
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'Payment verification service error'
    });
  }
});

// Test endpoint for debugging
app.post('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called with body:', req.body);
  res.json({ 
    message: 'Test endpoint working',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💳 Payment status: http://localhost:${PORT}/api/razorpay-status`);
  
  // Test Razorpay connection
  if (razorpay) {
    console.log('💰 Razorpay integration ready');
  } else {
    console.log('⚠️  Razorpay not configured - check environment variables');
  }
});