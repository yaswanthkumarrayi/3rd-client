// Test email API using Gmail + Nodemailer
import { createTransporter } from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const transporter = createTransporter({
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
}
