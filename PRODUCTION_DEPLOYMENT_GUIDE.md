# Production Deployment Guide

## 🚀 Vercel Deployment Setup

### 1. Frontend Deployment (Already Done)
Your frontend is already deployed at: `https://ashok-textiles.vercel.app`

### 2. Backend API Deployment

#### Step 1: Deploy Backend to Vercel
```bash
# Push current changes
git add .
git commit -m "Production deployment setup with API routes"
git push origin main

# Deploy to Vercel (create new project for backend)
npx vercel --prod
```

#### Step 2: Configure Environment Variables in Vercel Dashboard

Go to your Vercel dashboard > Project Settings > Environment Variables and add:

**Payment Gateway Variables:**
```
VITE_RAZORPAY_KEY_ID=rzp_live_R7aFZXp7D1g5yb
RAZORPAY_KEY_ID=rzp_live_R7aFZXp7D1g5yb
RAZORPAY_KEY_SECRET=[your-razorpay-secret]
```

**HDFC Variables:**
```
HDFC_API_KEY=D5B755878234D26AC0C865AA253012
HDFC_MERCHANT_ID=SG3514
HDFC_CLIENT_ID=hdfcmaster
HDFC_BASE_URL=https://smartgatewayuat.hdfcbank.com
HDFC_PAYMENT_PAGE_CLIENT_ID=hdfcmaster
HDFC_RESPONSE_KEY=9EFC035E8F043AFB88F37DEF30C16D
HDFC_ENVIRONMENT=production
```

**Email Variables:**
```
GMAIL_USER=[your-gmail@gmail.com]
GMAIL_APP_PASSWORD=[your-16-digit-app-password]
```

**Supabase Variables:**
```
VITE_SUPABASE_URL=[your-supabase-url]
VITE_SUPABASE_ANON_KEY=[your-supabase-anon-key]
```

**Environment:**
```
NODE_ENV=production
```

#### Step 3: Update Frontend API URL

After backend deployment, update your frontend environment variables:

1. In Vercel dashboard for frontend project
2. Add environment variable:
   ```
   VITE_API_BASE_URL=https://[your-backend-deployment].vercel.app
   ```
3. Redeploy frontend

### 3. Testing Production Deployment

#### API Endpoints Available:
- `GET /api/health` - Health check
- `GET /api/razorpay-status` - Razorpay status
- `POST /api/create-order` - Create Razorpay order  
- `POST /api/verify-payment` - Verify payment
- `POST /api/hdfc-create-order` - Create HDFC order
- `ALL /api/hdfc-payment-response` - HDFC payment callback
- `POST /api/send-email` - Send email

#### Test URLs:
- Frontend: `https://ashok-textiles.vercel.app`
- Backend: `https://[your-backend-deployment].vercel.app/api/health`

### 4. Current Status

✅ **Frontend**: Deployed and working
✅ **API Routes**: Ready for deployment (8 functions, under 12 limit)
✅ **CORS**: Configured for production domain
✅ **Environment Variables**: Documented and ready
⏳ **Backend**: Needs deployment
⏳ **Frontend API URL**: Needs update after backend deployment

### 5. Deployment Commands

```bash
# 1. Commit current changes
git add .
git commit -m "Production ready: API routes + CORS + env config"
git push origin main

# 2. Deploy backend (new Vercel project)
npx vercel --prod

# 3. Update frontend VITE_API_BASE_URL with backend URL
# 4. Redeploy frontend
npx vercel --prod
```

### 6. Troubleshooting

**CORS Errors**: Make sure backend CORS includes your frontend domain
**Environment Variables**: Check Vercel dashboard settings
**API Routes**: Verify all endpoints work at `/api/[endpoint]`
**Payment Callbacks**: Ensure return URLs point to production backend

---

🎯 **Goal**: Replace `localhost:5000` with production Vercel backend URL