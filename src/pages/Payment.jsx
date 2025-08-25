import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";
import { Check, ShoppingCart, User, CreditCard, MapPin, Phone, Mail } from "lucide-react";
import { emailService } from "../services/emailService";
order_date
function Payment() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
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
    const init = async () => {
      await checkAuth();
      loadCartItems();
      setLoading(false);
    };
    init();
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
      // First check for a buy now item
      const buyNowItem = localStorage.getItem("buyNowItem");
      if (buyNowItem) {
        const parsedItem = JSON.parse(buyNowItem);
        setCartItems([parsedItem]);
        // Don't remove the buyNowItem yet, wait for successful order
      } else {
        // If no buy now item, load cart items
        const cartData = localStorage.getItem("cartItems");
        if (cartData) {
          const items = JSON.parse(cartData);
          setCartItems(Array.isArray(items) ? items : []);
        } else {
          setCartItems([]);
        }
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
      setError("No items found for checkout.");
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

      // Handle different response structures
      let orderId;
      if (orderData.id) {
        orderId = orderData.id;
      } else if (orderData.order && orderData.order.id) {
        orderId = orderData.order.id;
        orderData = orderData.order; // Use the nested order object
      } else {
        console.error("❌ Orr creation failed - No order ID found:", orderData);
        setError(orderData.error || "Failed to create payment order");
        setProcessing(false);
        return;
      }      // Prepare Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        order_id: orderId,
        name: "Ashok Kumar Textiles",
        image: "FullLogo.jpg",
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
            
            // Update product quantities in database
            for (const item of cartItems) {
              const { data: productData, error: productError } = await supabase
                .from('products')
                .select('quantity')
                .eq('id', item.id)
                .single();

              if (!productError && productData) {
                const newQuantity = Math.max(0, productData.quantity - item.quantity);
                await supabase
                  .from('products')
                  .update({ quantity: newQuantity })
                  .eq('id', item.id);
              }
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
                  <div class="text-sm opacity-90">Order placed successfully and confirmation emails sent via Gmail</div>
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
      // Clear localStorage based on order source
      if (localStorage.getItem("buyNowItem")) {
        localStorage.removeItem("buyNowItem");
      } else {
        localStorage.removeItem("cartItems");
        localStorage.setItem("cartCount", "0");
        window.dispatchEvent(new Event("cartUpdated"));
      }

      // Check current auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      // Format cart items with essential details
      const formattedItems = cartItems.map(item => ({
        id: item.id,
        title: item.title || item.name,
        quantity: item.quantity,
        price: item.discount_price || item.price,
        original_price: item.original_price || item.price,
        image_url: item.hero_image_url || item.image,
        sku: item.sku || '',
        category: item.category || ''
      }));

      // Prepare minimal required order data
      const orderData = {
        user_email: String(user?.email || userDetails.email),
        phone: String(userDetails.phone || profile?.phone || ''),
        address: String(userDetails.address || profile?.address || ''),
        city: String(userDetails.city || profile?.city || ''),
        state: String(userDetails.state || profile?.state || ''),
        pincode: String(userDetails.pincode || profile?.pincode || ''),
        items: JSON.stringify(formattedItems.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          sku: item.sku || ''
        }))),
        amount: Number(getTotal()),
        status: "paid",
        payment_id: String(payment_id),
        payment_method: "razorpay",
        created_at: new Date().toISOString()
      };
      
      // Now insert the order with retry logic
      let retries = 3;
      let data = null;
      let error = null;
      
      while (retries > 0 && !data) {
        console.log(`📝 Attempting to create order (${retries} retries left)...`);
        
        // Test connectivity first
        const { error: testError } = await supabase
          .from("orders")
          .select("id")
          .limit(1);
          
        if (testError) {
          console.error('❌ Database connectivity check failed:', testError);
          retries--;
          continue;
        }
        
        // Try to insert the order
        const result = await supabase
          .from("orders")
          .insert([orderData])
          .select()
          .single();
          
        error = result.error;
        data = result.data;
        
        if (error) {
          console.error('❌ Failed to create order:', {
            message: error.message,
            code: error.code,
            details: error.details
          });
          retries--;
          // Wait 1 second before retrying
          if (retries > 0) await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        
        if (!data) {
          console.error('❌ Order creation returned no data');
          retries--;
          continue;
        }
        
        // Success! Break the loop
        break;
      }
      
      if (!data) {
        throw new Error(`Failed to create order after multiple attempts: ${error?.message}`);
      }

      console.log('✅ Order created successfully:', data);

      // Send email notifications after successful order creation
      try {
        console.log('📧 Attempting to send email notifications via Gmail...');
        
        // Prepare email data
        const emailData = {
          orderNumber: `AKT-${data.id}`, // Using order ID as order number
          customerName: userDetails.full_name || user?.email?.split('@')[0] || 'Customer',
          customerEmail: userDetails.email || user?.email || '',
          customerPhone: userDetails.phone || profile?.phone || '',
          items: formattedItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color || '',
            size: item.size || ''
          })),
          totalAmount: getTotal(),
          shippingAddress: {
            street: userDetails.address || profile?.address || '',
            city: userDetails.city || profile?.city || '',
            state: userDetails.state || profile?.state || '',
            pincode: userDetails.pincode || profile?.pincode || '',
            country: 'India'
          },
          paymentId: payment_id
        };

        // Send admin notification email
        console.log('📧 Sending admin notification email via Gmail...');
        const adminEmailSent = await emailService.sendOrderNotificationToAdmin(emailData);
        if (adminEmailSent) {
          console.log('✅ Admin notification email sent successfully via Gmail');
        } else {
          console.warn('⚠️ Admin notification email failed');
        }

        // Send customer confirmation email
        if (emailData.customerEmail) {
          console.log('📧 Sending customer confirmation email via Gmail...');
          const customerEmailSent = await emailService.sendOrderConfirmationToCustomer(emailData);
          if (customerEmailSent) {
            console.log('✅ Customer confirmation email sent successfully via Gmail');
          } else {
            console.warn('⚠️ Customer confirmation email failed');
          }
        }

      } catch (emailError) {
        console.error('❌ Email notification failed:', emailError);
        // Don't throw error here - order was successful, email is secondary
      }
      
      return data;
    } catch (error) {
      console.error("❌ Error creating order:", error);
      
      // Try a simpler fallback with absolutely minimal data
      try {
        const fallbackOrderData = {
          user_email: String(user?.email || userDetails.email || 'guest@akshop.com'),
          total: Number(getTotal()),
          status: "paid",
          payment_id: String(payment_id),
          items: JSON.stringify(cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price || item.discount_price
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

        console.log('✅ Fallback order created successfully:', fallbackData);
        
        // Send email notifications for fallback order too
        try {
          console.log('📧 Attempting to send email notifications for fallback order via Gmail...');
          
          // Prepare email data for fallback
          const emailData = {
            orderNumber: `AKT-${fallbackData.id}`, // Using order ID as order number
            customerEmail: userDetails.email || user?.email || '',
            customerPhone: userDetails.phone || '',
            items: cartItems.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              color: item.color || '',
              size: item.size || ''
            })),
            totalAmount: getTotal(),
            shippingAddress: {
              street: userDetails.address || '',
              city: userDetails.city || '',
              state: userDetails.state || '',
              pincode: userDetails.pincode || '',
              country: 'India'
            },
            paymentId: payment_id
          };

          // Send admin notification email
          const adminEmailSent = await emailService.sendOrderNotificationToAdmin(emailData);
          if (adminEmailSent) {
            console.log('✅ Fallback admin notification email sent successfully via Gmail');
          }

          // Send customer confirmation email
          if (emailData.customerEmail) {
            const customerEmailSent = await emailService.sendOrderConfirmationToCustomer(emailData);
            if (customerEmailSent) {
              console.log('✅ Fallback customer confirmation email sent successfully via Gmail');
            }
          }

        } catch (emailError) {
          console.error('❌ Fallback email notification failed:', emailError);
          // Don't throw error here - order was successful, email is secondary
        }
        
        return fallbackData;
      } catch (fallbackError) {
        console.error("❌ Fallback order creation also failed:", fallbackError);
        throw new Error(`Order creation completely failed: ${error.message}`);
      }
    }
  };

  const steps = [
    { number: 1, title: "Order Review", icon: ShoppingCart },
    { number: 2, title: "Details", icon: User },
    { number: 3, title: "Payment", icon: CreditCard }
  ];

  const StepIndicator = () => (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-fuchsia-600 text-white shadow-lg' : 
                    isActive ? 'bg-fuchsia-100 border-2 border-fuchsia-600 text-fuchsia-600' : 
                    'bg-gray-100 text-gray-400'}
                `}>
                  {isCompleted ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>
                <span className={`
                  text-xs sm:text-sm font-medium mt-2 text-center
                  ${isActive || isCompleted ? 'text-fuchsia-600' : 'text-gray-500'}
                `}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-300
                  ${currentStep > step.number ? 'bg-fuchsia-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-fuchsia-100">
        <Header />
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Payment</h2>
              <p className="text-gray-600">Please wait while we prepare your checkout...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
        <Header />
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Your order has been placed successfully and confirmation emails have been sent via Gmail.</p>
              {orderDetails.payment_id && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-500 font-medium">Payment Reference</p>
                  <p className="text-gray-800 font-mono text-sm">{orderDetails.payment_id}</p>
                </div>
              )}
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                <p className="font-medium">Redirecting to your orders...</p>
              </div>
              <button
                onClick={() => window.location.href = '/orders'}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                View My Orders
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
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-fuchsia-100">
        <Header />
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Empty Cart</h2>
              <p className="text-gray-600 mb-6">Your cart is empty. Add some items to continue with checkout.</p>
              <a 
                href="/" 
                className="w-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-fuchsia-100">
      <Header />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Secure Checkout</h1>
            <p className="text-gray-600">Complete your order in 3 simple steps</p>
          </div>

          {/* Step Indicator */}
          <StepIndicator />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Step 1: Order Summary */}
              {currentStep >= 1 && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 px-6 py-4">
                    <div className="flex items-center text-white">
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      <h2 className="text-xl font-bold">Order Summary</h2>
                      <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <div className="flex-shrink-0">
                            <img 
                              src={item.hero_image_url || item.image} 
                              alt={item.title || item.name} 
                              className="w-16 h-16 object-cover rounded-lg shadow-sm"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">{item.title || item.name}</h3>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-fuchsia-600 font-bold">₹{((item.discount_price || item.price || 0) * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {currentStep === 1 && (
                      <div className="mt-6">
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="w-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Continue to Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: User Details */}
              {currentStep >= 2 && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 px-6 py-4">
                    <div className="flex items-center text-white">
                      <User className="w-6 h-6 mr-3" />
                      <h2 className="text-xl font-bold">Shipping & Contact Details</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                          <User className="w-5 h-5 text-fuchsia-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700">Full Name</p>
                            <p className="text-gray-800 font-semibold truncate">{userDetails.full_name || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                          <Mail className="w-5 h-5 text-fuchsia-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700">Email</p>
                            <p className="text-gray-800 font-semibold truncate">{userDetails.email || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                          <Phone className="w-5 h-5 text-fuchsia-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700">Phone</p>
                            <p className="text-gray-800 font-semibold">{userDetails.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                          <MapPin className="w-5 h-5 text-fuchsia-600 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 mb-1">Shipping Address</p>
                            <div className="text-gray-800">
                              <p className="font-semibold">{userDetails.address || 'Not provided'}</p>
                              <p>{userDetails.city || ''}, {userDetails.state || ''}</p>
                              <p className="font-medium">{userDetails.pincode || ''}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {currentStep === 2 && (
                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
                        >
                          Back to Order
                        </button>
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="flex-1 bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Proceed to Payment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep >= 3 && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 px-6 py-4">
                    <div className="flex items-center text-white">
                      <CreditCard className="w-6 h-6 mr-3" />
                      <h2 className="text-xl font-bold">Secure Payment</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="bg-gradient-to-r from-fuchsia-50 to-fuchsia-100 rounded-xl p-6 mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 font-medium">🔒 SSL Secured Payment Gateway</p>
                        <p className="text-sm text-gray-600 mt-1">Your payment information is encrypted and secure</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
                        disabled={processing}
                      >
                        Back to Details
                      </button>
                      <button
                        onClick={handlePayment}
                        disabled={processing}
                        className={`flex-1 font-medium py-4 px-6 rounded-xl transition-all duration-200 ${
                          processing
                            ? "bg-gray-300 cursor-not-allowed text-gray-500"
                            : "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        }`}
                      >
                        {processing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent mr-3"></div>
                            Processing Payment...
                          </div>
                        ) : (
                          `Pay ₹${getTotal().toFixed(2)}`
                        )}
                      </button>
                    </div>

                    <div className="mt-6 text-center">
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <span>Powered by</span>
                        <div className="font-bold text-blue-600">Razorpay</div>
                        <span>•</span>
                        <span>UPI, Cards, Wallets</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Total Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Order Total</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-800">₹{getShipping().toFixed(2)}</span>
                  </div>
                  {getTotalSavings() > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-green-100 bg-green-50 -mx-4 px-4 rounded-lg">
                      <span className="text-green-700 font-medium">You Save</span>
                      <span className="font-bold text-green-700">-₹{getTotalSavings().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-4 border-t-2 border-fuchsia-100">
                    <span className="text-xl font-bold text-gray-800">Total</span>
                    <span className="text-xl font-bold text-fuchsia-600">₹{getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3">Secure Checkout Guaranteed</p>
                    <div className="flex justify-center items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>SSL Secured</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                        <span>PCI Compliant</span>
                      </div>
                    </div>
                  </div>
                </div>
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