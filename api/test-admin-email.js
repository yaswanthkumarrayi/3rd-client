// Test Admin Email API
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

    // Check admin email
    const adminEmail = process.env.VITE_ADMIN_EMAIL || 'yash.freelancer17@gmail.com';
    console.log('Admin email:', adminEmail);

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

    // Test admin email template
    const adminEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admin Email Test</title>
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
            <h1>🛒 Admin Email Test</h1>
            <p>Ashok Kumar Textiles - Admin Notification Test</p>
          </div>
          
          <div class="content">
            <h2>Admin Email Service Working! ✅</h2>
            <p>This is a test email to verify that admin notifications are working correctly.</p>
            
            <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>📧 Test Details:</strong></p>
              <ul>
                <li>Service: Gmail SMTP</li>
                <li>Admin Email: ${adminEmail}</li>
                <li>Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
                <li>Test Type: Admin Notification</li>
              </ul>
            </div>
            
            <p>If you received this email, admin notifications are configured and working properly!</p>
          </div>

          <div class="footer">
            <p><strong>Ashok Kumar Textiles</strong></p>
            <p>Admin Notification System</p>
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
      subject: '🧪 Admin Email Test - Ashok Kumar Textiles',
      html: adminEmailHTML,
      text: `Admin Email Test - Ashok Kumar Textiles\n\nThis is a test email to verify admin notifications.\n\nAdmin Email: ${adminEmail}\nSent at: ${new Date().toLocaleString()}\nService: Gmail SMTP\n\nIf you received this email, admin notifications are working correctly!`
    };

    console.log('📧 Sending admin test email to:', adminEmail);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Admin test email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      message: `Admin test email sent successfully to ${adminEmail}`,
      messageId: info.messageId,
      adminEmail: adminEmail,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Admin test email failed:', error);
    
    let errorMessage = 'Failed to send admin test email';
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
