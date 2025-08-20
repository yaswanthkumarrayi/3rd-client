import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const BACKEND_URL = "https://threerd-client-2.onrender.com"; // <-- Replace with your backend URL

const Payment = () => {
  const [cartItems, setCartItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart items
    setCartItems(JSON.parse(localStorage.getItem("cartItems") || "[]"));
    // Get user and profile
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user && data.user.email) {
        fetchProfile(data.user.email);
      }
    });
  }, []);

  async function fetchProfile(email) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (!error && data) setProfile(data);
  }

  function getTotal() {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.discount_price * item.quantity,
      0
    );
    return subtotal + 100; // Add shipping
  }

  async function handlePayment() {
    setError("");
    setIsPaying(true);

    if (!user || !profile) {
      setError("Please login and complete your profile.");
      setIsPaying(false);
      return;
    }
    if (
      !profile.full_name ||
      !profile.phone ||
      !profile.city ||
      !profile.state ||
      !profile.pincode ||
      !profile.address
    ) {
      setError("Please complete your profile information.");
      setIsPaying(false);
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      setIsPaying(false);
      return;
    }

    try {
      // 1. Create Razorpay order on backend
      const res = await fetch(`${BACKEND_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: getTotal() * 100, currency: "INR" }),
      });
      const order = await res.json();
      if (!order.id) throw new Error("Order creation failed");

      // 2. Open Razorpay payment popup
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Ashok Kumar Textiles",
        description: "Order Payment",
        handler: async function (response) {
          // 3. On payment success, create order in Supabase
          await placeOrder(response.razorpay_payment_id);
        },
        prefill: {
          name: profile.full_name,
          email: profile.email,
          contact: profile.phone,
        },
        theme: { color: "#3b82f6" },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setError("Payment initiation failed. Please try again.");
      setIsPaying(false);
    }
  }

  async function placeOrder(paymentId) {
    setIsPaying(true);
    try {
      const { error } = await supabase.from("orders").insert([
        {
          user_email: profile.email,
          phone: profile.phone,
          full_name: profile.full_name,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
          items: cartItems,
          total: getTotal(),
          status: "placed",
          payment_id: paymentId,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;

      // Clear cart and redirect
      localStorage.removeItem("cartItems");
      localStorage.setItem("cartCount", "0");
      setCartItems([]);
      setIsPaying(false);
      navigate("/orders");
    } catch (error) {
      setError("Order placement failed. Please contact support.");
      setIsPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6 text-center">Payment</h1>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
              {error}
            </div>
          )}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              <ul className="mb-4">
                {cartItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between py-2 border-b">
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span>₹{item.discount_price * item.quantity}</span>
                  </li>
                ))}
                <li className="flex justify-between py-2 font-bold">
                  <span>Shipping</span>
                  <span>₹100</span>
                </li>
                <li className="flex justify-between py-2 font-bold text-lg">
                  <span>Total</span>
                  <span>₹{getTotal()}</span>
                </li>
              </ul>
            )}
            <button
              onClick={handlePayment}
              disabled={isPaying || cartItems.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              {isPaying ? "Processing..." : "Pay & Place Order"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;