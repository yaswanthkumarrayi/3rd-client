# PRODUCTION DEPLOYMENT GUIDE

## Payment Gateway Configuration

### Current Status
✅ **HDFC Test Environment**: Working with local simulator
✅ **Razorpay Live**: Fully functional
✅ **Payment Routes**: Success/Failure pages created
✅ **Frontend Integration**: Complete payment flow

## For Production Deployment

### 1. HDFC Production Configuration

Replace in `.env`:
```
# HDFC Production Configuration
HDFC_BASE_URL=https://smartgateway.hdfcbank.com
```

### 2. Update HDFC Payment Endpoint

In `api/hdfc-create-order.js`, replace the test URL with production:

```javascript
// PRODUCTION VERSION
return res.status(200).json({
  success: true,
  txnid: txnid,
  paymentData: paymentData,
  paymentUrl: `${HDFC_CONFIG.BASE_URL}/PaymentGateway/TransactionHandler`,
  redirectForm: generateRedirectForm(paymentData, `${HDFC_CONFIG.BASE_URL}/PaymentGateway/TransactionHandler`)
});
```

### 3. Production Environment Variables

Update `.env` for production:
```
# Base URL Configuration (Update for production)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
VITE_API_BASE_URL=https://yourdomain.com
```

### 4. HDFC Success/Failure URLs

Update in `api/hdfc-create-order.js`:
```javascript
surl: `https://yourdomain.com/api/hdfc-payment-success`,
furl: `https://yourdomain.com/api/hdfc-payment-failure`,
curl: `https://yourdomain.com/api/hdfc-payment-cancel`,
return_url: `https://yourdomain.com/payment/success`
```

### 5. HDFC Bank Requirements

Before going live with HDFC:

1. **Contact HDFC**: Confirm the correct production endpoint URL
2. **Whitelist Domain**: HDFC needs to whitelist your production domain
3. **SSL Certificate**: Ensure your domain has a valid SSL certificate
4. **Test Credentials**: HDFC will provide production API keys
5. **Integration Testing**: HDFC may require integration testing

### 6. Test Card for HDFC UAT
- **Card Number**: 4012000000001097
- **CVV**: 123
- **Expiry**: Any future date

### 7. Production Checklist

- [ ] Update HDFC_BASE_URL to production
- [ ] Replace test payment endpoint with actual HDFC URL
- [ ] Update all callback URLs to production domain
- [ ] Get production API keys from HDFC
- [ ] Test with HDFC's test cards
- [ ] Implement proper error logging
- [ ] Set up payment confirmation emails
- [ ] Configure webhook handling for payment status

## Current Working Features

1. **Razorpay**: ✅ Full production integration
2. **HDFC Simulator**: ✅ Complete test flow
3. **Payment Pages**: ✅ Success/Failure handling
4. **Frontend Routes**: ✅ All payment routes working
5. **API Endpoints**: ✅ All payment APIs functional

## Note
The current implementation uses a local HDFC simulator for testing. This provides the complete payment flow without requiring access to HDFC's UAT environment, which appears to be unavailable.