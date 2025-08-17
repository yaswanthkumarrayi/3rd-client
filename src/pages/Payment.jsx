import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";

const RAZORPAY_KEY_ID = "rzp_test_R6NmIHLl4TZltu"; // Replace with your key

const Payment = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    // Load cart and user info
    setCartItems(JSON.parse(localStorage.getItem("cartItems") || "[]"));
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user && data.user.email) {
        fetchProfile(data.user.email);
      }
    });
  }, []);

  async function fetchProfile(email) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (data) setProfile(data);
  }

  function getTotal() {
    return cartItems.reduce(
      (sum, item) => sum + item.discount_price * item.quantity,
      0
    );
  }

  async function handlePayment() {
    setIsPaying(true);

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: getTotal() * 100, // in paise
      currency: "INR",
      name: "Ashok Kumar Textiles",
      description: "Order Payment",
      handler: async function (response) {
        // Payment successful, save order to Supabase
        await placeOrder(response.razorpay_payment_id);
      },
      prefill: {
        name: profile?.full_name,
        email: profile?.email,
        contact: profile?.phone,
      },
      theme: { color: "#f50057" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setIsPaying(false);
  }

  async function placeOrder(paymentId) {
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
      alert("Order placed successfully!");
      navigate("/orders");
    } else {
      alert("Order failed to save. Please contact support.");
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-gray-600 font-medium">Please login and fill your profile to proceed.</p>
            <button
              onClick={() => navigate("/user")}
              className="bg-fuchsia-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-fuchsia-700 transition-colors"
            >
              Go to Profile
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
        <div className="max-w-xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-fuchsia-700 mb-8 text-center">Payment</h1>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <ul className="mb-4">
              {cartItems.map((item, idx) => (
                <li key={idx} className="flex justify-between py-2 border-b">
                  <span>{item.title} x {item.quantity}</span>
                  <span>₹{item.discount_price * item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{getTotal()}</span>
            </div>
          </div>
          <button
            onClick={handlePayment}
            disabled={isPaying}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isPaying ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;