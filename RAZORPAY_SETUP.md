# Razorpay Payment Gateway Setup Guide

## Prerequisites
1. Razorpay account (https://razorpay.com)
2. Business verification completed
3. API keys generated

## Step 1: Get Razorpay Credentials

### From Razorpay Dashboard:
1. Login to https://dashboard.razorpay.com
2. Go to Settings → API Keys
3. Generate or copy your:
   - **Key ID** (starts with `rzp_live_` or `rzp_test_`)
   - **Key Secret** (keep this secure!)

### For Webhooks:
1. Go to Settings → Webhooks
2. Create a new webhook endpoint
3. Set URL to: `https://yourdomain.com/api/webhook`
4. Select events: `payment.captured`, `payment.failed`, `payment.authorized`
5. Save and copy the **Webhook Secret**

## Step 2: Configure Environment Variables

Update your `.env` file with actual values:

```env
# Replace these with your actual Razorpay credentials
RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# For frontend (same as RAZORPAY_KEY_ID)
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_KEY_ID
```

## Step 3: Test Configuration

### Check Status Endpoint:
```bash
curl http://localhost:5173/api/razorpay-status
```

Expected response:
```json
{
  "status": "CONFIGURED",
  "mode": "LIVE",
  "checks": {
    "keyId": true,
    "keySecret": true,
    "webhookSecret": true,
    "sdkAvailable": true
  },
  "keyIdPrefix": "rzp_live_..."
}
```

## Step 4: Test Payment Flow

### Test Mode (Recommended First):
1. Use test credentials (`rzp_test_...`)
2. Test with dummy card numbers from Razorpay docs
3. Verify order creation and payment verification

### Live Mode:
1. Switch to live credentials (`rzp_live_...`)
2. Test with real payment methods
3. Monitor payments in Razorpay dashboard

## Step 5: Database Schema

Ensure your `orders` table has these columns:
```sql
-- Required columns for enhanced payment tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_captured_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_authorized_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_amount INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_error_code VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_error_description TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_metadata JSONB;
```

## Step 6: Security Configuration

### Firewall Rules:
- Allow Razorpay IPs for webhooks
- Block direct access to sensitive endpoints

### HTTPS Configuration:
- Ensure SSL certificate is valid
- All payment APIs must use HTTPS
- Redirect HTTP to HTTPS

### Rate Limiting:
```javascript
// Example rate limiting for payment endpoints
app.use('/api/create-order', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
}));
```

## Step 7: Monitoring Setup

### Log Files to Monitor:
- Payment creation logs
- Verification failures
- Webhook delivery logs
- Error logs

### Alerts to Setup:
1. **High Priority:**
   - Payment verification failures
   - Webhook signature mismatches
   - API authentication failures

2. **Medium Priority:**
   - High payment failure rates
   - Unusual payment amounts
   - API response time issues

## Step 8: Go Live Checklist

- [ ] Live API keys configured
- [ ] Webhook endpoints tested
- [ ] SSL certificate valid
- [ ] Database schema updated
- [ ] Error handling tested
- [ ] Payment flows tested end-to-end
- [ ] Monitoring and alerts configured
- [ ] Security review completed
- [ ] Backup and recovery tested

## Troubleshooting

### Common Issues:

1. **"Razorpay keys not configured"**
   - Check environment variables
   - Restart server after updating .env

2. **"Payment verification failed"**
   - Verify webhook secret is correct
   - Check if webhook URL is accessible
   - Ensure HTTPS is working

3. **"Invalid signature"**
   - Check if key secret matches
   - Verify request body integrity
   - Check for timing issues

### Support Resources:
- Razorpay Documentation: https://docs.razorpay.com
- API Reference: https://docs.razorpay.com/docs/api
- Integration Guide: https://docs.razorpay.com/docs/payment-gateway

## Security Notes

⚠️ **NEVER commit `.env` file to version control**
⚠️ **Keep API secrets secure and rotate them regularly**
⚠️ **Monitor payment logs for suspicious activity**
⚠️ **Use HTTPS for all payment-related endpoints**
⚠️ **Validate all payment data on server-side**
