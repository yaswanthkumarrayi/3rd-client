import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  CreditCard, 
  Package, 
  MapPin, 
  User, 
  Phone, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  Truck
} from "lucide-react";

const Payment = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

  useEffect(() => {
    // Load cart items from localStorage
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartItems(items);

    // Check if user is authenticated
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user && data.user.email) {
        fetchProfile(data.user.email);
      } else {
        setLoading(false);
        navigate("/login");
      }
    });
  }, [navigate]);

  async function fetchProfile(email) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    
    if (!error && data) {
      setProfile(data);
      // Check if profile is complete
      if (!data.phone || !data.city || !data.state || !data.pincode || !data.address) {
        setError("Please complete your profile information to proceed with payment.");
        setTimeout(() => navigate("/user"), 2000);
      }
    }
    setLoading(false);
  }

  function getSubtotal() {
    return cartItems.reduce(
      (sum, item) => sum + item.discount_price * item.quantity,
      0
    );
  }

  function getShipping() {
    return 100; // Fixed shipping cost
  }

  function getTotal() {
    return getSubtotal() + getShipping();
  }

  function getTotalSavings() {
    return cartItems.reduce(
      (sum, item) => sum + (item.original_price - item.discount_price) * item.quantity,
      0
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = async () => {
    try {
      const orderData = {
        user_email: user.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        items: cartItems,
        total: getTotal(),
        status: "placed",
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Database error creating order:', error);
        throw new Error(`Failed to create order: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("Order creation returned no data");
      }
      
      console.log('Order created in database:', data.id);
      return data;
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage = error?.message || "Failed to create order";
      throw new Error(errorMessage);
    }
  };

  const createRazorpayOrder = async () => {
    const amountPaise = getTotal() * 100;
    try {
      const orderData = {
        amount: amountPaise, 
        currency: "INR",
        customer_details: {
          email: user.email,
          phone: profile.phone
        },
        order_metadata: {
          user_id: user.id,
          cart_items_count: cartItems.length,
          source: 'web_app'
        }
      };

      const res = await fetch(`/api/create-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify(orderData)
      });
      
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Failed to parse create-order response:', text);
        throw new Error("Invalid response from payment service");
      }
      
      if (!res.ok) {
        throw new Error(data?.error || `Payment service error: ${res.status}`);
      }
      
      if (!data.id) {
        throw new Error("Invalid order response: missing order ID");
      }
      
      console.log('Razorpay order created successfully:', data.id);
      return data;
    } catch (err) {
      console.error("Error creating Razorpay order:", err);
      const errorMessage = err?.message || "Failed to initialize payment";
      throw new Error(errorMessage);
    }
  };

  const handlePayment = async () => {
    if (!user || !profile) {
      setError("Please login and complete your profile to proceed.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items to proceed.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        setError("Razorpay SDK failed to load. Please try again.");
        setProcessing(false);
        return;
      }

      // Create order in database and Razorpay order on server
      const order = await createOrder();
      setOrderDetails(order);
      const razorpayOrder = await createRazorpayOrder();

      // Prepare Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        order_id: razorpayOrder.id,
        name: "3rd Client",
        description: `Order #${order.id} - ${cartItems.length} item(s)`,
        image: "/FullLogo.jpg",
        handler: async function (response) {
          console.log('Payment successful, verifying...', {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id
          });
          
          try {
            // Verify payment signature on server
            const verifyRes = await fetch(`/api/verify-payment`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            const verifyText = await verifyRes.text();
            let verifyData;
            try {
              verifyData = verifyText ? JSON.parse(verifyText) : {};
            } catch (e) {
              console.error('Failed to parse verify-payment response:', verifyText);
              throw new Error("Invalid response from verification service");
            }
            
            if (!verifyRes.ok || !verifyData.valid) {
              console.error('Payment verification failed:', verifyData);
              throw new Error(verifyData?.error || "Payment verification failed");
            }

            console.log('Payment verified successfully, updating order...');

            // Update order with payment details
            const { error: updateError } = await supabase
              .from("orders")
              .update({
                payment_id: response.razorpay_payment_id,
                status: "processing"
              })
              .eq("id", order.id);

            if (updateError) {
              console.error('Error updating order:', updateError);
              throw new Error(`Failed to update order: ${updateError.message}`);
            }

            console.log('Order updated successfully, processing success...');

            // Clear cart and show success
            localStorage.removeItem("cartItems");
            localStorage.setItem("cartCount", "0");
            
            // Dispatch custom event for cart update
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            
            // Show success notification
            const successNotification = document.createElement('div');
            successNotification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-pulse';
            successNotification.innerHTML = `
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
                <div>
                  <div class="font-medium">Payment Successful!</div>
                  <div class="text-sm opacity-90">Order placed successfully</div>
                </div>
              </div>
            `;
            document.body.appendChild(successNotification);
            setTimeout(() => {
              if (document.body.contains(successNotification)) {
                document.body.removeChild(successNotification);
              }
            }, 5000);

            // Redirect to orders page
            setTimeout(() => navigate("/orders"), 2000);
            setProcessing(false);
          } catch (error) {
            console.error("Error processing successful payment:", error);
            const errorMessage = error?.message || "Unknown error occurred";
            setError(`Payment completed but order update failed: ${errorMessage}. Please contact support with payment ID: ${response.razorpay_payment_id}`);
            setProcessing(false);
          }
        },
        prefill: {
          name: user.email,
          email: user.email,
          contact: profile.phone
        },
        notes: {
          address: `${profile.address}, ${profile.city}, ${profile.state} - ${profile.pincode}`,
          customer: user.email
        },
        theme: {
          color: "#C026D3"
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed by user');
            setProcessing(false);
            setError("Payment was cancelled by user");
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300, // 5 minutes timeout
        config: {
          display: {
            language: 'en',
            blocks: {
              banks: {
                name: "Pay using UPI/Card/Netbanking",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                  { method: "upi" }
                ]
              }
            }
          }
        }
      };

      // Initialize Razorpay with error handling
      try {
        if (!window.Razorpay) {
          throw new Error("Razorpay SDK not loaded properly");
        }

        const paymentObject = new window.Razorpay(options);
        
        // Set up event listeners for better error handling
        paymentObject.on('payment.failed', function (response) {
          console.error('Payment failed:', response);
          const errorMsg = response.error?.description || "Payment failed. Please try again.";
          setError(errorMsg);
          setProcessing(false);
        });

        paymentObject.on('payment.cancelled', function (response) {
          console.log('Payment cancelled by user:', response);
          setError("Payment was cancelled.");
          setProcessing(false);
        });

        paymentObject.on('error', function (response) {
          console.error('Razorpay error:', response);
          setError("Payment gateway error. Please try again or contact support.");
          setProcessing(false);
        });

        // Open payment dialog
        paymentObject.open();
        
      } catch (error) {
        console.error('Razorpay initialization error:', error);
        setError(`Failed to initialize payment: ${error.message}`);
        setProcessing(false);
      }

    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error.message || "Failed to process payment. Please try again.";
      setError(errorMessage);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20 px-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-fuchsia-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-fuchsia-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please login to proceed with payment</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Please add items to your cart before proceeding to payment</p>
            <button
              onClick={() => navigate('/')}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate("/cart")}
                className="flex items-center gap-2 text-gray-600 hover:text-fuchsia-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Cart</span>
              </button>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-7 h-7 text-fuchsia-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Secure Payment</h1>
            </div>
            <p className="text-gray-600">Complete your purchase with secure payment</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 mb-1">Payment Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-fuchsia-600" />
                  Delivery Information
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900">{user?.email}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900">{profile?.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-900">
                        {profile?.address}, {profile?.city}, {profile?.state} - {profile?.pincode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-fuchsia-600" />
                  Order Summary
                </h3>
                
                <div className="space-y-4">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.hero_image_url}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm mb-2">{item.title}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-semibold text-gray-900">₹{item.discount_price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Features */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-fuchsia-600" />
                  Secure Payment
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-800 text-sm">SSL Secured</h4>
                    <p className="text-green-600 text-xs">256-bit encryption</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-blue-800 text-sm">Verified</h4>
                    <p className="text-blue-600 text-xs">Razorpay verified</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Truck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-purple-800 text-sm">Fast Delivery</h4>
                    <p className="text-purple-600 text-xs">3-5 business days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-fuchsia-600" />
                  Payment Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-medium">₹{getSubtotal()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">₹{getShipping()}</span>
                  </div>
                  
                  {getTotalSavings() > 0 && (
                    <div className="flex justify-between text-sm bg-green-50 p-3 rounded-lg">
                      <span className="text-green-700 font-medium">Total Savings</span>
                      <span className="font-semibold text-green-700">₹{getTotalSavings()}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-fuchsia-600">₹{getTotal()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-fuchsia-400 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay ₹{getTotal()} Now
                      </>
                    )}
                  </button>
                  
                  <div className="text-center pt-2">
                    <div className="flex items-center justify-center gap-2 text-green-600 text-sm mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Secure Checkout</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Powered by Razorpay • 100% Secure • Instant Confirmation
                    </p>
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
