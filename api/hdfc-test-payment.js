export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
          <strong>⚠️ Test Environment</strong><br>
          This is a local test simulation of HDFC payment gateway. 
          In production, this would be the actual HDFC payment page.
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
          // Redirect to frontend success page
          window.location.href = 'http://localhost:5173/payment/success?status=success&txnid=' + (new URLSearchParams(window.location.search).get('txnid') || 'TEST_' + Date.now()) + '&gateway=HDFC&amount=' + (new URLSearchParams(window.location.search).get('amount') || '100');
        }

        function simulateFailure() {
          alert('❌ Payment Failed! (Simulated)\\n\\nIn production, this would redirect to your failure URL.');
          // Redirect to frontend failure page
          window.location.href = 'http://localhost:5173/payment/failure?status=failed&txnid=' + (new URLSearchParams(window.location.search).get('txnid') || 'TEST_' + Date.now()) + '&gateway=HDFC&error=Payment declined by bank';
        }
      </script>
    </body>
    </html>
  `;

  return res.status(200).send(testPaymentPage);
}