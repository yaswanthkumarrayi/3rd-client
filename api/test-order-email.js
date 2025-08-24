// Test Order Email API - sends a sample admin notification email
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check Gmail credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({
        success: false,
        error: 'Gmail credentials not configured'
      });
    }

    const adminEmail = 'yash.freelancer17@gmail.com';

    // Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      secure: true,
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 25000,
      greetingTimeout: 25000,
      socketTimeout: 25000
    });

    // Sample order data for testing
    const sampleOrderData = {
      orderNumber: 'AKT-TEST-123',
      customerName: 'Test Customer',
      customerEmail: 'customer@example.com',
      customerPhone: '+91-9876543210',
      items: [
        {
          name: 'Beautiful Silk Saree',
          price: 2500,
          quantity: 1,
          color: 'Red',
          size: 'Free Size'
        },
        {
          name: 'Cotton Kurta',
          price: 1200,
          quantity: 2,
          color: 'Blue',
          size: 'L'
        }
      ],
      totalAmount: 4900,
      shippingAddress: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        country: 'India'
      },
      paymentId: 'pay_test123456789'
    };

    // Generate admin order email HTML
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(price);
    };

    const itemsHTML = sampleOrderData.items.map(item => {
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong><br>
            <small>Color: ${item.color} | Size: ${item.size}</small>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `;
    }).join('');

    const adminEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Order - ${sampleOrderData.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .table th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .total-row { background: #f0f8ff; font-weight: bold; }
          .address { background: #f8f9fa; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 12px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 TEST ORDER RECEIVED!</h1>
            <p>Order #${sampleOrderData.orderNumber}</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Ashok Kumar Textiles Admin Notification</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>🧪 THIS IS A TEST EMAIL</strong> - Testing admin notification system
              <br><strong>📅 Test Date:</strong> ${new Date().toLocaleDateString('en-IN')}
            </div>

            <div class="order-details">
              <h2 style="margin-top: 0; color: #2563eb;">👤 Customer Information</h2>
              <p><strong>Name:</strong> ${sampleOrderData.customerName}</p>
              <p><strong>Email:</strong> <a href="mailto:${sampleOrderData.customerEmail}">${sampleOrderData.customerEmail}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${sampleOrderData.customerPhone}">${sampleOrderData.customerPhone}</a></p>
              <p><strong>Payment ID:</strong> ${sampleOrderData.paymentId}</p>
            </div>

            <div class="order-details">
              <h2 style="margin-top: 0; color: #2563eb;">🛍️ Order Items</h2>
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
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 16px;"><strong>Grand Total:</strong></td>
                    <td style="padding: 12px; text-align: right; font-size: 16px; color: #2563eb;"><strong>${formatPrice(sampleOrderData.totalAmount)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="address">
              <h3 style="margin-top: 0; color: #2563eb;">📍 Shipping Address</h3>
              <p style="margin: 0;">
                ${sampleOrderData.shippingAddress.street}<br>
                ${sampleOrderData.shippingAddress.city}, ${sampleOrderData.shippingAddress.state} ${sampleOrderData.shippingAddress.pincode}<br>
                ${sampleOrderData.shippingAddress.country}
              </p>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #2563eb;">📋 Next Steps</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Review and confirm the order details</li>
                <li>Verify payment status in Razorpay dashboard</li>
                <li>Prepare items for packaging</li>
                <li>Generate shipping label and tracking number</li>
                <li>Update customer with shipping confirmation</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0; font-weight: bold;">Ashok Kumar Textiles Admin Panel</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">This email was sent via Gmail SMTP. Please log in to the admin panel to manage this order.</p>
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
      to: adminEmail,
      subject: `🧪 TEST ORDER - Admin Notification Test - Ashok Kumar Textiles`,
      html: adminEmailHTML,
      text: `TEST ORDER NOTIFICATION\n\nOrder: ${sampleOrderData.orderNumber}\nCustomer: ${sampleOrderData.customerName}\nTotal: ${formatPrice(sampleOrderData.totalAmount)}\n\nThis is a test of the admin notification system.`
    };

    console.log('📧 Sending test order email to admin:', adminEmail);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Test order email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      message: `Test order notification sent successfully to ${adminEmail}`,
      messageId: info.messageId,
      adminEmail: adminEmail,
      orderNumber: sampleOrderData.orderNumber,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test order email failed:', error);
    
    let errorMessage = 'Failed to send test order email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed. Check credentials.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Check internet connection.';
    }

    return res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
}
