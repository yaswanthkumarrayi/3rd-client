 // Simple HDFC URL test
console.log('Testing HDFC Gateway URLs...');

const HDFC_URLS = [
  // Try different domain patterns
  'https://www.smartgatewayuat.hdfcbank.com/PaymentGateway/TransactionHandler',
  'https://www.smartgateway.hdfcbank.com/PaymentGateway/TransactionHandler',
  'https://smartgateway.hdfcbank.co.in/PaymentGateway/TransactionHandler',
  'https://smartgatewayuat.hdfcbank.co.in/PaymentGateway/TransactionHandler',
  'https://payment.hdfcbank.com/PaymentGateway/TransactionHandler',
  'https://paynow.hdfcbank.com/PaymentGateway/TransactionHandler',
  // Test if domains are even reachable
  'https://www.hdfcbank.com/',
  'https://hdfcbank.com/'
];

async function testHDFCUrl(url) {
  try {
    console.log(`\n🔍 Testing: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'test=1'
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log('❌ This URL returns 404 - Not Found');
    } else if (response.status === 405) {
      console.log('⚠️ Method not allowed (but URL exists)');
    } else if (response.status === 400) {
      console.log('⚠️ Bad request (but URL exists, needs proper data)');
    } else {
      console.log('✅ URL appears to be accessible');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testAllUrls() {
  for (const url of HDFC_URLS) {
    await testHDFCUrl(url);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  }
}

testAllUrls();