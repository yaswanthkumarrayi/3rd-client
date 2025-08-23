// Environment configuration helper for auth redirects
const getAuthConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const baseUrl = isDevelopment ? 'http://localhost:5173' : window.location.origin;
  
  return {
    baseUrl,
    isDevelopment,
    redirectUrls: {
      default: baseUrl,
      resetPassword: `${baseUrl}/reset-password`,
      afterLogin: baseUrl,
      afterSignup: baseUrl
    }
  };
};

export default getAuthConfig;
