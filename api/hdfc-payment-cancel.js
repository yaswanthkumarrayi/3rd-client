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
    console.log('HDFC Payment Cancel Response:', responseData);

    const { 
      txnid, 
      amount, 
      status
    } = responseData;

    // Create cancel response HTML
    const cancelHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Cancelled</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            color: white;
          }
          .cancel-icon {
            font-size: 72px;
            color: #fff;
            margin-bottom: 20px;
          }
          .btn {
            background: #fff;
            color: #ff9800;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin: 10px;
            display: inline-block;
          }
          .details {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px auto;
            max-width: 500px;
          }
        </style>
      </head>
      <body>
        <div class="cancel-icon">⚠</div>
        <h1>Payment Cancelled</h1>
        <p>Your payment has been cancelled.</p>
        
        <div class="details">
          <p><strong>Transaction ID:</strong> ${txnid || 'N/A'}</p>
          <p><strong>Amount:</strong> ₹${amount || 'N/A'}</p>
          <p><strong>Status:</strong> Cancelled</p>
        </div>
        
        <p>You can try again or continue shopping.</p>
        
        <a href="/payment" class="btn">Try Again</a>
        <a href="/cart" class="btn">Back to Cart</a>
        <a href="/" class="btn">Continue Shopping</a>
        
        <script>
          // Redirect to cart after 8 seconds
          setTimeout(function() {
            window.location.href = '/cart';
          }, 8000);
        </script>
      </body>
      </html>
    `;

    return res.status(200).send(cancelHTML);

  } catch (error) {
    console.error('HDFC Payment Cancel Handler Error:', error);
    
    const errorHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Cancelled</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: #ff9800;
            color: white;
          }
        </style>
      </head>
      <body>
        <h1>Payment Cancelled</h1>
        <p>Your payment has been cancelled.</p>
        <a href="/cart" style="color: white;">Return to Cart</a>
      </body>
      </html>
    `;
    
    return res.status(500).send(errorHTML);
  }
}