import 'dotenv/config';
import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

// Gmail Email Service Health Check
app.get('/api/health', (req, res) => {
  try {
    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({
        status: 'error',
        service: 'gmail-email-service',
        timestamp: new Date().toISOString(),
        message: 'Gmail credentials not configured',
        details: {
          gmail_user: !!process.env.GMAIL_USER,
          gmail_password: !!process.env.GMAIL_APP_PASSWORD
        }
      });
    }

    // Create transporter and verify connection
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Test the connection
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Gmail health check failed:', error);
        
        let errorMessage = 'Gmail service health check failed';
        if (error.code === 'EAUTH') {
          errorMessage = 'Gmail authentication failed';
        } else if (error.code === 'ENOTFOUND') {
          errorMessage = 'Network connectivity issue';
        }

        return res.status(500).json({
          status: 'error',
          service: 'gmail-email-service',
          timestamp: new Date().toISOString(),
          message: errorMessage,
          error: error.message
        });
      }

      res.status(200).json({
        status: 'ok',
        service: 'gmail-email-service',
        timestamp: new Date().toISOString(),
        message: 'Gmail email service is running and configured correctly',
        details: {
          gmail_user: process.env.GMAIL_USER,
          smtp_ready: true
        }
      });
    });

  } catch (error) {
    console.error('❌ Gmail health check failed:', error);
    res.status(500).json({
      status: 'error',
      service: 'gmail-email-service',
      timestamp: new Date().toISOString(),
      message: 'Gmail service health check failed',
      error: error.message
    });
  }
});

// Send Email API
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, and html or text' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ 
        error: 'Invalid email address format' 
      });
    }

    // Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('📧 Gmail SMTP server is ready to send emails');
    } catch (verifyError) {
      console.error('❌ Gmail SMTP verification failed:', verifyError);
      return res.status(500).json({
        success: false,
        error: 'Email service configuration error. Please check Gmail credentials.'
      });
    }

    // Email configuration
    const mailOptions = {
      from: {
        name: 'Ashok Kumar Textiles',
        address: process.env.GMAIL_USER
      },
      to,
      subject,
      html,
      text: text || 'Please enable HTML to view this email properly.',
      headers: {
        'X-Mailer': 'Ashok Kumar Textiles Order System',
        'X-Priority': '3',
        'Importance': 'Normal'
      }
    };

    // Send email
    console.log('📧 Attempting to send email to:', to);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('📧 Email details:', {
      to,
      subject,
      messageId: info.messageId,
      response: info.response
    });

    // Return success response
    res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully via Gmail'
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send email';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed. Check email and app password.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Check internet connection.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email sending timed out. Please try again.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Gmail authentication error. Verify app password.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test Email API
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    const testEmail = email || 'test@example.com';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return res.status(400).json({ 
        error: 'Invalid email address format' 
      });
    }

    // Check Gmail credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({
        success: false,
        error: 'Gmail credentials not configured'
      });
    }

    // Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Test email template
    const testEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; margin-top: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Test Email</h1>
            <p>Ashok Kumar Textiles - Email Service Test</p>
          </div>
          
          <div class="content">
            <h2>Email Service Working Successfully! ✅</h2>
            <p>This is a test email to verify that the Gmail + Nodemailer integration is working correctly.</p>
            
            <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>📧 Email Details:</strong></p>
              <ul>
                <li>Service: Gmail SMTP</li>
                <li>Library: Nodemailer</li>
                <li>Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
                <li>Test recipient: ${testEmail}</li>
              </ul>
            </div>
            
            <p>If you received this email, the email service is configured and working properly!</p>
          </div>

          <div class="footer">
            <p><strong>Ashok Kumar Textiles</strong></p>
            <p>Quality textiles for every occasion</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: 'Ashok Kumar Textiles',
        address: process.env.GMAIL_USER
      },
      to: testEmail,
      subject: '🧪 Test Email - Ashok Kumar Textiles Email Service',
      html: testEmailHTML,
      text: `Test Email - Ashok Kumar Textiles\n\nThis is a test email to verify Gmail + Nodemailer integration.\n\nSent at: ${new Date().toLocaleString()}\nService: Gmail SMTP\nLibrary: Nodemailer\n\nIf you received this email, the service is working correctly!`
    };

    console.log('📧 Sending test email to:', testEmail);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Test email sent successfully:', info.messageId);

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    
    let errorMessage = 'Failed to send test email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed. Check credentials.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Check internet connection.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
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