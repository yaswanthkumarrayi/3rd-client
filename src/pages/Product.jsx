import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ArrowLeft, Star, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus, CreditCard } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";


const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartCount, setCartCount] = useState(
    Number(localStorage.getItem("cartCount")) || 0
  );
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  function handleShare() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => {
      // Show a notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = 'Product link copied!';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 2000);
    })
    .catch(() => {
      alert("Failed to copy link.");
    });
}

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }

  const images = product
    ? [product.hero_image_url, ...(product.featured_images || [])]
    : [];

  function addToCart() {
    const newCartCount = cartCount + quantity;
    localStorage.setItem("cartCount", newCartCount);
    setCartCount(newCartCount);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const nextImage = () => {
    setActiveImg((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImg((prev) => (prev - 1 + images.length) % images.length);
  };

  const increaseQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50">
        <div className="text-center space-y-6 animate-pulse">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-pink-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-fuchsia-600 font-semibold text-lg">Loading product...</p>
            <p className="text-fuchsia-400 text-sm">Preparing the perfect view for you</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="text-8xl mb-6 animate-bounce">😔</div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">Product not found</h2>
            <p className="text-gray-600 max-w-md mx-auto">Sorry, we couldn't find the product you're looking for. It might have been moved or removed.</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="group bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-fuchsia-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              Go Back Home
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50">
      <Header />
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-md text-fuchsia-700 rounded-xl sm:rounded-2xl font-semibold hover:bg-white hover:shadow-xl transition-all duration-300 border border-fuchsia-200/50 transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="hidden sm:inline">Back to Collection</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4 sm:space-y-6 animate-slide-in-left">
            {/* Main Image */}
            <div className="relative group">
              <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[600px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-white/50 overflow-hidden">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="w-8 h-8 border-2 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={images[activeImg]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  onLoad={() => setImageLoading(false)}
                  onLoadStart={() => setImageLoading(true)}
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 backdrop-blur-sm text-fuchsia-600 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 backdrop-blur-sm text-fuchsia-600 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Image Counter */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/70 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-white/20">
                {activeImg + 1} / {images.length}
              </div>

              {/* Discount Badge */}
              {product.original_price > product.discount_price && (
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold animate-pulse">
                  {Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <div key={idx} className="relative flex-shrink-0">
                    <img
                      src={img}
                      alt={`Product ${idx + 1}`}
                      className={`w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl cursor-pointer border-2 transition-all duration-300 hover:scale-110 ${
                        activeImg === idx
                          ? "border-fuchsia-500 shadow-lg ring-2 ring-fuchsia-200"
                          : "border-white/50 hover:border-fuchsia-300"
                      }`}
                      onClick={() => setActiveImg(idx)}
                    />
                    {activeImg === idx && (
                      <div className="absolute inset-0 bg-fuchsia-500/20 rounded-lg sm:rounded-xl"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6 sm:space-y-8 animate-slide-in-right">
            {/* Product Header */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg animate-shimmer">
                  New Arrival
                </span>
                <span className="bg-fuchsia-100 text-fuchsia-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  {product.category}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.title}
              </h1>
      
              
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/50 shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 animate-pulse">₹{product.discount_price}</span>
                  {product.original_price > product.discount_price && (
                    <>
                      <span className="text-lg sm:text-xl text-gray-500 line-through">₹{product.original_price}</span>
                      <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold animate-bounce">
                        SAVE ₹{product.original_price - product.discount_price}
                      </span>
                    </>
                  )}
                </div>
                {product.original_price > product.discount_price && (
                  <div className="text-green-600 font-semibold text-sm sm:text-base">
                    🎉 You save ₹{product.original_price - product.discount_price} on this purchase!
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/50 shadow-lg">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-4">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="p-2 sm:p-3 bg-fuchsia-100 text-fuchsia-600 rounded-xl hover:bg-fuchsia-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                >
                  <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className="text-xl sm:text-2xl font-bold text-gray-900 min-w-[2rem] text-center">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= product.quantity}
                  className="p-2 sm:p-3 bg-fuchsia-100 text-fuchsia-600 rounded-xl hover:bg-fuchsia-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="ml-4 text-sm text-gray-600">
                  <span className="font-semibold text-green-600">{product.quantity} available</span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/50 shadow-lg transform hover:scale-105 transition-all duration-300">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-4">Product Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs sm:text-sm">Fabric</span>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">{product.fabric}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs sm:text-sm">Category</span>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">{product.category}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs sm:text-sm">Availability</span>
                  <div className="font-semibold text-green-600 text-sm sm:text-base">In Stock ({product.quantity} left)</div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs sm:text-sm">SKU</span>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">{String(product.id).slice(0, 8)}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={addToCart}
                  disabled={addedToCart}
                  className="group flex-1 relative overflow-hidden bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-6 sm:px-8 py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-fuchsia-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <span className={`transition-all duration-300 ${addedToCart ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                    Add {quantity > 1 ? `${quantity} items` : 'to Cart'}
                  </span>
                  <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${addedToCart ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                    ✨ Added to Cart!
                  </span>
                </button>
                <div className="flex gap-3 sm:gap-4">
                  <button className="p-3 sm:p-4 bg-white/80 backdrop-blur-md text-fuchsia-600 rounded-xl sm:rounded-2xl border border-fuchsia-200 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                  onClick={handleShare}
                  title="Copy product link"
                  >
                    <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/50 shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-fuchsia-50 transition-all duration-300">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Free Delivery</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-fuchsia-50 transition-all duration-300">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Quality Assured</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-fuchsia-50 transition-all duration-300">
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Authentic Product</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes shimmer {
          0%, 100% { background-position: -200% 0; }
          50% { background-position: 200% 0; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Product;