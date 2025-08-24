// Direct Admin Email API - Similar to test email but for admin notifications
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
    const { orderData } = req.body;
    
    // Use hardcoded admin email (same as test email works)
    const adminEmail = 'yash.freelancer17@gmail.com';

    // Check Gmail credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({
        success: false,
        error: 'Gmail credentials not configured'
      });
    }

    // Gmail SMTP configuration - Same as test email
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

    // Generate admin email HTML (simplified version)
    const adminEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order - ${orderData?.orderNumber || 'AKT-XXX'}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { background: #333; color: white; padding: 15px; text-align: center; margin-top: 20px; border-radius: 8px; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 12px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 New Order Received!</h1>
            <p>Order #${orderData?.orderNumber || 'AKT-XXX'}</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Ashok Kumar Textiles Admin Notification</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>⚡ Action Required:</strong> A new order has been placed and requires your attention.
              <br><strong>📅 Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}
            </div>

            <div class="order-details">
              <h2 style="margin-top: 0; color: #2563eb;">👤 Customer Information</h2>
              <p><strong>Name:</strong> ${orderData?.customerName || 'Customer'}</p>
              <p><strong>Email:</strong> <a href="mailto:${orderData?.customerEmail || ''}">${orderData?.customerEmail || 'No email'}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${orderData?.customerPhone || ''}">${orderData?.customerPhone || 'No phone'}</a></p>
              <p><strong>Payment ID:</strong> ${orderData?.paymentId || 'N/A'}</p>
            </div>

            <div class="order-details">
              <h2 style="margin-top: 0; color: #2563eb;">🛍️ Order Items</h2>
              <p><strong>Total Amount:</strong> ₹${orderData?.totalAmount || '0'}</p>
              <p><strong>Items:</strong> ${orderData?.items?.length || 0} item(s)</p>
            </div>

            <div class="order-details">
              <h2 style="margin-top: 0; color: #2563eb;">📍 Shipping Address</h2>
              <p style="margin: 0;">
                ${orderData?.shippingAddress?.street || 'Address not provided'}<br>
                ${orderData?.shippingAddress?.city || ''}, ${orderData?.shippingAddress?.state || ''} ${orderData?.shippingAddress?.pincode || ''}<br>
                ${orderData?.shippingAddress?.country || 'India'}
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
      subject: `🛒 New Order #${orderData?.orderNumber || 'AKT-XXX'} - ${orderData?.customerName || 'Customer'} (₹${orderData?.totalAmount || '0'})`,
      html: adminEmailHTML,
      text: `New Order - ${orderData?.orderNumber || 'AKT-XXX'}\n\nCustomer: ${orderData?.customerName || 'Customer'}\nEmail: ${orderData?.customerEmail || 'No email'}\nPhone: ${orderData?.customerPhone || 'No phone'}\nTotal: ₹${orderData?.totalAmount || '0'}\nPayment ID: ${orderData?.paymentId || 'N/A'}\n\nThis is an admin notification from Ashok Kumar Textiles.`
    };

    console.log('📧 Sending admin email to:', adminEmail);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Admin email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      message: `Admin email sent successfully to ${adminEmail}`,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Admin email failed:', error);
    
    let errorMessage = 'Failed to send admin email';
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
