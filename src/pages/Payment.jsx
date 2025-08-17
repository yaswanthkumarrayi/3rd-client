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
  Loader2,
  Lock,
  Truck,
  Clock,
  Star,
  Edit3
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Loading Payment Details</h3>
            <p className="text-gray-600">Please wait while we prepare your checkout...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Complete Your Profile</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              To proceed with your order, please complete your profile with delivery address information.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/user")}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Complete Profile
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Add some beautiful textiles to your cart before proceeding to payment.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <Header />
      
      {/* Progress Steps */}
      <div className="pt-20 pb-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className="text-sm font-semibold text-green-600">Cart</p>
                    <p className="text-xs text-gray-500">Items selected</p>
                  </div>
                </div>
                <div className="w-8 sm:w-16 h-1 bg-gradient-to-r from-green-500 to-fuchsia-500 rounded-full"></div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className="text-sm font-semibold text-fuchsia-600">Payment</p>
                    <p className="text-xs text-gray-500">Secure checkout</p>
                  </div>
                </div>
                <div className="w-8 sm:w-16 h-1 bg-gray-200 rounded-full"></div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className="text-sm font-medium text-gray-400">Complete</p>
                    <p className="text-xs text-gray-400">Order confirmed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 pb-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Payment Details - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Delivery Address Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    Delivery Address
                  </h3>
                  <button
                    onClick={() => navigate("/user")}
                    className="flex items-center gap-2 text-fuchsia-600 hover:text-fuchsia-700 font-medium text-sm transition-colors bg-fuchsia-50 hover:bg-fuchsia-100 px-3 py-2 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{profile.full_name}</p>
                        <p className="text-sm text-gray-600">Primary Contact</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <MapPin className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-gray-800 leading-relaxed">
                          {profile.address}<br />
                          {profile.city}, {profile.state} - {profile.pincode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Phone className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-gray-800 font-medium">{profile.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Mail className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-gray-800 font-medium">{profile.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                    <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-green-700">Free Delivery</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                    <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-blue-700">3-5 Days</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200 col-span-2 sm:col-span-1">
                    <Star className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-amber-700">Premium Care</p>
                  </div>
                </div>
              </div>

              {/* Payment Security */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  Secure Payment Gateway
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-200">
                    <Lock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="font-bold text-sm text-green-700">256-bit SSL</div>
                    <div className="text-xs text-green-600">Encrypted</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center border border-blue-200">
                    <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="font-bold text-sm text-blue-700">PCI DSS</div>
                    <div className="text-xs text-blue-600">Compliant</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-4 text-center border border-purple-200 col-span-2 sm:col-span-1">
                    <CreditCard className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="font-bold text-sm text-purple-700">Razorpay</div>
                    <div className="text-xs text-purple-600">Trusted</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 text-center border border-indigo-200 col-span-2 sm:col-span-1">
                    <CheckCircle className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <div className="font-bold text-sm text-indigo-700">Bank Grade</div>
                    <div className="text-xs text-indigo-600">Security</div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl relative overflow-hidden group"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <Lock className="w-6 h-6" />
                      <span>Pay Securely ₹{getTotal().toLocaleString()}</span>
                    </>
                  )}
                </button>

                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm text-green-800 text-center leading-relaxed">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Your payment information is encrypted and secure. By proceeding, you agree to our 
                    <span className="font-semibold"> Terms & Conditions</span> and 
                    <span className="font-semibold"> Privacy Policy</span>.
                  </p>
                </div>
              </div>

              {/* Back to Cart */}
              <div className="text-center">
                <button
                  onClick={() => navigate("/cart")}
                  className="inline-flex items-center gap-3 text-gray-600 hover:text-gray-900 font-semibold transition-colors bg-white hover:bg-gray-50 px-6 py-3 rounded-2xl shadow-md border border-gray-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Cart
                </button>
              </div>
            </div>

            {/* Order Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold">Order Summary</h2>
                        <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                          <span className="text-sm font-semibold">{getItemCount()} items</span>
                        </div>
                      </div>
                      <p className="text-fuchsia-100">Review your order details</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-100 to-purple-100 rounded-xl flex items-center justify-center border border-fuchsia-200">
                            <ShoppingBag className="w-6 h-6 text-fuchsia-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate mb-1">
                              {item.title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                              <span className="text-lg font-bold text-fuchsia-600">
                                ₹{(item.discount_price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-6 space-y-4">
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">Subtotal</span>
                        <span className="font-semibold">₹{getTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">Shipping</span>
                        <span className="text-green-600 font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">Tax</span>
                        <span className="text-gray-500">Included</span>
                      </div>
                      <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-xl p-4 border border-fuchsia-200">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total Amount</span>
                          <span className="text-2xl font-bold text-fuchsia-600">
                            ₹{getTotal().toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-fuchsia-600 mt-1">Inclusive of all charges</p>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2">
                          <Shield className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-gray-600">Secure</p>
                        </div>
                        <div className="p-2">
                          <Truck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-gray-600">Fast Ship</p>
                        </div>
                        <div className="p-2">
                          <CheckCircle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-gray-600">Quality</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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