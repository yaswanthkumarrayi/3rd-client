// Payment Integration Test Suite
// Run this script to test payment gateway functionality

const testPaymentGateway = async () => {
  const baseUrl = 'http://localhost:5173';
  
  console.log('🧪 Testing Payment Gateway Integration...\n');

  // Test 1: Check Razorpay Status
  console.log('1️⃣ Testing Razorpay Status...');
  try {
    const response = await fetch(`${baseUrl}/api/razorpay-status`);
    const data = await response.json();
    console.log('   ✅ Status:', data.status);
    console.log('   📋 Mode:', data.mode);
    console.log('   🔑 Key ID:', data.keyIdPrefix);
    
    if (data.status !== 'CONFIGURED') {
      console.log('   ⚠️  Issues:', data.issues);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 2: Create Test Order
  console.log('\n2️⃣ Testing Order Creation...');
  try {
    const orderData = {
      amount: 100000, // ₹1000 in paise
      currency: 'INR',
      customer_details: {
        email: 'test@example.com',
        phone: '9999999999'
      },
      order_metadata: {
        test_order: true
      }
    };

    const response = await fetch(`${baseUrl}/api/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Order created successfully');
      console.log('   🆔 Order ID:', data.id);
      console.log('   💰 Amount:', data.amount, 'paise');
      console.log('   💱 Currency:', data.currency);
      
      // Test 3: Payment Verification (with dummy data)
      console.log('\n3️⃣ Testing Payment Verification...');
      const verifyData = {
        razorpay_order_id: data.id,
        razorpay_payment_id: 'pay_test123456789',
        razorpay_signature: 'dummy_signature_for_test'
      };

      const verifyResponse = await fetch(`${baseUrl}/api/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(verifyData)
      });

      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.valid === false && verifyResult.code === 'SIGNATURE_VERIFICATION_FAILED') {
        console.log('   ✅ Signature verification working (correctly rejected dummy signature)');
      } else {
        console.log('   ⚠️  Unexpected verification result:', verifyResult);
      }
      
    } else {
      console.log('   ❌ Order creation failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n🏁 Payment Gateway Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Update .env with your actual Razorpay credentials');
  console.log('   2. Test with real payment methods');
  console.log('   3. Configure webhooks in Razorpay dashboard');
  console.log('   4. Monitor payment logs');
};

// For browser console testing
if (typeof window !== 'undefined') {
  window.testPaymentGateway = testPaymentGateway;
  console.log('Payment test function loaded. Run testPaymentGateway() to test.');
}

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testPaymentGateway;
}

export default testPaymentGateway;
