export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🔍 HDFC Debug endpoint called');

  const HDFC_CONFIG = {
    API_KEY: process.env.HDFC_API_KEY || "D5B755878234D26AC0C865AA253012",
    MERCHANT_ID: process.env.HDFC_MERCHANT_ID || "SG3514",
    CLIENT_ID: process.env.HDFC_CLIENT_ID || "hdfcmaster",
    BASE_URL: process.env.HDFC_BASE_URL || "https://smartgatewayuat.hdfcbank.com",
    PAYMENT_ENDPOINT: process.env.HDFC_PAYMENT_ENDPOINT || "/v4/session", // Modern HDFC v4 Session API endpoint
    RESPONSE_KEY: process.env.HDFC_RESPONSE_KEY || "9EFC035E8F043AFB88F37DEF30C16D",
    ENVIRONMENT: "uat",
    LAST_UPDATED: "2024-12-28-v4-session" // Force deployment update
  };

  const debugInfo = {
    timestamp: new Date().toISOString(),
    config: HDFC_CONFIG,
    full_payment_url: `${HDFC_CONFIG.BASE_URL}${HDFC_CONFIG.PAYMENT_ENDPOINT}`,
    environment_vars: {
      HDFC_PAYMENT_ENDPOINT: process.env.HDFC_PAYMENT_ENDPOINT,
      HDFC_BASE_URL: process.env.HDFC_BASE_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV
    },
    deployment_status: "v4-session-update",
    endpoint_comparison: {
      old_deprecated: "https://smartgatewayuat.hdfcbank.com/merchant/ipay",
      new_v4_session: `${HDFC_CONFIG.BASE_URL}${HDFC_CONFIG.PAYMENT_ENDPOINT}`
    }
  };

  return res.status(200).json({
    status: "success",
    message: "HDFC Debug Info - v4 Session API",
    debug: debugInfo
  });
}