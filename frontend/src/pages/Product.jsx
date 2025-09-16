import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ArrowLeft, Star, Heart, Share2, DollarSign, Shield, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus, CreditCard, Check } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { optimizeImage, createBlurPlaceholder, preloadImages, getThumbnail, getFullQualityImage } from "../utils/imageOptimizer";

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
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  function showToast(message, type = "success") {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }
  const SHIPPING_CHARGE = 100;

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        showToast("Product link copied to clipboard!");
      })
      .catch(() => {
        showToast("Failed to copy link", "error");
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
  useEffect(() => {
  // Check if product is wishlisted
  const wishlist = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
  setIsWishlisted(wishlist.some(item => item.id === product?.id));
}, [product]);

  const images = product
    ? [product.hero_image_url, ...(product.featured_images || [])].map(img => ({
        original: img,
        optimized: optimizeImage(img, 'product'), // Medium quality for fast loading
        thumbnail: getThumbnail(img) // Fast loading thumbnail for small previews
      }))
    : [];

  // ✅ Preload images when product loads for fast display
  useEffect(() => {
    if (product && images.length > 0) {
      // Preload the first 3 images for fast switching
      const imagesToPreload = images.slice(0, 3).map(img => img.optimized || img.original);
      preloadImages(imagesToPreload, 'product');
    }
  }, [product]);

  function addToCart() {
    if (!product) return;
    
    const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const existingIndex = cart.findIndex(item => item.id === product.id);

    // Check if item is already in cart
    if (existingIndex !== -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + quantity;
      
      // Validate against available stock
      if (newQty > product.quantity) {
        showToast(`Only ${product.quantity} items available in stock`, "error");
        return;
      }
      cart[existingIndex].quantity = newQty;
      cart[existingIndex].availableQuantity = product.quantity; // Update available quantity
    } else {
      // Validate quantity before adding new item
      if (quantity > product.quantity) {
        showToast(`Only ${product.quantity} items available in stock`, "error");
        return;
      }
      
      // Add new item to cart
      cart.push({
        id: product.id,
        title: product.title,
        hero_image_url: images[0]?.optimized || product.hero_image_url,
        original_price: product.original_price,
        discount_price: product.discount_price,
        quantity: quantity,
        availableQuantity: product.quantity,
        fabric: product.fabric,
        category: product.category,
        addedAt: new Date().toISOString() // Add timestamp to track when item was added
      });
    }

  localStorage.setItem("cartItems", JSON.stringify(cart));
  localStorage.setItem("cartCount", cart.length);
  setCartCount(cart.length);
  setAddedToCart(true);
  window.dispatchEvent(new Event("cartUpdated"));
  showToast(`${quantity > 1 ? `${quantity} items` : 'Item'} added to cart!`);
  setTimeout(() => setAddedToCart(false), 2000);
}
  function toggleWishlist() {
  const wishlist = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
  if (isWishlisted) {
    // Remove from wishlist
    const updated = wishlist.filter(item => item.id !== product.id);
    localStorage.setItem("wishlistItems", JSON.stringify(updated));
    setIsWishlisted(false);
  } else {
    // Add to wishlist
    wishlist.push({
      id: product.id,
      title: product.title,
      hero_image_url: product.hero_image_url,
      original_price: product.original_price,
      discount_price: product.discount_price,
      quantity: 1,
      fabric: product.fabric,
      category: product.category,
    });
    localStorage.setItem("wishlistItems", JSON.stringify(wishlist));
    setIsWishlisted(true);
  }
  window.dispatchEvent(new Event("wishlistUpdated"));
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-3 border-gray-300 border-t-fuchsia-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 font-medium">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6 max-w-md mx-auto px-6">
            <div className="text-6xl text-gray-400 mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
            <p className="text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-fuchsia-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-fuchsia-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = product.original_price > product.discount_price 
    ? Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Toast Notification */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform ${
          showNotification ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        } ${notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="flex items-center gap-2">
            {notificationType === 'success' ? 
              <Check className="w-4 h-4" /> : 
              <span className="text-lg">⚠</span>
            }
            {notificationMessage}
          </div>
        </div>
      )}

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-fuchsia-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Products</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Image Gallery Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <div className="aspect-square w-full relative">
                  {imageLoading && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center rounded-2xl"
                      style={{
                        backgroundImage: `url(${createBlurPlaceholder(600, 600)})`,
                        backgroundSize: 'cover'
                      }}
                    >
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-fuchsia-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img
                    src={images[activeImg]?.optimized || images[activeImg]}
                    alt={product.title}
                    loading="eager"
                    className="w-full h-full object-contain p-4 transition-opacity duration-200"
                    style={{ opacity: imageLoading ? 0 : 1 }}
                    onLoad={() => setImageLoading(false)}
                    onLoadStart={() => setImageLoading(true)}
                  />
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discountPercentage > 0 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{discountPercentage}%
                    </span>
                  )}
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    New
                  </span>
                </div>

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {activeImg + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImg === idx
                          ? "border-fuchsia-500 ring-2 ring-fuchsia-100"
                          : "border-gray-200 hover:border-fuchsia-300"
                      }`}
                    >
                      <img
                        src={img.thumbnail || img.optimized || img}
                        alt={`View ${idx + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-opacity duration-200"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="space-y-6">
              
              {/* Product Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                  <span className="text-sm text-gray-500">SKU: {String(product.id).slice(0, 8)}</span>
                </div>
                
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {product.title}
                </h1>
                
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
  <div className="flex items-center gap-4 mb-2">
    <span className="text-3xl font-bold text-green-600">
      ₹{(product.discount_price + SHIPPING_CHARGE).toLocaleString()}
    </span>
    {discountPercentage > 0 && (
      <span className="text-xl text-gray-500 line-through">
        ₹{(product.original_price + SHIPPING_CHARGE).toLocaleString()}
      </span>
    )}
  </div>
  <div className="text-sm text-gray-600">
    <span className="font-semibold">₹{product.discount_price.toLocaleString()}</span> + <span className="font-semibold">₹{SHIPPING_CHARGE}</span> shipping
  </div>
  {discountPercentage > 0 && (
    <p className="text-green-600 font-medium">
      You save ₹{(product.original_price - product.discount_price).toLocaleString()}!
    </p>
  )}
</div>

              {/* Product Info */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Fabric</span>
                    <span className="font-medium text-gray-900">{product.fabric}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Stock</span>
                    <span className="font-medium text-green-600">{product.quantity} available</span>
                  </div>
                </div>
              </div>

              {/* Product Description Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Product Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* ✅ Updated Quantity Selector */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    <span className="px-6 py-3 text-lg font-medium border-x border-gray-300 bg-gray-50 text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= product.quantity}
                      className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.quantity} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={addToCart}
                  disabled={addedToCart || product.quantity === 0}
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Cart!
                    </>
                  ) : product.quantity === 0 ? (
                    'Out of Stock'
                  ) : (
                    `Add ${quantity > 1 ? `${quantity} Items` : ''} to Cart`
                  )}
                </button>
                {/* 🚀 Buy Now Button */}
  <button
    onClick={() => {
      const buyNowItem = {
        id: product.id,
        title: product.title,
        hero_image_url: images[0]?.optimized || product.hero_image_url,
        original_price: product.original_price,
        discount_price: product.discount_price,
        quantity: quantity,
        fabric: product.fabric,
        category: product.category,
        availableQuantity: product.quantity,
      };
      localStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
      navigate("/payment"); // ✅ Redirect to payment page
    }}
    disabled={product.quantity === 0}
    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
  >
    Buy Now
  </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
              <button
                onClick={toggleWishlist}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                  isWishlisted
                    ? "bg-pink-100 text-pink-600"
                    : "bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                }`}
              >
                <Heart
                  size={20}
                  className={isWishlisted ? "fill-pink-600 text-pink-600" : "text-gray-400"}
                  fill={isWishlisted ? "#ec4899" : "none"}
                />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>

              {/* Features */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Why Choose Us</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Affordable Prices</div>
                      <div className="text-sm text-gray-600">Quality service at the best rates</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Quality Assured</div>
                      <div className="text-sm text-gray-600">Premium quality guarantee</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Secure Payment</div>
                      <div className="text-sm text-gray-600">100% secure transactions</div>
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
};

export default Product;