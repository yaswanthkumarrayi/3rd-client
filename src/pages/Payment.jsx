import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { 
  ShoppingBag, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  User,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Loader2
} from "lucide-react";

const RAZORPAY_KEY_ID = "rzp_test_R6NmIHLl4TZltu"; // Replace with your key

const Payment = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, []);

  async function loadPaymentData() {
    setIsLoading(true);
    try {
      // Load cart items
      const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartItems(cart);

      // Get user info
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
      
      if (userData.user?.email) {
        await fetchProfile(userData.user.email);
      }
    } catch (error) {
      console.error("Error loading payment data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProfile(email) {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      if (data) setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  function getTotal() {
    return cartItems.reduce(
      (sum, item) => sum + item.discount_price * item.quantity,
      0
    );
  }

  function getItemCount() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  async function handlePayment() {
    setIsPaying(true);

    try {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: getTotal() * 100, // in paise
        currency: "INR",
        name: "Ashok Kumar Textiles",
        description: "Order Payment",
        handler: async function (response) {
          await placeOrder(response.razorpay_payment_id);
        },
        prefill: {
          name: profile?.full_name,
          email: profile?.email,
          contact: profile?.phone,
        },
        theme: { color: "#d946ef" },
        modal: {
          ondismiss: function() {
            setIsPaying(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      setIsPaying(false);
    }
  }

  async function placeOrder(paymentId) {
    try {
      const order = {
        user_email: profile?.email,
        phone: profile?.phone,
        address: profile?.address,
        city: profile?.city,
        state: profile?.state,
        pincode: profile?.pincode,
        items: cartItems,
        total: getTotal(),
        status: "Paid",
        created_at: new Date().toISOString(),
        payment_id: paymentId,
      };

      const { error } = await supabase.from("orders").insert([order]);
      
      if (!error) {
        localStorage.removeItem("cartItems");
        localStorage.setItem("cartCount", "0");
        setCartItems([]);
        
        // Show success state briefly before navigating
        setTimeout(() => {
          navigate("/orders");
        }, 1500);
      } else {
        throw new Error("Failed to save order");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Order failed to save. Please contact support.");
    } finally {
      setIsPaying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="w-full flex items-center justify-center min-h-[70vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-fuchsia-600 animate-spin mx-auto" />
            <p className="text-gray-600 font-medium">Loading payment details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="w-full flex items-center justify-center min-h-[70vh] px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">Profile Required</h2>
              <p className="text-gray-600">
                Please complete your profile with delivery address to proceed with payment.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/user")}
                className="w-full bg-fuchsia-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-fuchsia-700 transition-all duration-200 transform hover:scale-105"
              >
                Complete Profile
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="w-full flex items-center justify-center min-h-[70vh] px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">Cart is Empty</h2>
              <p className="text-gray-600">
                Add some items to your cart before proceeding to payment.
              </p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="w-full bg-fuchsia-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-fuchsia-700 transition-all duration-200 transform hover:scale-105"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Progress Steps */}
      <div className="w-full pt-20 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600 hidden sm:block">Cart</span>
            </div>
            <div className="w-12 h-1 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-fuchsia-600 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-fuchsia-600 hidden sm:block">Payment</span>
            </div>
            <div className="w-12 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-500" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500 hidden sm:block">Complete</span>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            
            {/* Order Summary - Mobile First, Desktop Right */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-fuchsia-600 to-pink-600 p-6">
                  <div className="flex items-center justify-between text-white">
                    <h2 className="text-xl font-bold">Order Summary</h2>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      <span className="font-semibold">{getItemCount()} items</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-lg font-bold text-fuchsia-600 mt-1">
                            ₹{(item.discount_price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{getTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-fuchsia-600">₹{getTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details - Mobile First, Desktop Left */}
            <div className="lg:col-span-3 order-2 lg:order-1 space-y-6">
              
              {/* Delivery Address Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-fuchsia-600" />
                  Delivery Address
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">{profile.full_name}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">
                      {profile.address}, {profile.city}, {profile.state} - {profile.pincode}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{profile.email}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/user")}
                  className="mt-4 text-fuchsia-600 hover:text-fuchsia-700 font-medium text-sm transition-colors"
                >
                  Edit Address →
                </button>
              </div>

              {/* Payment Security */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Secure Payment
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-sm text-gray-900">SSL</div>
                    <div className="text-xs text-gray-600">Encrypted</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-sm text-gray-900">PCI DSS</div>
                    <div className="text-xs text-gray-600">Compliant</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center col-span-2 sm:col-span-1">
                    <div className="font-semibold text-sm text-gray-900">Razorpay</div>
                    <div className="text-xs text-gray-600">Secured</div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      <span>Pay ₹{getTotal().toLocaleString()}</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By proceeding, you agree to our Terms & Conditions and Privacy Policy
                </p>
              </div>

              {/* Back to Cart */}
              <div className="text-center">
                <button
                  onClick={() => navigate("/cart")}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;