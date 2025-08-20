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
  Edit3
} from "lucide-react";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const BACKEND_URL= "https://threerd-client-2.onrender.com";

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
  ) + 100; // Add shipping
}

  function getItemCount() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

async function handlePayment() {
  console.log("Pay button clicked");
  setIsPaying(true);
  try {
    // Calculate amount in paise from cart total
    const amountPaise = Math.max(100, Math.round(getTotal() * 100));

    // 1. Create order on backend with real amount
    const res = await fetch(`${BACKEND_URL}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountPaise, currency: "INR" })
    });
    const order = await res.json();
    console.log("Order from backend:", order);
    if (!order.id) {
      throw new Error("Order creation failed");
    }

    // 2. Use order_id in Razorpay options (amount comes from order)
    const sanitizePhone = (value) => {
      const digits = (value || '').toString().replace(/\D/g, '');
      return digits.length >= 10 ? digits.slice(-10) : undefined;
    };

    const options = {
      key: RAZORPAY_KEY_ID,
      currency: order.currency,
      order_id: order.id,
      name: "Ashok Kumar Textiles",
      description: "Order Payment",
      handler: async function (response) {
        try {
          // Verify signature on backend before saving order
          const verifyRes = await fetch(`${BACKEND_URL}/api/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyJson = await verifyRes.json();
          if (!verifyRes.ok || !verifyJson.valid) {
            console.error('Signature verification failed:', verifyJson);
            alert('Payment could not be verified. No amount will be captured. Please try again.');
            setIsPaying(false);
            return;
          }
          await placeOrder(response.razorpay_payment_id, response.razorpay_order_id);
        } catch (e) {
          console.error('Verification error:', e);
          alert('Payment verification failed. Please try again.');
          setIsPaying(false);
        }
      },
      prefill: {
        name: profile?.full_name,
        email: profile?.email,
        contact: sanitizePhone(profile?.phone),
      },
      theme: { color: "#3b82f6" },
      modal: {
        ondismiss: function() {
          setIsPaying(false);
        }
      }
    };
    console.log("Razorpay options:", options);
    const rzp = new window.Razorpay(options);

    // Capture and surface detailed failure info
    rzp.on('payment.failed', function (response) {
      console.error('Razorpay payment failed:', response?.error || response);
      const code = response?.error?.code || 'UNKNOWN_ERROR';
      const description = response?.error?.description || 'Payment failed. Please try again.';
      alert(`${code}: ${description}`);
      setIsPaying(false);
    });

    rzp.open();
  } catch (error) {
    console.error("Payment initiation error:", error);
    alert("Payment initiation failed. Please try again.");
    setIsPaying(false);
  }
}

  async function placeOrder(paymentId, orderId) {
    try {
      const order = {
        user_email: profile?.email,
        phone: profile?.phone,
        address: profile?.address,
        city: profile?.city,
        state: profile?.state,
        pincode: profile?.pincode,
        shipping: 100,
        items: cartItems,
        total: getTotal(),
        status: "Paid",
        created_at: new Date().toISOString(),
        payment_id: paymentId,
        razorpay_order_id: orderId,
      };

      const { error } = await supabase.from("orders").insert([order]);
      
      if (!error) {
        localStorage.removeItem("cartItems");
        localStorage.setItem("cartCount", "0");
        setCartItems([]);
        
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-sm w-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Payment</h3>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-sm w-full text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6">
              Please add your delivery address to proceed with payment.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/user")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Complete Profile
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-sm w-full text-center">
            <ShoppingBag className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cart is Empty</h2>
            <p className="text-gray-600 mb-6">
              Add products to your cart before checkout.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Shop Now
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Progress Steps */}
      <div className="pt-20 pb-6 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600 hidden sm:inline">Cart</span>
            </div>
            <div className="w-16 h-1 bg-green-500 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600 hidden sm:inline">Payment</span>
            </div>
            <div className="w-16 h-1 bg-gray-300 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-500" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500 hidden sm:inline">Complete</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column - Payment Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Delivery Address
                  </h3>
                  <button
                    onClick={() => navigate("/user")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900">{profile.full_name}</span>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="text-gray-700">
                        <p>{profile.address}</p>
                        <p>{profile.city}, {profile.state} - {profile.pincode}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{profile.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{profile.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Secure Payment
                </h3>
                
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-6 py-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Lock className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-700">SSL Encrypted</p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-700">Bank Grade Security</p>
                    </div>
                    <div className="text-center">
                      <CreditCard className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-700">Razorpay</p>
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-3 mb-4"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay ₹{getTotal().toLocaleString()}
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Your payment information is secure and encrypted
                  </p>
                </div>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <button
                  onClick={() => navigate("/cart")}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium bg-white hover:bg-gray-50 px-4 py-2 rounded-lg border transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Cart
                </button>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="bg-blue-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Order Summary</h2>
                      <span className="bg-blue-500 px-2 py-1 rounded text-sm">{getItemCount()} items</span>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Cart Items */}
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate text-sm">
                              {item.title}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                              <span className="font-semibold text-blue-600">
                                ₹{(item.discount_price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{getTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
<span className="text-green-600 font-medium">₹100</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>Included</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-blue-600">
                            ₹{getTotal().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-center items-center gap-4 text-center">
                        <div className="text-center">
                          <Truck className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">Free Shipping</p>
                        </div>
                        <div className="text-center">
                          <Shield className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">Secure Payment</p>
                        </div>
                        <div className="text-center">
                          <CheckCircle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">Quality Assured</p>
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