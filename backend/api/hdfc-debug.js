// Debug endpoint to test PaymentHandler initialization
import { PaymentHandler } from '../PaymentHandler.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔧 Starting PaymentHandler debug test...');
    
    // Test 1: Check if PaymentHandler class exists
    console.log('✅ PaymentHandler class imported successfully');
    
    // Test 2: Try to initialize PaymentHandler
    let paymentHandler;
    try {
      paymentHandler = PaymentHandler.getInstance();
      console.log('✅ PaymentHandler initialized successfully');
    } catch (initError) {
      console.error('❌ PaymentHandler initialization failed:', initError);
      return res.status(500).json({
        error: 'PaymentHandler initialization failed',
        details: initError.message,
        stack: initError.stack
      });
    }
    
    // Test 3: Check PaymentHandler methods
    try {
      const merchantId = paymentHandler.getMerchantId();
      const baseUrl = paymentHandler.getBaseUrl();
      const apiKey = paymentHandler.getApiKey();
      
      console.log('✅ PaymentHandler methods working:', { merchantId, baseUrl, apiKey: apiKey ? 'SET' : 'NOT_SET' });
      
      return res.status(200).json({
        success: true,
        message: 'PaymentHandler debug test passed',
        config: {
          merchantId,
          baseUrl,
          hasApiKey: !!apiKey,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (methodError) {
      console.error('❌ PaymentHandler method test failed:', methodError);
      return res.status(500).json({
        error: 'PaymentHandler method test failed',
        details: methodError.message,
        stack: methodError.stack
      });
    }
    
  } catch (error) {
    console.error('💥 Debug test error:', error);
    return res.status(500).json({
      error: 'Debug test failed',
      details: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
  }
}