import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
    setWishlist(items);

    // Listen for wishlist changes
    const handleWishlistUpdate = () => {
      const updated = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
      setWishlist(updated);
    };
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, []);

  function addToCart(item) {
    const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    if (!cart.some(cartItem => cartItem.id === item.id)) {
      cart.push({ ...item, quantity: 1 });
      localStorage.setItem("cartItems", JSON.stringify(cart));
      localStorage.setItem("cartCount", cart.length);
      window.dispatchEvent(new Event("cartUpdated"));
    }
    navigate("/cart");
  }

  function removeFromWishlist(id) {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlistItems", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-pink-600 mb-8 text-center flex items-center justify-center gap-2">
            <Heart size={28} className="text-pink-600" />
            Your Wishlist
          </h1>
          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={48} className="text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No items in wishlist</h3>
              <button
                onClick={() => navigate("/")}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {wishlist.map((item, idx) => (
                <div key={item.id} className="bg-white rounded-xl shadow border border-pink-100 flex items-center gap-6 p-6">
                  <img
                    src={item.hero_image_url}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg border border-pink-100"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-pink-700">{item.title}</h3>
                    <div className="text-gray-600 text-sm mb-2">
                      <span className="font-medium">Fabric:</span> {item.fabric} | <span className="font-medium">Category:</span> {item.category}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-green-600">₹{item.discount_price}</span>
                      {item.original_price > item.discount_price && (
                        <span className="text-base text-gray-500 line-through">₹{item.original_price}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-fuchsia-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-fuchsia-700 transition flex items-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="bg-pink-100 text-pink-600 px-3 py-2 rounded-lg font-semibold hover:bg-pink-200 transition flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;