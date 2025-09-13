// HDFC Order Status API for bank testing
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { order_id, orderId } = req.method === 'GET' ? req.query : req.body;
    const targetOrderId = order_id || orderId;

    console.log('🔍 HDFC Order Status Request:', { 
      method: req.method, 
      order_id: targetOrderId,
      timestamp: new Date().toISOString()
    });

    if (!targetOrderId) {
      return res.status(400).json({
        error: 'Missing order_id parameter',
        message: 'Please provide order_id to check status'
      });
    }

    // Sample response format as required by HDFC bank testing
    // In real implementation, this would fetch from your database
    const orderStatusResponse = {
      "customer_email": "customer@example.com",
      "customer_phone": "9999999999", 
      "customer_id": "customer@example.com",
      "status_id": 21,
      "status": "CHARGED", // CHARGED, PENDING, FAILED, etc.
      "id": `ordeh_${targetOrderId}`,
      "merchant_id": "SG3514",
      "amount": 10000, // Amount in paise
      "currency": "INR",
      "order_id": targetOrderId,
      "date_created": new Date().toISOString(),
      "return_url": "https://www.ashokkumartextiles.com/payment/success",
      "product_id": "",
      "payment_links": {
        "iframe": `https://smartgatewayuat.hdfcbank.com/orders/ordeh_${targetOrderId}/payment-page`,
        "web": `https://smartgatewayuat.hdfcbank.com/orders/ordeh_${targetOrderId}/payment-page`,
        "mobile": `https://smartgatewayuat.hdfcbank.com/orders/ordeh_${targetOrderId}/payment-page`
      },
      "udf1": "",
      "udf2": "", // Not using UDF2 as per HDFC requirement
      "udf3": "",
      "udf4": "",
      "udf5": "",
      "udf6": "",
      "udf7": "",
      "udf8": "",
      "udf9": "",
      "udf10": "",
      "txn_id": `SG3514-${targetOrderId}-1`,
      "payment_method_type": "CARD",
      "auth_type": "THREE_DS",
      "card": {
        "expiry_year": "2025",
        "card_reference": "",
        "saved_to_locker": false,
        "expiry_month": "12",
        "name_on_card": "Test Customer",
        "card_issuer": "HDFC Bank",
        "last_four_digits": "1234",
        "using_saved_card": false,
        "card_fingerprint": "test_fingerprint",
        "card_isin": "401200",
        "card_type": "CREDIT",
        "card_brand": "VISA",
        "using_token": false,
        "tokens": [],
        "token_type": "CARD",
        "card_issuer_country": "INDIA",
        "juspay_bank_code": "JP_HDFC",
        "extended_card_type": "CREDIT",
        "payment_account_reference": ""
      },
      "gateway_reference_id": `ref_${targetOrderId}`,
      "bank_reference_number": `bank_ref_${Date.now()}`,
      "created_at": new Date().toISOString(),
      "updated_at": new Date().toISOString()
    };

    console.log('✅ HDFC Order Status Response:', {
      order_id: targetOrderId,
      status: orderStatusResponse.status,
      amount: orderStatusResponse.amount,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json(orderStatusResponse);

  } catch (error) {
    console.error('❌ HDFC Order Status Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch order status',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}