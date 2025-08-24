// Health check API for Gmail email service
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      secure: true,
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 25000,
      greetingTimeout: 25000,
      socketTimeout: 25000
    });

    // Test the connection
    await transporter.verify();

    return res.status(200).json({
      status: 'ok',
      service: 'gmail-email-service',
      timestamp: new Date().toISOString(),
      message: 'Gmail email service is running and configured correctly',
      details: {
        gmail_user: process.env.GMAIL_USER,
        smtp_ready: true
      }
    });

  } catch (error) {
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
}
