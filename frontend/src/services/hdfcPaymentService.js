import crypto from 'crypto';

class HDFCPaymentService {
  constructor() {
    this.baseURL = import.meta.env.VITE_HDFC_BASE_URL || 'https://smartgatewayuat.hdfcbank.com';
    this.apiKey = import.meta.env.VITE_HDFC_API_KEY;
    this.merchantId = import.meta.env.VITE_HDFC_MERCHANT_ID;
    this.clientId = import.meta.env.VITE_HDFC_CLIENT_ID;
    this.responseKey = import.meta.env.VITE_HDFC_RESPONSE_KEY;
  }

  // Generate unique transaction ID
  generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TXN_${timestamp}_${random}`;
  }

  // Create payment order
  async createPaymentOrder(orderData) {
    try {
      const transactionId = this.generateTransactionId();
      
      const paymentData = {
        apikey: this.apiKey,
        txnid: transactionId,
        amount: orderData.amount,
        productinfo: orderData.productinfo,
        firstname: orderData.firstname,
        email: orderData.email,
        phone: orderData.phone,
        surl: orderData.successUrl || `${window.location.origin}/payment/success`,
        furl: orderData.failureUrl || `${window.location.origin}/payment/failure`,
        curl: orderData.cancelUrl || `${window.location.origin}/payment/cancel`,
        merchant_id: this.merchantId,
        payment_page_client_id: this.clientId,
        action: "paymentPage",
        return_url: orderData.returnUrl || `${window.location.origin}/payment/return`
      };

      return {
        success: true,
        transactionId,
        paymentData,
        paymentUrl: `${this.baseURL}/SubMerchantPayment`
      };
    } catch (error) {
      console.error('Error creating HDFC payment order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify payment response
  verifyPaymentResponse(responseData) {
    try {
      // HDFC sends response parameters that need to be verified
      const { txnid, amount, productinfo, firstname, email, status, hash } = responseData;
      
      // Basic validation
      if (!txnid || !amount || !status) {
        return {
          success: false,
          error: 'Invalid response data'
        };
      }

      // In production, you should verify the hash using response key
      // This is a simplified version - implement proper hash verification
      
      return {
        success: status === 'success',
        transactionId: txnid,
        amount: amount,
        status: status,
        responseData
      };
    } catch (error) {
      console.error('Error verifying HDFC payment response:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate payment form HTML for redirection
  generatePaymentForm(paymentData, targetUrl) {
    let formHTML = `<form id="hdfcPaymentForm" action="${targetUrl}" method="POST" style="display:none;">`;
    
    Object.keys(paymentData).forEach(key => {
      if (paymentData[key]) {
        formHTML += `<input type="hidden" name="${key}" value="${paymentData[key]}" />`;
      }
    });
    
    formHTML += '</form>';
    formHTML += `
      <script>
        document.body.innerHTML = '${formHTML}';
        document.getElementById('hdfcPaymentForm').submit();
      </script>
    `;
    
    return formHTML;
  }

  // Handle payment redirection (Updated for HDFC Juspay integration)
  initiatePayment(paymentData, paymentUrl) {
    // Validate input parameters
    if (!paymentUrl) {
      console.error('❌ HDFC Payment URL is missing');
      throw new Error('Payment URL is required for HDFC payment');
    }

    console.log('🏦 Initiating HDFC payment redirect to:', paymentUrl);
    console.log('🔗 Payment data:', paymentData);

    // For HDFC Juspay integration, we directly redirect to the payment URL
    // No need to create forms - the URL is ready to use
    try {
      console.log('✅ Redirecting to HDFC payment page...');
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('❌ Failed to redirect to HDFC payment page:', error);
      throw new Error('Failed to redirect to payment page');
    }
  }

  // Format amount for HDFC (should be in paisa for Indian rupees)
  formatAmount(amount) {
    return (parseFloat(amount) * 100).toString();
  }

  // Get payment status text
  getPaymentStatusText(status) {
    const statusMap = {
      'success': 'Payment Successful',
      'failure': 'Payment Failed',
      'pending': 'Payment Pending',
      'cancel': 'Payment Cancelled',
      'aborted': 'Payment Aborted'
    };
    return statusMap[status] || 'Unknown Status';
  }
}

export default new HDFCPaymentService();