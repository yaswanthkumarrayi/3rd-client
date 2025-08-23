import crypto from 'crypto';

function setJson(res) {
  res.setHeader('Content-Type', 'application/json');
}

async function parseBody(req) {
  if (req.body) return req.body;
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function verifySignature(orderId, paymentId, signature, secret) {
  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error in signature verification:', error);
    return false;
  }
}

function validateInput(data) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  
  const errors = [];
  
  if (!razorpay_order_id || typeof razorpay_order_id !== 'string') {
    errors.push('Invalid or missing order ID');
  }
  
  if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string') {
    errors.push('Invalid or missing payment ID');
  }
  
  if (!razorpay_signature || typeof razorpay_signature !== 'string') {
    errors.push('Invalid or missing signature');
  }

  // Basic format validation for Razorpay IDs
  if (razorpay_order_id && !razorpay_order_id.startsWith('order_')) {
    errors.push('Invalid order ID format');
  }
  
  if (razorpay_payment_id && !razorpay_payment_id.startsWith('pay_')) {
    errors.push('Invalid payment ID format');
  }
  
  if (razorpay_signature && !/^[a-f0-9]{64}$/i.test(razorpay_signature)) {
    errors.push('Invalid signature format');
  }
  
  return errors;
}

export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method !== 'POST') {
    setJson(res);
    return res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const startTime = Date.now();
  
  try {
    // Check if Razorpay secret is configured
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay key secret not configured');
      setJson(res);
      return res.status(500).end(JSON.stringify({ 
        valid: false, 
        error: 'Payment verification not configured' 
      }));
    }

    const body = await parseBody(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};
    
    console.log('Payment verification request:', { 
      razorpay_order_id: razorpay_order_id ? `${razorpay_order_id.substring(0, 10)}...` : 'MISSING',
      razorpay_payment_id: razorpay_payment_id ? `${razorpay_payment_id.substring(0, 8)}...` : 'MISSING',
      razorpay_signature: razorpay_signature ? 'PRESENT' : 'MISSING',
      timestamp: new Date().toISOString()
    });

    // Validate input data
    const validationErrors = validateInput(body);
    if (validationErrors.length > 0) {
      console.warn('Validation failed:', validationErrors);
      setJson(res);
      return res.status(400).end(JSON.stringify({ 
        valid: false, 
        error: 'Invalid request data',
        details: validationErrors
      }));
    }

    // Verify signature
    const isValid = verifySignature(
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      process.env.RAZORPAY_KEY_SECRET
    );
    
    const processingTime = Date.now() - startTime;
    
    console.log('Signature verification result:', {
      order_id: `${razorpay_order_id.substring(0, 10)}...`,
      payment_id: `${razorpay_payment_id.substring(0, 8)}...`,
      isValid,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    });
    
    if (!isValid) {
      // Log security incident
      console.error('SECURITY ALERT: Invalid payment signature detected', {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      });

      setJson(res);
      return res.status(400).end(JSON.stringify({ 
        valid: false, 
        error: 'Payment verification failed',
        details: 'Signature verification failed. This payment cannot be trusted.',
        code: 'SIGNATURE_VERIFICATION_FAILED'
      }));
    }

    // Success response
    setJson(res);
    return res.status(200).end(JSON.stringify({ 
      valid: true, 
      message: 'Payment verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      verified_at: new Date().toISOString(),
      processing_time: processingTime
    }));
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('Payment verification error:', {
      message: error.message,
      stack: error.stack,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    });
    
    setJson(res);
    return res.status(500).end(JSON.stringify({ 
      valid: false, 
      error: 'Payment verification service unavailable',
      details: 'An internal error occurred during verification. Please try again.',
      code: 'VERIFICATION_SERVICE_ERROR'
    }));
  }
}
