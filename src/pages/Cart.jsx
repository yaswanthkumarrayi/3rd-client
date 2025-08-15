import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Register from "./Register";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, AlertCircle, CreditCard } from "lucide-react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart items from localStorage
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartItems(items);

    // Check Supabase Auth
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
    return cartItems.reduce(
      (sum, item) => sum + item.discount_price * item.quantity,
      0
    );
  }

  function getTotalSavings() {
    return cartItems.reduce(
      (sum, item) => sum + (item.original_price - item.discount_price) * item.quantity,
      0
    );
  }

  async function handleBuyNow() {
    setError("");
    setIsLoading(true);
    
    if (!user) {
      setShowRegister(true);
      setError("Please register or login to place your order.");
      setIsLoading(false);
      return;
    }
    
    // Check profile completeness
    if (
      !profile ||
      !profile.full_name ||
      !profile.phone ||
      !profile.city ||
      !profile.state ||
      !profile.pincode ||
      !profile.address
    ) {
      setError("Please fill all profile information in your account to place order.");
      navigate("/user");
      setIsLoading(false);
      return;
    }

    // Prepare order data
    const order = {
      user_email: user.email,
      items: cartItems,
      total: getTotal(),
      status: "Placed",
      created_at: new Date().toISOString(),
    };

    // Insert order into Supabase
    const { error: orderError } = await supabase
      .from("orders")
      .insert([order]);

    if (orderError) {
      setError("Failed to place order. Please try again.");
      setIsLoading(false);
      return;
    }

    alert("Order placed successfully!");
    localStorage.removeItem("cartItems");
    localStorage.setItem("cartCount", "0");
    setCartItems([]);
    setIsLoading(false);
    navigate("/orders");
  }

  function handleQuantityChange(index, newQuantity) {
    if (newQuantity < 1) return;
    const newCart = [...cartItems];
    newCart[index].quantity = newQuantity;
    setCartItems(newCart);
    localStorage.setItem("cartItems", JSON.stringify(newCart));
    localStorage.setItem("cartCount", newCart.reduce((sum, item) => sum + item.quantity, 0));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function handleRemove(index) {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
    localStorage.setItem("cartItems", JSON.stringify(newCart));
    localStorage.setItem("cartCount", newCart.reduce((sum, item) => sum + item.quantity, 0));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 flex flex-col">
      <Header />
      
      <div className="flex-1 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShoppingCart className="w-8 h-8 text-fuchsia-600" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fuchsia-800">Shopping Cart</h1>
            </div>
            {cartItems.length > 0 && (
              <p className="text-gray-600 text-sm sm:text-base">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 mx-auto max-w-2xl">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 font-medium text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-12 sm:py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-fuchsia-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h3>
                <p className="text-gray-600 mb-8 text-sm sm:text-base">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-fuchsia-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4 sm:space-y-6">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-lg border border-fuchsia-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0 mx-auto sm:mx-0">
                            <img
                              src={item.hero_image_url}
                              alt={item.title}
                              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border border-fuchsia-100"
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-lg sm:text-xl font-bold text-fuchsia-800 mb-2">{item.title}</h3>
                            
                            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-600 mb-3">
                              <span className="bg-fuchsia-50 px-3 py-1 rounded-full">
                                <span className="font-medium">Fabric:</span> {item.fabric}
                              </span>
                              <span className="bg-fuchsia-50 px-3 py-1 rounded-full">
                                <span className="font-medium">Category:</span> {item.category}
                              </span>
                            </div>
                            
                            {/* Price */}
                            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                              <span className="text-xl sm:text-2xl font-bold text-green-600">₹{item.discount_price}</span>
                              {item.original_price > item.discount_price && (
                                <span className="text-base text-gray-500 line-through">₹{item.original_price}</span>
                              )}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-center sm:justify-start gap-4">
                              <div className="flex items-center bg-fuchsia-50 rounded-xl p-1">
                                <button
                                  onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                                  className="p-2 hover:bg-fuchsia-100 rounded-lg transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4 text-fuchsia-600" />
                                </button>
                                <span className="mx-4 font-semibold text-fuchsia-800 min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                                  className="p-2 hover:bg-fuchsia-100 rounded-lg transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-fuchsia-600" />
                                </button>
                              </div>
                              
                              <button
                                onClick={() => handleRemove(idx)}
                                className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl font-semibold hover:bg-red-100 transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 lg:mt-0">
                <div className="bg-white rounded-2xl shadow-xl border border-fuchsia-100 p-6 sticky top-6">
                  <h3 className="text-xl font-bold text-fuchsia-800 mb-6 text-center">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span>₹{getTotal()}</span>
                    </div>
                    
                    {getTotalSavings() > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>You Save</span>
                        <span>-₹{getTotalSavings()}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-fuchsia-100 pt-4">
                      <div className="flex justify-between text-lg font-bold text-fuchsia-800">
                        <span>Total</span>
                        <span>₹{getTotal()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBuyNow}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:from-fuchsia-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Proceed to Buy</span>
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Secure checkout • Free delivery available
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      
      {showRegister && (
        <Register
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
          }}
        />
      )}
    </div>
  );
};

export default Cart;