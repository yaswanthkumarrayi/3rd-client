// Test script to verify auth redirect configuration
// Run this in browser console: testAuthRedirects()

const testAuthRedirects = () => {
  console.log('🔧 Testing Auth Redirect Configuration...\n');
  
  // Test environment detection
  const isDev = import.meta.env?.DEV;
  const currentOrigin = window.location.origin;
  
  console.log('📊 Environment Info:');
  console.log('   Development Mode:', isDev);
  console.log('   Current Origin:', currentOrigin);
  console.log('   Expected Localhost:', currentOrigin.includes('localhost'));
  
  // Test auth config
  try {
    const authConfig = {
      baseUrl: isDev ? 'http://localhost:5173' : currentOrigin,
      isDevelopment: isDev,
      redirectUrls: {
        default: isDev ? 'http://localhost:5173' : currentOrigin,
        resetPassword: isDev ? 'http://localhost:5173/reset-password' : currentOrigin + '/reset-password',
        afterLogin: isDev ? 'http://localhost:5173' : currentOrigin,
        afterSignup: isDev ? 'http://localhost:5173' : currentOrigin
      }
    };
    
    console.log('\n✅ Auth Configuration:');
    console.log('   Base URL:', authConfig.baseUrl);
    console.log('   After Login:', authConfig.redirectUrls.afterLogin);
    console.log('   After Signup:', authConfig.redirectUrls.afterSignup);
    console.log('   Reset Password:', authConfig.redirectUrls.resetPassword);
    
    if (authConfig.baseUrl.includes('localhost')) {
      console.log('\n✅ Configuration looks correct for localhost development!');
    } else {
      console.log('\n⚠️  Configuration is set for production domain');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing auth config:', error);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Update Supabase Dashboard Site URL to: http://localhost:5173');
  console.log('2. Add redirect URLs in Supabase Dashboard');
  console.log('3. Clear browser cache and cookies');
  console.log('4. Test login/signup flows');
  
  return { isDev, currentOrigin };
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.testAuthRedirects = testAuthRedirects;
  console.log('Auth redirect test loaded. Run testAuthRedirects() to check configuration.');
}

export default testAuthRedirects;
