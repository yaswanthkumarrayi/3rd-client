function setJson(res) {
  res.setHeader('Content-Type', 'application/json');
}

async function testRazorpayConnection() {
  try {
    // Simple test to check if Razorpay SDK can be imported
    const Razorpay = await import('razorpay');
    return true;
  } catch (error) {
    return false;
  }
}

export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method !== 'GET') {
    setJson(res);
    return res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const hasSecret = !!process.env.RAZORPAY_KEY_SECRET;
    const hasWebhookSecret = !!process.env.RAZORPAY_WEBHOOK_SECRET;
    const sdkAvailable = await testRazorpayConnection();
    
    // Determine mode based on key prefix
    let mode = 'UNKNOWN';
    if (keyId) {
      mode = keyId.startsWith('rzp_live') ? 'LIVE' : 'TEST';
    }
    
    // Determine overall status
    let status = 'MISCONFIGURED';
    let issues = [];
    
    if (!keyId) {
      issues.push('RAZORPAY_KEY_ID not configured');
    }
    if (!hasSecret) {
      issues.push('RAZORPAY_KEY_SECRET not configured');
    }
    if (!hasWebhookSecret) {
      issues.push('RAZORPAY_WEBHOOK_SECRET not configured');
    }
    if (!sdkAvailable) {
      issues.push('Razorpay SDK not available');
    }
    
    if (issues.length === 0) {
      status = 'CONFIGURED';
    } else if (keyId && hasSecret) {
      status = 'PARTIALLY_CONFIGURED';
    }
    
    const response = {
      status,
      mode,
      checks: {
        keyId: !!keyId,
        keySecret: hasSecret,
        webhookSecret: hasWebhookSecret,
        sdkAvailable
      },
      keyIdPrefix: keyId ? keyId.substring(0, 8) + '...' : 'NOT_SET',
      timestamp: new Date().toISOString(),
      issues: issues.length > 0 ? issues : undefined
    };
    
    setJson(res);
    return res.status(200).end(JSON.stringify(response));
  } catch (error) {
    console.error('Status check error:', error);
    setJson(res);
    return res.status(500).end(JSON.stringify({ 
      error: 'Status check failed',
      status: 'ERROR',
      timestamp: new Date().toISOString()
    }));
  }
}
