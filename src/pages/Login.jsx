import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import getAuthConfig from "../utils/authConfig";

const Login = ({ onClose, onSwitchToRegister  }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert("Login successful!");
      navigate("/");
      if (onClose) onClose();
    }
  };
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address above first.");
      return;
    }
    
    const authConfig = getAuthConfig();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authConfig.redirectUrls.resetPassword,
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Password reset email sent! Please check your inbox.");
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    const authConfig = getAuthConfig();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: authConfig.redirectUrls.afterLogin,
      },
    });
    setIsLoading(false);
    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md mx-4 relative overflow-hidden border border-white/20">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-full transition-all duration-200 z-10 backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        )}
        
        <div className="bg-gradient-to-br from-fuchsia-600 via-fuchsia-700 to-fuchsia-800 px-8 py-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-400/20 to-transparent"></div>
          <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Welcome Back</h2>
          <p className="text-fuchsia-100 text-sm relative z-10">Sign in to continue your journey</p>
        </div>
        
        <div className="px-8 py-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 text-gray-800 placeholder-gray-500 text-sm"
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 text-gray-800 placeholder-gray-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-fuchsia-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-fuchsia-600 hover:text-fuchsia-700 font-medium transition-colors duration-200"
                >
                  Forgot password?
                </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
              className="w-5 h-5" 
            />
            Sign In with Google
          </button>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-fuchsia-600 hover:text-fuchsia-700 font-semibold transition-colors duration-200 underline underline-offset-2"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;