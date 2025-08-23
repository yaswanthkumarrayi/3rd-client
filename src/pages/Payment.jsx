import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";

function Payment() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    checkAuth();
    loadCartItems();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth error:", error);
        setError("Authentication error. Please login again.");
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id, session.user.email);
      } else {
        setError("Please login to continue with payment.");
      }
      setLoading(false);
    } catch (error) {
      console.error("Exception in checkAuth:", error);
      setError("Authentication check failed. Please refresh and try again.");
      setLoading(false);
    }
  };

  const loadProfile = async (userId, email) => {
    try {
      
      if (!email) {
        return;
      }
      
      // Try to get profile from users table using email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      let profileData = userData;

      if (userError || !userData) {
        // If users table fails, try profiles table
        const { data: profileResponse, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (profileError || !profileResponse) {
          return;
        }
        
        profileData = profileResponse;
      }

      if (!profileData) {
        return;
      }

      // Check if profile has required fields for payment
      const requiredFields = ['full_name', 'phone', 'address', 'city', 'state', 'pincode'];
      const missingFields = requiredFields.filter(field => !profileData[field] || profileData[field].trim() === '');
      
      if (missingFields.length > 0) {
        setError("Please complete your profile information to proceed with payment.");
        setTimeout(() => {
          window.location.href = "/user";
        }, 2000);
      } else {
        setProfile(profileData);
        setUserDetails({
          full_name: profileData.full_name || "",
          email: profileData.email || user.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          city: profileData.city || "",
          state: profileData.state || "",
          pincode: profileData.pincode || ""
        });
        setError(""); // Clear any previous errors
      }
    } catch (error) {
      console.error("Exception in loadProfile:", error);
    }
  };

  const loadCartItems = () => {
    try {
      const saved = localStorage.getItem("cartItems");
      if (saved) {
        const items = JSON.parse(saved);
        setCartItems(Array.isArray(items) ? items : []);
      }
    } catch (error) {
      console.error("Error loading cart items:", error);
      setCartItems([]);
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = parseFloat(item.discount_price || 0) * parseInt(item.quantity || 1);
      return total + itemTotal;
    }, 0);
  };

  const getShipping = () => {
    return 100; // Fixed shipping cost
  };

  const getTotal = () => {
    return getSubtotal() + getShipping();
  };

  const getTotalSavings = () => {
    return cartItems.reduce((total, item) => {
      const savings = (parseFloat(item.original_price || 0) - parseFloat(item.discount_price || 0)) * parseInt(item.quantity || 1);
      return total + savings;
    }, 0);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // Validate that user is logged in and has required data
    if (!user) {
      setError("Please login to continue with payment.");
      return;
    }
    
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    
    if (!userDetails.phone || !userDetails.address || !userDetails.city) {
      setError("Please complete your profile information to proceed.");
      return;
    }
    
    setProcessing(true);
    setError("");
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        console.error("❌ Razorpay script failed to load");
        setError("Razorpay SDK failed to load. Please try again.");
        setProcessing(false);
        return;
      }
      
      // Create Razorpay order via backend
      const amountPaise = getTotal() * 100;
      
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          customer_details: {
            email: user?.email || userDetails.email,
            phone: profile?.phone || userDetails.phone
          }
        })
      });
      
      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        console.error("❌ Order creation failed - Response:", errorText);
        throw new Error(`Server error: ${orderRes.status} - ${errorText}`);
      }
      
      let orderData;
      try {
        const responseText = await orderRes.text();
        orderData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("❌ Failed to parse JSON response:", jsonError);
        throw new Error(`Invalid JSON response from server`);
      }
      
      if (!orderData.id) {
        console.error("❌ Order creation failed - No order ID:", orderData);
        setError(orderData.error || "Failed to create payment order");
        setProcessing(false);
        return;
      }
      
      // Prepare Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        order_id: orderData.id,
        name: "3rd Client",
        description: `Order Payment`,
        handler: async function (response) {
          try {
            // Verify payment signature
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            let verifyData;
            try {
              const verifyText = await verifyRes.text();
              verifyData = JSON.parse(verifyText);
            } catch (parseError) {
              console.error('❌ Failed to parse verification response');
              throw new Error('Payment verification service error');
            }
            
            if (!verifyRes.ok || !verifyData.valid) {
              console.error('❌ Payment verification failed:', verifyData);
              setError(`Payment verification failed: ${verifyData.error || 'Unknown error'}. Please contact support with payment ID: ${response.razorpay_payment_id}`);
              setProcessing(false);
              return;
            }

            // Place order in DB after successful verification
            try {
              const orderResult = await createOrder(response.razorpay_payment_id);
            } catch (orderError) {
              console.error('❌ Order creation failed:', orderError);
              // Don't return here - continue with success flow since payment is complete
              // We'll just show a warning to the user
              setError(`Payment successful but order recording failed: ${orderError.message}. Please contact support with payment ID: ${response.razorpay_payment_id}`);
            }
            
            // Clear cart
            localStorage.removeItem("cartItems");
            localStorage.setItem("cartCount", "0");
            
            // Dispatch cart update event
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            
            // Show success message
            setOrderDetails({ 
              status: "success", 
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id 
            });
            setProcessing(false);
            
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
            
            // Redirect to orders page after 3 seconds
            setTimeout(() => {
              if (document.body.contains(successNotification)) {
                document.body.removeChild(successNotification);
              }
              window.location.href = '/orders';
            }, 3000);
            
          } catch (error) {
            console.error("❌ Error in payment verification/order creation:", error);
            setError(`Payment completed but order processing failed: ${error.message}. Please contact support with payment ID: ${response.razorpay_payment_id}`);
            setProcessing(false);
          }
        },
        prefill: {
          name: userDetails.full_name || user?.email,
          email: user?.email || userDetails.email,
          contact: userDetails.phone || profile?.phone
        },
        theme: { color: "#C026D3" },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            setError("Payment was cancelled by user");
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };
      
      const paymentObject = new window.Razorpay(options);
      
      // Add error event handlers
      paymentObject.on('payment.failed', function (response) {
        console.error('💳 Payment failed:', response);
        const errorMsg = response.error?.description || "Payment failed. Please try again.";
        setError(errorMsg);
        setProcessing(false);
      });

      paymentObject.on('payment.cancelled', function (response) {
        setError("Payment was cancelled.");
        setProcessing(false);
      });

      paymentObject.open();
      
    } catch (error) {
      console.error("❌ Payment error:", error);
      setError(error.message || "Payment failed. Try again.");
      setProcessing(false);
    }
  };

  const createOrder = async (payment_id) => {
    try {
      // Check current auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      // Prepare order data with proper data types
      const orderData = {
        user_email: String(user?.email || userDetails.email || ''),
        phone: String(userDetails.phone || profile?.phone || ''),
        address: String(userDetails.address || profile?.address || ''),
        city: String(userDetails.city || profile?.city || ''),
        state: String(userDetails.state || profile?.state || ''),
        pincode: String(userDetails.pincode || profile?.pincode || ''),
        items: JSON.stringify(cartItems), // Convert to JSON string
        amount: Number(getTotal()),
        status: "processing", // Set to processing after successful payment
        payment_id: String(payment_id),
        shipping: Number(getShipping())
      };
      
      // Test connectivity first
      const { data: testData, error: testError } = await supabase
        .from("orders")
        .select("count", { count: "exact", head: true });
      
      if (testError) {
        console.error('❌ Supabase connectivity test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      // Now insert the order
      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Database error creating order:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to create order: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("Order creation returned no data");
      }
      
      return data;
    } catch (error) {
      console.error("❌ Error creating order:", error);
      
      // Try a fallback method with minimal data
      try {
        const fallbackOrderData = {
          user_email: String(user?.email || userDetails.email || 'unknown@email.com'),
          amount: Number(getTotal()),
          status: "processing",
          payment_id: String(payment_id),
          items: JSON.stringify(cartItems.map(item => ({
            title: item.title,
            quantity: item.quantity,
            price: item.discount_price
          })))
        };
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("orders")
          .insert([fallbackOrderData])
          .select()
          .single();
        
        if (fallbackError) {
          throw new Error(`Fallback order creation failed: ${fallbackError.message}`);
        }
        
        return fallbackData;
      } catch (fallbackError) {
        console.error("❌ Fallback order creation also failed:", fallbackError);
        throw new Error(`Order creation completely failed: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h2>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show success state
  if (orderDetails && orderDetails.status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
              {orderDetails.payment_id && (
                <p className="text-sm text-gray-500 mb-4">
                  Payment ID: {orderDetails.payment_id}
                </p>
              )}
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                You will be redirected to your orders page in a few seconds...
              </div>
              <button
                onClick={() => window.location.href = '/orders'}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition duration-200"
              >
                View Orders
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Empty Cart</h2>
            <p className="text-gray-600 mb-4">Your cart is empty. Please add items to proceed.</p>
            <a 
              href="/" 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 inline-block text-center"
            >
              Continue Shopping
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Payment</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={item.hero_image_url || item.image} 
                        alt={item.title || item.name} 
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">{item.title || item.name}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-800">
                      ₹{((item.discount_price || item.price || 0) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Subtotal:</span>
                    <span>₹{getSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Shipping:</span>
                    <span>₹{getShipping().toLocaleString()}</span>
                  </div>
                  {getTotalSavings() > 0 && (
                    <div className="flex justify-between items-center mb-2 text-green-600">
                      <span>You Save:</span>
                      <span>₹{getTotalSavings().toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{getTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-800">{userDetails.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-800">{userDetails.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-800">{userDetails.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-800">
                    {userDetails.address || 'Not provided'}, {userDetails.city || ''}, {userDetails.state || ''} - {userDetails.pincode || ''}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full py-3 px-4 rounded-md font-medium transition duration-200 ${
                  processing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {processing ? "Processing..." : `Pay ₹${getTotal().toLocaleString()}`}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Powered by Razorpay | Secure Payment Gateway
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Payment;
