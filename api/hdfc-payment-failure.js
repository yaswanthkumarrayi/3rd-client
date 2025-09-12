export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const responseData = req.body;
    console.log('HDFC Payment Failure Response:', responseData);

    const { 
      txnid, 
      amount, 
      status,
      error: errorMsg,
      error_Message
    } = responseData;

    // Create failure response HTML
    const failureHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Failed</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            color: white;
          }
          .error-icon {
            font-size: 72px;
            color: #fff;
            margin-bottom: 20px;
          }
          .btn {
            background: #fff;
            color: #f44336;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin: 10px;
            display: inline-block;
          }
          .error-details {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px auto;
            max-width: 500px;
          }
        </style>
      </head>
      <body>
        <div class="error-icon">✗</div>
        <h1>Payment Failed</h1>
        <p>We're sorry, but your payment could not be processed.</p>
        
        <div class="error-details">
          <p><strong>Transaction ID:</strong> ${txnid || 'N/A'}</p>
          <p><strong>Amount:</strong> ₹${amount || 'N/A'}</p>
          <p><strong>Status:</strong> ${status || 'Failed'}</p>
          ${errorMsg ? `<p><strong>Error:</strong> ${errorMsg}</p>` : ''}
          ${error_Message ? `<p><strong>Details:</strong> ${error_Message}</p>` : ''}
        </div>
        
        <p>Please try again or contact customer support if the problem persists.</p>
        
        <a href="/payment" class="btn">Try Again</a>
        <a href="/cart" class="btn">Back to Cart</a>
        <a href="/" class="btn">Home</a>
        
        <script>
          // Redirect to cart after 10 seconds
          setTimeout(function() {
            window.location.href = '/cart';
          }, 10000);
        </script>
      </body>
      </html>
    `;

    return res.status(200).send(failureHTML);

  } catch (error) {
    console.error('HDFC Payment Failure Handler Error:', error);
    
    const errorHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Error</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: #f44336;
            color: white;
          }
        </style>
      </head>
      <body>
        <h1>Payment Error</h1>
        <p>An error occurred while processing your payment response.</p>
        <a href="/cart" style="color: white;">Return to Cart</a>
      </body>
      </html>
    `;
    
    return res.status(500).send(errorHTML);
  }
}