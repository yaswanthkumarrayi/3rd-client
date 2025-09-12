# Supabase Auth Configuration for Local Development

## Issue: After signin, app redirects to Vercel instead of localhost

## Solution: Configure Supabase Auth URLs

### Step 1: Update Supabase Dashboard Settings

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `3rd-client`

2. **Navigate to Authentication Settings:**
   - Go to `Authentication` → `Settings` → `URL Configuration`

3. **Update the following URLs:**

   **Site URL:**
   ```
   http://localhost:5173
   ```

   **Redirect URLs (add both):**
   ```
   http://localhost:5173
   http://localhost:5173/**
   https://your-vercel-app.vercel.app
   https://your-vercel-app.vercel.app/**
   ```

### Step 2: Update OAuth Provider Settings

If using Google OAuth:

1. **Go to Authentication → Providers → Google**
2. **Ensure Authorized redirect URIs include:**
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```

### Step 3: Code Changes Made

✅ **Updated Login.jsx:**
- Google OAuth now uses `http://localhost:5173` in development
- Password reset redirects to localhost in development

✅ **Updated Register.jsx:**
- Google signup now uses `http://localhost:5173` in development
- Password reset redirects to localhost in development

### Step 4: Environment Detection

The code now automatically detects development mode:
```javascript
const redirectUrl = import.meta.env.DEV 
  ? "http://localhost:5173"           // Development
  : window.location.origin;           // Production
```

### Step 5: Testing

After making these changes:

1. **Clear browser cache and cookies**
2. **Restart your development server**
3. **Test login/signup flows**

### Step 6: Additional Configuration (Optional)

Create a `.env.local` file if you want environment-specific URLs:
```env
VITE_AUTH_REDIRECT_URL=http://localhost:5173
VITE_SITE_URL=http://localhost:5173
```

Then use in code:
```javascript
const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || "http://localhost:5173";
```

## Troubleshooting

### If still redirecting to Vercel:

1. **Check browser console for errors**
2. **Clear all cookies for localhost and Vercel domain**
3. **Verify Supabase dashboard settings are saved**
4. **Check if you have any hardcoded URLs in other components**

### Common Issues:

- **Browser cache**: Clear cache completely
- **Multiple tabs**: Close all tabs and restart
- **Cookie conflicts**: Clear all cookies for both domains
- **Supabase settings**: Make sure Site URL is set to localhost

## Verification

After configuration, test:
- ✅ Regular email/password login stays on localhost
- ✅ Google OAuth login returns to localhost
- ✅ Password reset emails contain localhost links
- ✅ Registration confirmation stays on localhost
