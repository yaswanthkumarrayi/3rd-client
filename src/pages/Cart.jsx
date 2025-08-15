import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Register from "./Register";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, AlertCircle, CreditCard, Package, ArrowLeft, Heart } from "lucide-react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [animatingItems, setAnimatingItems] = useState(new Set());
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
      setError("Please complete your profile information to place order.");
      setTimeout(() => {
        navigate("/user");
      }, 2000);
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

    // Success animation
    const successNotification = document.createElement('div');
    successNotification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce';
    successNotification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
        </div>
        <span class="font-semibold">Order placed successfully! 🎉</span>
      </div>
    `;
    document.body.appendChild(successNotification);
    setTimeout(() => document.body.removeChild(successNotification), 4000);

    localStorage.removeItem("cartItems");
    localStorage.setItem("cartCount", "0");
    setCartItems([]);
    setIsLoading(false);
    
    setTimeout(() => {
      navigate("/orders");
    }, 1500);
  }

  function handleQuantityChange(index, newQuantity) {
    if (newQuantity < 1) return;
    
    setAnimatingItems(prev => new Set([...prev, index]));
    setTimeout(() => {
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 300);

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

    // Show removal notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
    notification.textContent = 'Item removed from cart';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 flex flex-col">
      <Header />
      
      <div className="flex-1 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-fuchsia-200 mb-6">
              <div className="p-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                Shopping Cart
              </h1>
            </div>
            {cartItems.length > 0 && (
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Package className="w-4 h-4" />
                <span className="text-sm sm:text-base font-medium">
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • {cartItems.reduce((sum, item) => sum + item.quantity, 0)} total pieces
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Error Message */}
          {error && (
            <div className="mb-6 mx-auto max-w-2xl animate-shake">
              <div className="bg-red-50 border-l-4 border-red-400 rounded-2xl p-6 flex items-start gap-4 shadow-lg">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-red-800 font-semibold mb-1">Attention Required</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {cartItems.length === 0 ? (
            /* Enhanced Empty Cart State */
            <div className="text-center py-16 sm:py-24">
              <div className="max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-r from-fuchsia-100 to-pink-100 rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-200 to-pink-200 rounded-full animate-ping opacity-20"></div>
                    <ShoppingCart className="w-16 h-16 text-fuchsia-400 relative z-10" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your cart feels lonely</h3>
                <p className="text-gray-600 mb-8 text-base sm:text-lg leading-relaxed">
                  Fill it with beautiful sarees and lehengas that'll make you shine ✨
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-fuchsia-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  Discover Beautiful Collections
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Enhanced Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {cartItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 group ${
                        animatingItems.has(idx) ? 'animate-pulse' : ''
                      }`}
                    >
                      <div className="p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Enhanced Product Image */}
                          <div className="flex-shrink-0 mx-auto sm:mx-0 relative group/image">
                            <div className="relative overflow-hidden rounded-2xl">
                              <img
                                src={item.hero_image_url}
                                alt={item.title}
                                className="w-32 h-32 sm:w-40 sm:h-40 object-cover transition-transform duration-500 group-hover/image:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-all duration-300"></div>
                            </div>
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                              NEW
                            </div>
                          </div>
                          
                          {/* Enhanced Product Details */}
                          <div className="flex-1 space-y-4">
                            <div className="text-center sm:text-left">
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-fuchsia-600 transition-colors duration-300 mb-3">
                                {item.title}
                              </h3>
                              
                              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-4">
                                <span className="bg-gradient-to-r from-fuchsia-50 to-pink-50 border border-fuchsia-200 px-4 py-2 rounded-full text-sm font-semibold text-fuchsia-700">
                                  {item.fabric}
                                </span>
                                <span className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200 px-4 py-2 rounded-full text-sm font-semibold text-purple-700">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                            
                            {/* Enhanced Price Display */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 text-center sm:text-left">
                              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                                <span className="text-2xl sm:text-3xl font-bold text-green-600">₹{item.discount_price}</span>
                                {item.original_price > item.discount_price && (
                                  <>
                                    <span className="text-lg text-gray-500 line-through">₹{item.original_price}</span>
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                                      {Math.round(((item.original_price - item.discount_price) / item.original_price) * 100)}% OFF
                                    </span>
                                  </>
                                )}
                              </div>
                              {item.original_price > item.discount_price && (
                                <p className="text-green-600 font-semibold text-sm">
                                  You save ₹{item.original_price - item.discount_price} per item! 🎉
                                </p>
                              )}
                            </div>
                            
                            {/* Enhanced Quantity Controls */}
                            <div className="flex items-center justify-center sm:justify-start gap-4 pt-4">
                              <div className="flex items-center bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-1 shadow-inner">
                                <button
                                  onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                                  className="p-3 hover:bg-fuchsia-100 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4 text-fuchsia-600 group-hover/btn:scale-110 transition-transform duration-200" />
                                </button>
                                <span className="mx-6 font-bold text-xl text-fuchsia-800 min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                                  className="p-3 hover:bg-fuchsia-100 rounded-xl transition-all duration-200 group/btn"
                                >
                                  <Plus className="w-4 h-4 text-fuchsia-600 group-hover/btn:scale-110 transition-transform duration-200" />
                                </button>
                              </div>
                              
                              <button
                                onClick={() => handleRemove(idx)}
                                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-xl font-semibold transition-all duration-200 border border-red-200 hover:border-red-300 group/remove"
                              >
                                <Trash2 className="w-4 h-4 group-hover/remove:scale-110 transition-transform duration-200" />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="bg-gray-50 rounded-xl p-3 text-center sm:text-left border border-gray-200">
                              <span className="text-gray-600">Item Total: </span>
                              <span className="font-bold text-lg text-gray-900">₹{item.discount_price * item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Order Summary */}
              <div className="mt-8 lg:mt-0">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-6 lg:p-8 sticky top-24">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                      <Package className="w-5 h-5" />
                      <h3 className="text-xl font-bold">Order Summary</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                        <span className="font-semibold text-gray-900">₹{getTotal()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-semibold text-green-600">FREE</span>
                      </div>
                      
                      {getTotalSavings() > 0 && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 bg-green-50 px-4 rounded-xl border border-green-200">
                          <span className="text-green-700 font-semibold">You Save</span>
                          <span className="font-bold text-green-600">-₹{getTotalSavings()}</span>
                        </div>
                      )}
                      
                      <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 rounded-2xl p-4 border border-fuchsia-200">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-fuchsia-800">Total Amount</span>
                          <span className="text-2xl font-bold text-fuchsia-800">₹{getTotal()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleBuyNow}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-fuchsia-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          <span>Proceed to Buy ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                        </>
                      )}
                    </button>
                    
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-semibold">
                        <Heart className="w-4 h-4" />
                        <span>100% Secure Checkout</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Free delivery • Quality assured • Easy returns
                      </p>
                    </div>
                  </div>
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

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
export default Cart;