import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Register from "./Register";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, AlertCircle, CreditCard, Package, ArrowLeft, CheckCircle } from "lucide-react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load and validate cart items from localStorage
    const loadCartItems = () => {
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      
      // Filter out any invalid items and ensure proper structure
      const validItems = items.filter(item => {
        return item && 
               item.id && 
               item.quantity > 0 && 
               item.availableQuantity >= 0 && 
               item.discount_price && 
               item.title;
      });

      // Update localStorage if invalid items were removed
      if (validItems.length !== items.length) {
        localStorage.setItem("cartItems", JSON.stringify(validItems));
        localStorage.setItem("cartCount", validItems.length.toString());
        window.dispatchEvent(new Event("cartUpdated"));
      }

      setCartItems(validItems);
    };

    // Load cart items initially
    loadCartItems();

    // Add event listener for cart updates
    window.addEventListener("cartUpdated", loadCartItems);

    // Check Supabase Auth
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user && data.user.email) {
        fetchProfile(data.user.email);
      }
    });

    // Cleanup event listener
    return () => {
      window.removeEventListener("cartUpdated", loadCartItems);
    };
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
    setIsLoading(false);
    navigate("/payment");
  };

  function handleQuantityChange(index, newQuantity) {
  const item = cartItems[index];
  if (newQuantity < 1) return;

  // Prevent exceeding available quantity
  if (newQuantity > item.availableQuantity) {
    // Show error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = `Only ${item.availableQuantity} items available in stock.`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
    return;
  }

  const newCart = [...cartItems];
  newCart[index].quantity = newQuantity;
  setCartItems(newCart);
  localStorage.setItem("cartItems", JSON.stringify(newCart));
  localStorage.setItem("cartCount", newCart.length);
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
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = 'Item removed from cart';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 sm:pt-20 pb-4 sm:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-fuchsia-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-sm sm:text-base">Continue Shopping</span>
              </button>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-fuchsia-600" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            {cartItems.length > 0 && (
              <p className="text-sm sm:text-base text-gray-600">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • {cartItems.reduce((sum, item) => sum + item.quantity, 0)} pieces
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 mb-1 text-sm sm:text-base">Attention Required</h3>
                  <p className="text-red-700 text-xs sm:text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-12 sm:py-16">
              <div className="max-w-sm mx-auto px-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Your cart is empty</h3>
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                  Add some beautiful sarees and lehengas to get started
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-6 xl:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4 mb-6 lg:mb-0">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={item.hero_image_url}
                          alt={item.title}
                          className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <div className="text-center sm:text-left">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          
                          <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mb-2 sm:mb-3">
                            <span className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                              {item.fabric}
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                              {item.category}
                            </span>
                            {item.selectedColor && (
                              <span className="bg-fuchsia-100 text-fuchsia-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                                <div 
                                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-fuchsia-300"
                                  style={{ backgroundColor: item.selectedColor.color }}
                                ></div>
                                {item.selectedColor.name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 sm:mb-2">
                            <span className="text-lg sm:text-xl font-bold text-gray-900">₹{item.discount_price}</span>
                            {item.original_price > item.discount_price && (
                              <>
                                <span className="text-xs sm:text-sm text-gray-500 line-through">₹{item.original_price}</span>
                                <span className="bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium">
                                  {Math.round(((item.original_price - item.discount_price) / item.original_price) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>
                          {item.original_price > item.discount_price && (
                            <p className="text-green-600 text-xs sm:text-sm">
                              You save ₹{item.original_price - item.discount_price}
                            </p>
                          )}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center bg-gray-50 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                            </button>
                            <span className="px-3 sm:px-4 py-2 font-medium text-gray-900 min-w-[2.5rem] sm:min-w-[3rem] text-center text-sm sm:text-base">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                              disabled={item.quantity >= item.availableQuantity}
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemove(idx)}
                            className="flex items-center gap-1 sm:gap-2 text-red-600 hover:text-red-700 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm font-medium">Remove</span>
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center sm:text-left">
                          <span className="text-gray-600 text-xs sm:text-sm">Item Total: </span>
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">₹{item.discount_price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-24">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-fuchsia-600" />
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span className="font-medium">₹{getTotal()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">₹100</span>
                    </div>
                    
                    {getTotalSavings() > 0 && (
                      <div className="flex justify-between text-sm bg-green-50 p-2 sm:p-3 rounded-lg">
                        <span className="text-green-700 font-medium">Total Savings</span>
                        <span className="font-semibold text-green-700">₹{getTotalSavings()}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-3 sm:pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-fuchsia-600">₹{getTotal()}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleBuyNow}
                      disabled={isLoading}
                      className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-fuchsia-400 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Checkout ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                        </>
                      )}
                    </button>
                    
                    <div className="text-center pt-2">
                      <div className="flex items-center justify-center gap-2 text-green-600 text-xs sm:text-sm mb-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Secure Checkout</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Affordable Prices • Quality assured • Easy returns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

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