import 'dotenv/config';
import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Import PaymentHandler (ES module)
import { PaymentHandler, APIException } from './PaymentHandler.js';

const app = express();
//chang
// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://ashok-textiles.vercel.app',
    'https://*.vercel.app',
    'https://textiles2.vercel.app',
    'https://www.ashokkumartextiles.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
app.get("/", (req, res) => {
  res.send("Hello from backend!");
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

// Admin Order Notification Email API
app.post('/api/send-admin-email', async (req, res) => {
  try {
    const { orderData } = req.body;

    // Validate orderData - using correct database schema
    if (!orderData || !orderData.id || !orderData.user_email) {
      return res.status(400).json({ 
        error: 'Missing required order data (id, user_email)' 
      });
    }

    // Check Gmail configuration
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    const adminEmail = process.env.VITE_ADMIN_EMAIL || gmailUser;

    if (!gmailUser || !gmailPassword) {
      console.error('❌ Gmail credentials not configured');
      return res.status(500).json({ 
        error: 'Email service not configured. Please contact administrator.' 
      });
    }

    if (gmailUser === 'your-email@gmail.com' || gmailPassword === 'your-16-digit-app-password') {
      console.error('❌ Gmail credentials are still placeholder values');
      return res.status(500).json({ 
        error: 'Email service not properly configured. Please contact administrator.' 
      });
    }

    // Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Generate admin email HTML
    const itemsHTML = orderData.items.map(item => {
      const details = [];
      if (item.fabric) details.push(`Fabric: ${item.fabric}`);
      if (item.category) details.push(`Category: ${item.category}`);
      if (item.selectedColor) details.push(`Color: ${item.selectedColor.name || item.selectedColor}`);
      const detailsStr = details.length > 0 ? `<br><small style="color: #666;">${details.join(' | ')}</small>` : '';
      
      const quantity = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      const total = price * quantity;
      
      // Color display with color box
      const colorDisplay = item.selectedColor ? `
        <br><small style="display: inline-flex; align-items: center; margin-top: 4px;">
          <span style="display: inline-block; width: 16px; height: 16px; background-color: ${item.selectedColor.hex || '#ccc'}; border: 1px solid #ddd; border-radius: 3px; margin-right: 6px;"></span>
          <strong>Color:</strong> ${item.selectedColor.name || 'Selected Color'}
        </small>
      ` : '';
      
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${item.name || 'Product'}</strong>
            ${detailsStr}
            ${colorDisplay}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${price.toLocaleString()}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${total.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const adminEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order - #${orderData.id}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #d946ef, #c026d3); color: white; padding: 24px; text-align: center; }
          .content { padding: 24px; }
          .alert { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 16px; border-radius: 6px; margin: 16px 0; }
          .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 16px 0; border: 1px solid #e5e7eb; }
          .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .table th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db; font-weight: bold; }
          .total-row { background: #ecfdf5; font-weight: bold; }
          .customer-info { background: #eff6ff; padding: 16px; border-left: 4px solid #3b82f6; margin: 16px 0; border-radius: 0 6px 6px 0; }
          .footer { background: #374151; color: white; padding: 20px; text-align: center; }
          .highlight { color: #d946ef; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 New Order Alert!</h1>
            <h2 style="margin: 8px 0;">Order #${orderData.id}</h2>
            <p style="margin: 0; opacity: 0.9;">Ashok Kumar Textiles - Admin Notification</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>⚡ New Order Received:</strong> A customer has placed an order and payment has been confirmed.
              <br><strong>📅 Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              <br><strong>⏰ Time:</strong> ${new Date().toLocaleTimeString('en-IN')}
            </div>

            <div class="customer-info">
              <h3 style="margin-top: 0; color: #1e40af;">👤 Customer Information</h3>
              <p><strong>Email:</strong> ${orderData.user_email}</p>
              <p><strong>Phone:</strong> ${orderData.phone || 'Not provided'}</p>
              <p><strong>Payment ID:</strong> <code>${orderData.payment_id || 'Not available'}</code></p>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #7c2d12;">📦 Order Details</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr class="total-row">
                    <td colspan="3" style="padding: 16px; text-align: right; font-weight: bold;">Order Total:</td>
                    <td style="padding: 16px; text-align: right; font-weight: bold; font-size: 18px; color: #d946ef;">₹${Number(orderData.amount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${orderData.address ? `
            <div class="customer-info">
              <h3 style="margin-top: 0; color: #059669;">🏠 Shipping Address</h3>
              <p>${orderData.address || ''}</p>
              <p>${orderData.city || ''}, ${orderData.state || ''}</p>
              <p><strong>PIN:</strong> ${orderData.pincode || ''}</p>
              <p><strong>Country:</strong> India</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 24px 0; padding: 20px; background: #fef3c7; border-radius: 8px;">
              <h3 style="color: #92400e; margin-top: 0;">⚡ Action Required</h3>
              <p style="margin-bottom: 0; color: #92400e;">Please process this order and prepare for shipping.</p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0;"><strong>Ashok Kumar Textiles</strong></p>
            <p style="margin: 5px 0 0 0; opacity: 0.8;">Order Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email configuration for admin
    const mailOptions = {
      from: {
        name: 'Ashok Kumar Textiles Order System',
        address: gmailUser
      },
      to: adminEmail,
      subject: `🛒 New Order #${orderData.id} - ₹${orderData.amount}`,
      html: adminEmailHTML,
      headers: {
        'X-Mailer': 'Ashok Kumar Textiles Order System',
        'X-Priority': '2',
        'Importance': 'High'
      }
    };

    // Send email
    console.log(`📧 Sending admin notification to: ${adminEmail}`);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Admin notification email sent successfully:', info.messageId);

    res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Admin notification email sent successfully via Gmail'
    });

  } catch (error) {
    console.error('❌ Admin email sending error:', error);
    
    let errorMessage = 'Failed to send admin notification email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed. Please check email credentials.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Please check internet connection.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
});

// Customer Order Confirmation Email API
app.post('/api/send-customer-email', async (req, res) => {
  try {
    const { orderData } = req.body;

    // Validate orderData - using correct database schema
    if (!orderData || !orderData.id || !orderData.user_email) {
      return res.status(400).json({ 
        error: 'Missing required order data (id, user_email)' 
      });
    }

    // Validate customer email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.user_email)) {
      return res.status(400).json({ 
        error: 'Invalid customer email address format' 
      });
    }

    // Check Gmail configuration
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      console.error('❌ Gmail credentials not configured');
      return res.status(500).json({ 
        error: 'Email service not configured. Please contact administrator.' 
      });
    }

    if (gmailUser === 'your-email@gmail.com' || gmailPassword === 'your-16-digit-app-password') {
      console.error('❌ Gmail credentials are still placeholder values');
      return res.status(500).json({ 
        error: 'Email service not properly configured. Please contact administrator.' 
      });
    }

    // Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Generate customer confirmation email HTML
    const itemsHTML = orderData.items.map(item => {
      const details = [];
      if (item.fabric) details.push(`Fabric: ${item.fabric}`);
      if (item.category) details.push(`Category: ${item.category}`);
      if (item.selectedColor) details.push(`Color: ${item.selectedColor.name || item.selectedColor}`);
      const detailsStr = details.length > 0 ? `<br><small style="color: #666;">${details.join(' | ')}</small>` : '';
      
      const quantity = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      const total = price * quantity;
      
      // Color display with color box for customer email
      const colorDisplay = item.selectedColor ? `
        <br><small style="display: inline-flex; align-items: center; margin-top: 4px;">
          <span style="display: inline-block; width: 16px; height: 16px; background-color: ${item.selectedColor.hex || '#ccc'}; border: 1px solid #ddd; border-radius: 3px; margin-right: 6px;"></span>
          <strong>Selected Color:</strong> ${item.selectedColor.name || 'Custom Color'}
        </small>
      ` : '';
      
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${item.name || 'Product'}</strong>
            ${detailsStr}
            ${colorDisplay}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${price.toLocaleString()}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${total.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const customerEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - #${orderData.id}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 24px; text-align: center; }
          .content { padding: 24px; }
          .success-badge { background: #d1fae5; border: 1px solid #10b981; color: #065f46; padding: 16px; border-radius: 6px; margin: 16px 0; text-align: center; }
          .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 16px 0; border: 1px solid #e5e7eb; }
          .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .table th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #d1d5db; font-weight: bold; }
          .total-row { background: #ecfdf5; font-weight: bold; }
          .shipping-info { background: #fef3c7; padding: 16px; border-left: 4px solid #f59e0b; margin: 16px 0; border-radius: 0 6px 6px 0; }
          .footer { background: #374151; color: white; padding: 20px; text-align: center; }
          .highlight { color: #10b981; font-weight: bold; }
          .next-steps { background: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <h2 style="margin: 8px 0;">Order #${orderData.id}</h2>
            <p style="margin: 0; opacity: 0.9;">Thank you for shopping with Ashok Kumar Textiles</p>
          </div>
          
          <div class="content">
            <div class="success-badge">
              <h3 style="margin: 0 0 8px 0; color: #065f46;">🎉 Payment Successful!</h3>
              <p style="margin: 0;">Your order has been confirmed and we're preparing it for shipment.</p>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #374151;">📦 Order Summary</h3>
              <p><strong>Order Number:</strong> <span class="highlight">${orderData.id}</span></p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Payment ID:</strong> <code>${orderData.paymentId}</code></p>
              
              <table class="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  ${orderData.shippingAmount && orderData.shippingAmount > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Shipping:</td>
                    <td style="padding: 12px; text-align: right;">₹${Number(orderData.shippingAmount).toLocaleString()}</td>
                  </tr>
                  ` : ''}
                  <tr class="total-row">
                    <td colspan="3" style="padding: 16px; text-align: right; font-weight: bold;">Order Total:</td>
                    <td style="padding: 16px; text-align: right; font-weight: bold; font-size: 18px; color: #10b981;">₹${Number(orderData.amount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${orderData.shippingAddress ? `
            <div class="shipping-info">
              <h3 style="margin-top: 0; color: #92400e;">🚚 Shipping Information</h3>
              <p><strong>Delivery Address:</strong></p>
              <p>${orderData.shippingAddress.street || ''}</p>
              <p>${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''}</p>
              <p><strong>PIN Code:</strong> ${orderData.shippingAddress.pincode || ''}</p>
              <p><strong>Country:</strong> ${orderData.shippingAddress.country || 'India'}</p>
            </div>
            ` : ''}

            <div class="next-steps">
              <h3 style="margin-top: 0; color: #1e40af;">📋 What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>We'll process your order within 1-2 business days</li>
                <li>You'll receive a shipping confirmation with tracking details</li>
                <li>Your order will be delivered within 5-7 business days</li>
                <li>Contact us if you have any questions about your order</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 24px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; border: 1px solid #16a34a;">
              <h3 style="color: #15803d; margin-top: 0;">💚 Thank You for Your Order!</h3>
              <p style="margin-bottom: 0; color: #15803d;">We appreciate your business and look forward to serving you again.</p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0;"><strong>Ashok Kumar Textiles</strong></p>
            <p style="margin: 5px 0; opacity: 0.8;">Premium Quality Fabrics & Textiles</p>
            <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 12px;">
              Need help? Contact us at ${gmailUser}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email configuration for customer
    const mailOptions = {
      from: {
        name: 'Ashok Kumar Textiles',
        address: gmailUser
      },
      to: orderData.user_email,
      subject: `✅ Order Confirmed #${orderData.id} - Thank you for your purchase!`,
      html: customerEmailHTML,
      headers: {
        'X-Mailer': 'Ashok Kumar Textiles Order System',
        'X-Priority': '3',
        'Importance': 'Normal'
      }
    };

    // Send email
    console.log(`📧 Sending order confirmation to: ${orderData.user_email}`);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Customer confirmation email sent successfully:', info.messageId);

    res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Customer confirmation email sent successfully via Gmail'
    });

  } catch (error) {
    console.error('❌ Customer email sending error:', error);
    
    let errorMessage = 'Failed to send customer confirmation email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed. Please check email credentials.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Please check internet connection.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message
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

// HDFC Payment Gateway Configuration (Production/Live)
const HDFC_CONFIG = {
  API_KEY: process.env.HDFC_API_KEY || "D5B755878234D26AC0C865AA253012",
  MERCHANT_ID: process.env.HDFC_MERCHANT_ID || "SG3514",
  CLIENT_ID: process.env.HDFC_CLIENT_ID || "hdfcmaster",
  BASE_URL: process.env.HDFC_BASE_URL || "https://smartgateway.hdfcbank.com",
  PAYMENT_ENDPOINT: process.env.HDFC_PAYMENT_ENDPOINT || "/merchant/ipay",
  RESPONSE_KEY: process.env.HDFC_RESPONSE_KEY || "9EFC035E8F043AFB88F37DEF30C16D",
  ENVIRONMENT: "production" // Live environment
};

// HDFC Create Order endpoint
app.post('/api/hdfc-create-order', async (req, res) => {
  console.log('🏦 HDFC Create order request received:', {
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    const { amount, productinfo, firstname, lastname, email, phone, address, city, state, pincode } = req.body;

    // Validate required fields
    if (!amount || !firstname || !email || !phone) {
      console.log('❌ HDFC validation failed:', { amount, firstname, email, phone });
      return res.status(400).json({ 
        error: 'Missing required fields: amount, firstname, email, phone' 
      });
    }

    console.log('✅ HDFC validation passed, processing payment...');

    // Create PaymentHandler instance
    let paymentHandler;
    try {
      console.log('🔧 Initializing PaymentHandler...');
      paymentHandler = PaymentHandler.getInstance();
      console.log('✅ PaymentHandler initialized successfully');
    } catch (initError) {
      console.error('❌ PaymentHandler initialization failed:', initError);
      return res.status(500).json({ 
        error: 'Payment gateway initialization failed',
        details: initError.message 
      });
    }
    
    // Generate unique order ID
    const orderId = `order_${Date.now()}`;
    
    // Create return URL for HDFC callback
    const baseUrl = process.env.VITE_API_BASE_URL || 'https://textilesbackend.vercel.app';
    const returnUrl = `${baseUrl}/api/hdfc-payment-response`;

    console.log('🔗 Using return URL:', returnUrl);

    // Prepare order session data
    const orderSessionData = {
      order_id: orderId,
      amount: parseFloat(amount),
      currency: "INR",
      return_url: returnUrl,
      customer_id: email,
    };

    console.log('🔄 Creating HDFC order session with PaymentHandler...');
    
    // Use PaymentHandler to create order session
    const orderSessionResp = await paymentHandler.orderSession(orderSessionData);
    
    console.log('✅ HDFC order session created:', orderSessionResp);

    // Return response in the format expected by frontend
    return res.status(200).json({
      success: true,
      order_id: orderSessionResp.id || orderId,
      payment_url: orderSessionResp.payment_links.web,
      payment_data: orderSessionResp,
      hdfc_response: orderSessionResp,
      return_url: returnUrl
    });

  } catch (error) {
    console.error('❌ HDFC Create Order Error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      httpResponseCode: error.httpResponseCode,
      errorCode: error.errorCode,
      errorMessage: error.errorMessage
    });
    
    if (error.name === 'APIException') {
      return res.status(error.httpResponseCode || 500).json({ 
        error: 'HDFC API Error: ' + error.errorMessage,
        details: error.errorCode,
        status: error.status
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to create HDFC payment order',
      details: error.message,
      type: error.name || 'Unknown Error'
    });
  }
});

function generateHDFCForm(paymentData, actionUrl) {
  let formHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting to HDFC Payment Gateway...</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .loader {
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid #fff;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .details {
          background: rgba(255,255,255,0.2);
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🏦 HDFC Bank Payment Gateway</div>
        <h2>Redirecting to Secure Payment...</h2>
        <div class="loader"></div>
        
        <div class="details">
          <strong>Order ID:</strong> ${paymentData.order_id}<br>
          <strong>Amount:</strong> ₹${paymentData.amount}<br>
          <strong>Customer:</strong> ${paymentData.billing_name}
        </div>
        
        <p>Please wait while we redirect you to the secure HDFC payment page...</p>
        
        <form id="hdfcPaymentForm" action="${actionUrl}" method="POST">
  `;

  // Add all form fields
  Object.keys(paymentData).forEach(key => {
    if (paymentData[key] !== undefined && paymentData[key] !== null) {
      formHTML += `          <input type="hidden" name="${key}" value="${paymentData[key]}" />\\n`;
    }
  });

  formHTML += `
        </form>
        
        <button onclick="document.getElementById('hdfcPaymentForm').submit()" 
                style="background: #28a745; color: white; border: none; padding: 12px 24px; 
                       border-radius: 6px; cursor: pointer; font-size: 16px;">
          Continue to Payment
        </button>
      </div>

      <script>
        // Auto-submit after 3 seconds
        setTimeout(function() {
          document.getElementById('hdfcPaymentForm').submit();
        }, 3000);
      </script>
    </body>
    </html>
  `;

  return formHTML;
}

// HDFC Test Payment Page (for development/testing)
app.all('/api/hdfc-test-payment', async (req, res) => {
  console.log('🧪 HDFC Test Payment Page accessed:', {
    method: req.method,
    body: req.body,
    query: req.query
  });

  // Simulate HDFC payment page
  const testPaymentPage = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>HDFC Payment Gateway - Test Environment</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 600px; 
          margin: 50px auto; 
          padding: 20px;
          background: #f5f5f5;
        }
        .payment-container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .hdfc-logo {
          text-align: center;
          color: #004088;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .amount {
          font-size: 32px;
          color: #004088;
          text-align: center;
          margin: 20px 0;
        }
        .details {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .button {
          width: 100%;
          padding: 15px;
          margin: 10px 0;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        }
        .success { background: #28a745; color: white; }
        .failure { background: #dc3545; color: white; }
        .note {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="payment-container">
        <div class="hdfc-logo">🏦 HDFC Bank Payment Gateway</div>
        <div class="note">
          <strong>⚠️ TEMPORARY LOCAL TEST ENVIRONMENT</strong><br>
          <strong>IMPORTANT:</strong> HDFC smartgateway URLs are currently not accessible (404 errors).<br>
          This is a local simulation for development. In production, you'll need to:<br>
          • Contact HDFC for correct gateway URLs<br>
          • Verify your merchant account credentials<br>
          • Get proper UAT/Production endpoints
        </div>
        
        <div class="amount">₹ ${req.body?.amount || req.query?.amount || '0'}</div>
        
        <div class="details">
          <strong>Transaction Details:</strong><br>
          Transaction ID: ${req.body?.txnid || req.query?.txnid || 'TEST_' + Date.now()}<br>
          Merchant: ${req.body?.merchant_id || req.query?.merchant_id || 'Test Merchant'}<br>
          Email: ${req.body?.email || req.query?.email || 'test@example.com'}
        </div>

        <button class="button success" onclick="simulateSuccess()">
          ✅ Simulate Successful Payment
        </button>
        
        <button class="button failure" onclick="simulateFailure()">
          ❌ Simulate Failed Payment
        </button>
      </div>

      <script>
        function simulateSuccess() {
          alert('✅ Payment Successful! (Simulated)\\n\\nIn production, this would redirect to your success URL with payment confirmation.');
          // In production, this would redirect to the success URL
          window.location.href = '/payment/success?status=success&txnid=' + (new URLSearchParams(window.location.search).get('txnid') || 'TEST_' + Date.now());
        }

        function simulateFailure() {
          alert('❌ Payment Failed! (Simulated)\\n\\nIn production, this would redirect to your failure URL.');
          // In production, this would redirect to the failure URL
          window.location.href = '/payment/failure?status=failed&txnid=' + (new URLSearchParams(window.location.search).get('txnid') || 'TEST_' + Date.now());
        }
      </script>
    </body>
    </html>
  `;

  return res.status(200).send(testPaymentPage);
});

// HDFC Payment Success Handler
app.post('/api/hdfc-payment-success', (req, res) => {
  console.log('✅ HDFC Payment Success:', req.body);
  // Handle success logic here
  res.redirect(`http://localhost:5174/payment/success?txnid=${req.body.txnid}`);
});

// HDFC Payment Failure Handler
app.post('/api/hdfc-payment-failure', (req, res) => {
  console.log('❌ HDFC Payment Failure:', req.body);
  // Handle failure logic here
  res.redirect(`http://localhost:5174/payment/failure?txnid=${req.body.txnid}`);
});

// HDFC Payment Cancel Handler
app.post('/api/hdfc-payment-cancel', (req, res) => {
  console.log('🚫 HDFC Payment Cancelled:', req.body);
  // Handle cancel logic here
  res.redirect(`http://localhost:5174/payment/cancel?txnid=${req.body.txnid}`);
});

// HDFC Payment Response Handler (New - for actual HDFC integration)
app.all('/api/hdfc-payment-response', async (req, res) => {
  console.log('🏦 HDFC Payment Response received:', {
    method: req.method,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  try {
    const orderId = req.body.order_id || req.body.orderId || req.query.order_id;
    const status = req.body.status || req.query.status;
    const amount = req.body.amount || req.query.amount;
    const hash = req.body.hash || req.query.hash;

    if (!orderId) {
      console.error('❌ Missing order_id in HDFC response');
      return res.redirect(`http://localhost:5174/payment/failure?error=missing_order_id`);
    }

    // Verify the payment status with PaymentHandler
    try {
      const paymentHandler = PaymentHandler.getInstance();
      const orderStatusResult = await paymentHandler.orderStatus(orderId);
      
      console.log('📊 HDFC Order Status Check:', orderStatusResult);
      
      // Use the verified status from PaymentHandler
      const verifiedStatus = orderStatusResult.status || status;
      
      // Determine payment status and redirect accordingly
      let redirectUrl;
      const baseUrl = 'http://localhost:5174';

      switch (verifiedStatus) {
        case 'CHARGED':
        case 'SUCCESS':
        case 'COMPLETED':
          console.log('✅ HDFC payment successful for order:', orderId);
          redirectUrl = `${baseUrl}/payment/success?status=success&order_id=${orderId}&gateway=HDFC&amount=${amount || ''}`;
          break;
          
        case 'PENDING':
        case 'PENDING_VBV':
          console.log('⏳ HDFC payment pending for order:', orderId);
          redirectUrl = `${baseUrl}/payment/success?status=pending&order_id=${orderId}&gateway=HDFC&amount=${amount || ''}&message=Payment is being processed`;
          break;
          
        case 'AUTHORIZATION_FAILED':
        case 'AUTHENTICATION_FAILED':
        case 'FAILED':
        case 'CANCELLED':
        default:
          console.log('❌ HDFC payment failed for order:', orderId, 'Status:', verifiedStatus);
          redirectUrl = `${baseUrl}/payment/failure?status=failed&order_id=${orderId}&gateway=HDFC&error=${verifiedStatus || 'payment_failed'}`;
          break;
      }

      // Redirect to the appropriate page
      return res.redirect(redirectUrl);
      
    } catch (statusError) {
      console.error('⚠️ Could not verify order status with PaymentHandler:', statusError);
      // Fall back to the status from the callback
      let redirectUrl;
      const baseUrl = 'http://localhost:5174';

      switch (status) {
        case 'CHARGED':
        case 'SUCCESS':
        case 'COMPLETED':
          console.log('✅ HDFC payment successful for order (fallback):', orderId);
          redirectUrl = `${baseUrl}/payment/success?status=success&order_id=${orderId}&gateway=HDFC&amount=${amount || ''}`;
          break;
          
        case 'PENDING':
        case 'PENDING_VBV':
          console.log('⏳ HDFC payment pending for order (fallback):', orderId);
          redirectUrl = `${baseUrl}/payment/success?status=pending&order_id=${orderId}&gateway=HDFC&amount=${amount || ''}&message=Payment is being processed`;
          break;
          
        case 'AUTHORIZATION_FAILED':
        case 'AUTHENTICATION_FAILED':
        case 'FAILED':
        case 'CANCELLED':
        default:
          console.log('❌ HDFC payment failed for order (fallback):', orderId, 'Status:', status);
          redirectUrl = `${baseUrl}/payment/failure?status=failed&order_id=${orderId}&gateway=HDFC&error=${status || 'payment_failed'}`;
          break;
      }

      return res.redirect(redirectUrl);
    }

  } catch (error) {
    console.error('💥 HDFC Payment Response Error:', error);
    return res.redirect(`http://localhost:5174/payment/failure?error=server_error&message=${encodeURIComponent(error.message)}`);
  }
});

// 404 handle
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// Export the app for Vercel
export default app;

// Only start the server if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Payment Server v2.0.0 running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💳 Payment status: http://localhost:${PORT}/api/razorpay-status`);
    console.log(`🔧 Razorpay mode: ${currentMode}`);
    
    if (razorpay) {
      console.log('✅ Razorpay integration ready');
    } else {
      console.log('⚠️  Razorpay not configured - check environment variables');
    }
    
    console.log('🏦 HDFC Payment Gateway ready');
    console.log('📋 Available endpoints:');
    console.log('  GET  /api/health');
    console.log('  GET  /api/razorpay-status');
    console.log('  POST /api/create-order');
    console.log('  POST /api/verify-payment');
    console.log('  POST /api/send-email');
    console.log('  POST /api/send-admin-email');
    console.log('  POST /api/send-customer-email');
    console.log('  POST /api/test-email');
    console.log('  POST /api/hdfc-create-order');
    console.log('  ALL  /api/hdfc-payment-response');
    console.log('  POST /api/hdfc-payment-success');
    console.log('  POST /api/hdfc-payment-failure');
    console.log('  POST /api/hdfc-payment-cancel');
    console.log('  POST /api/test');
  });
}