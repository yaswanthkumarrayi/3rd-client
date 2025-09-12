import crypto from 'crypto';
import { supabase } from '../src/supabaseClient.js';

const HDFC_CONFIG = {
  RESPONSE_KEY: process.env.HDFC_RESPONSE_KEY || "9EFC035E8F043AFB88F37DEF30C16D"
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const responseData = req.body;
    console.log('HDFC Payment Success Response:', responseData);

    const { 
      txnid, 
      amount, 
      productinfo, 
      firstname, 
      email, 
      phone,
      status,
      hash,
      mihpayid,
      mode,
      bank_ref_num,
      cardnum
    } = responseData;

    // Verify hash (implement according to HDFC documentation)
    const isValidHash = verifyResponseHash(responseData);
    
    if (!isValidHash) {
      console.error('Invalid hash in HDFC response');
      return res.status(400).json({ error: 'Invalid payment response' });
    }

    // Check if payment was successful
    if (status === 'success') {
      // Update order in database
      const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('razorpay_order_id', txnid)
        .single();

      if (fetchError) {
        console.error('Error fetching order:', fetchError);
        return res.status(500).json({ error: 'Order not found' });
      }

      // Update order with payment details
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_id: mihpayid || txnid,
          status: 'paid',
          payment_method: 'hdfc',
          payment_details: {
            txnid,
            mihpayid,
            mode,
            bank_ref_num,
            cardnum: cardnum ? `****${cardnum.slice(-4)}` : null,
            amount,
            payment_gateway: 'hdfc'
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingOrder.id);

      if (updateError) {
        console.error('Error updating order:', updateError);
        return res.status(500).json({ error: 'Failed to update order' });
      }

      // Send success response
      const successHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Successful</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
              color: white;
            }
            .success-icon {
              font-size: 72px;
              color: #fff;
              margin-bottom: 20px;
            }
            .btn {
              background: #fff;
              color: #4CAF50;
              padding: 12px 24px;
              border: none;
              border-radius: 5px;
              text-decoration: none;
              font-weight: bold;
              margin: 10px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p>Your payment has been processed successfully.</p>
          <p>Transaction ID: ${txnid}</p>
          <p>Amount: ₹${amount}</p>
          <a href="/orders" class="btn">View Orders</a>
          <a href="/" class="btn">Continue Shopping</a>
          
          <script>
            setTimeout(function() {
              window.location.href = '/orders';
            }, 5000);
          </script>
        </body>
        </html>
      `;

      return res.status(200).send(successHTML);
    } else {
      // Payment failed
      return res.status(400).json({ 
        error: 'Payment failed',
        status,
        txnid,
        amount
      });
    }

  } catch (error) {
    console.error('HDFC Payment Success Handler Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process payment response',
      details: error.message 
    });
  }
}

function verifyResponseHash(responseData) {
  try {
    // Implement hash verification according to HDFC documentation
    // This is a simplified version - you should implement proper hash verification
    const { hash, txnid, amount, productinfo, firstname, email, status } = responseData;
    
    if (!hash) {
      return false;
    }

    // Create hash string according to HDFC documentation
    const hashString = `${HDFC_CONFIG.RESPONSE_KEY}|${status}|||||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${HDFC_CONFIG.API_KEY}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    
    return hash === calculatedHash;
  } catch (error) {
    console.error('Error verifying hash:', error);
    return false;
  }
}