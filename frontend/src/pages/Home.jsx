import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FastImage from "../components/FastImage";
import { ArrowRight, Star, Sparkles, Heart, ShoppingBag, DollarSign, Shield, Award } from "lucide-react";
import { optimizeImage, createBlurPlaceholder, preloadImages, BLUR_PLACEHOLDER_STYLE, LOADED_IMAGE_STYLE, getThumbnail, getUltraFastThumbnail } from "../utils/imageOptimizer";
import { simplePerformanceTracker } from "../utils/simplePerformanceTracker";

const testimonials = [
  {
    quote: "The recent lehanga which I have purchased from you is excellent.. quality and fitting of blouse and lehanga is top notch. Thank you for maintaining such good quality and fast delivery service.",
    purchased: "Paithani Lehanga",
    name: "Komali",
    location: "Hyderabad, Telangana",
    initial: "K"
  },
  {
    quote: "Bought latest trending space silk saree from your page .. wore it for a wedding. Got many compliments from everyone. Thank you ",
    purchased: "Space silk saree with Jarkhan work",
    name: "Swetha",
    location: "Nellore, Andhra Pradesh",
    initial: "S"
  },
  {
    quote: "Absolutely in love with the saree I ordered! The fabric quality is top-notch, and it looked exactly like the pictures. Ashok kumar Textiles has become my go-to for festive shopping!",
    purchased: "Benarasi Saree",
    name: "Priya",
    location: "Hanumakonda, Telangana",
    initial: "P"
  },
  {
    quote: "Was worried about online saree shopping, but Ashok Kumar Textiles made it so easy. The frock fitting is perfect and delivery was on time. Highly recommended. Customer service was very responsive too!!",
    purchased: "Mul Mul Cotton Saree",
    name: "Anilisha",
    location: "Chennai, Tamil Nadu",
    initial: "A"
  }
];

const stats = [
  { label: "Unique Designs", value: "500+", icon: Sparkles },
  { label: "Happy Customers", value: "1000+", icon: Heart },
  { label: "Instagram Followers", value: "100K+", icon: Award }
];

const features = [
  {
    icon: ShoppingBag,
    title: "Premium Quality",
    description: "Handpicked fabrics and materials"
  },
  {
    icon: DollarSign,
    title: "Affordable Prices",
    description: "Quality service at the best rates"
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "100% satisfaction guarantee"
  },
  {
    icon: Award,
    title: "Authentic Designs",
    description: "Traditional meets modern"
  }
];

const categories = [
  {
    name: "Mangalagiri",
    image: "mangalagiri.jpg",
    description: "Traditional handwoven cotton sarees"
  },
  {
    name: "Kanchi",
    image: "kanchi.jpg",
    description: "Elegant silk sarees from Kanchipuram"
  },
  {
    name: "Banarasi",
    image: "banarasi.jpg",
    description: "Luxurious Banarasi silk sarees"
  },
  {
    name: "Mysore Silk",
    image: "mysore.jpg",
    description: "Pure Mysore silk collection"
  },
  {
    name: "Designer",
    image: "Designer.jpg",
    description: "Contemporary designer sarees"
  }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [heroProduct, setHeroProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const PRODUCTS_PER_PAGE = 6; // Show only 6 featured products on home page
  const navigate = useNavigate();
  
  // ✅ Simple performance monitoring
  const { trackImageLoad, trackApiCall, trackImageError } = simplePerformanceTracker;

  useEffect(() => {
    // ✅ Combined fetch for better performance
    fetchAllProducts();
    
    // Check if device is mobile for performance optimizations
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Intersection Observer with mobile-optimized settings
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { 
        threshold: isMobile ? 0.05 : 0.1, 
        rootMargin: isMobile ? '20px' : '50px' 
      }
    );

    // Observe sections
    const sections = ['hero', 'features', 'products', 'categories', 'testimonials'];
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  // ✅ OPTIMIZED: Fetch only 7 products for home page (1 hero + 6 featured)
  async function fetchAllProducts() {
    try {
      const startTime = Date.now();
      
      // Get exactly 7 unique products in one optimized query
      const { data, error } = await supabase
        .from("products")
        .select("id, title, hero_image_url, discount_price, original_price, fabric, category")
        .order("created_at", { ascending: false })
        .limit(7); // Get 7 products total (1 hero + 6 for featured grid)
      
      const responseTime = Date.now() - startTime;
      trackApiCall('products-home', responseTime);
      
      if (!error && data && data.length > 0) {
        // Remove duplicates by ID (just in case)
        const uniqueProducts = data.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );
        
        // First product for hero
        setHeroProduct(uniqueProducts[0]);
        
        // Rest for featured grid (max 6 products)
        setProducts(uniqueProducts.slice(1, 7));
        
        // Preload critical thumbnail images (first 3 only)
        const criticalImages = uniqueProducts.slice(0, 3).map(p => p.hero_image_url);
        preloadImages(criticalImages, 'thumbnail');
        preloadImages(criticalImages, 'thumbnail');
        
        console.log(`✅ Products loaded in ${responseTime}ms - Hero: 1, Featured: ${uniqueProducts.length - 1}`);
      } else {
        // No products found - don't show any hero product or fallback
        setHeroProduct(null);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      trackApiCall('products-home-error', Date.now() - startTime);
      // No products available - don't show fallback
      setHeroProduct(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  const handleExploreCollection = () => {
    document.getElementById('featured-collection')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section 
        id="hero"
        className={`relative bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 pt-20 sm:pt-24 pb-12 sm:pb-16 transition-all duration-${isMobile ? '300' : '1000'} ${
          isVisible.hero ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/5 to-pink-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Hero Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-fuchsia-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <Sparkles className={`w-4 h-4 text-fuchsia-500 ${isMobile ? '' : 'animate-pulse'}`} />
                  <span className="text-fuchsia-600 font-medium text-sm">Premium Collection</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="block animate-fade-in-up font-heading">CLASSIC</span>
                  <span className="block bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up font-heading">
                    MEETS
                  </span>
                  <span className="block animate-fade-in-up font-heading">ELEGANCE</span>
                </h1>
              </div>
              
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up font-inter">
                Indulge in the artistry of timeless weaves, crafted to celebrate your elegance and make every occasion unforgettable.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 py-6 sm:py-8">
                {stats.map((stat, idx) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={stat.label} className="text-center animate-fade-in-up">
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-fuchsia-100 to-pink-100 rounded-full flex items-center justify-center mb-2 ${isMobile ? '' : 'hover:scale-110'} transition-transform duration-300`}>
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-500" />
                        </div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                        <div className="text-gray-600 font-medium text-xs sm:text-sm font-inter">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={handleExploreCollection}
                className={`w-full sm:w-auto bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-fuchsia-700 hover:to-pink-700 ${isMobile ? '' : 'hover:scale-105'} transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl animate-fade-in-up`}
              >
                Explore Collection 
                <ArrowRight className={`w-5 h-5 ${isMobile ? '' : 'group-hover:translate-x-1'} transition-transform duration-300`} />
              </button>
            </div>

            {/* Hero Image - Using latest product from database with optimization */}
            {heroProduct ? (
              <div className="relative group cursor-pointer order-first lg:order-last animate-fade-in-up"
                   onClick={() => handleProductClick(heroProduct.id)}>
                <div className="relative">
                  <FastImage
                    src={heroProduct.hero_image_url}
                    alt={heroProduct.title}
                    size="hero"
                    className={`w-full h-64 sm:h-80 lg:h-[500px] object-cover rounded-2xl shadow-xl border border-gray-200 transition-all duration-${isMobile ? '300' : '500'} ${isMobile ? '' : 'group-hover:shadow-2xl group-hover:scale-[1.02]'}`}
                    priority={true}
                    showLoader={true}
                    fallback="/banarasi.jpg"
                    width="800"
                    height="500"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-transparent" style={{zIndex: 3}}></div>
                  
                  {/* Featured Badge */}
                  <div className={`absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-lg ${isMobile ? '' : 'animate-bounce'}`} style={{zIndex: 4}}>
                    ✨ Latest
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-white/95 backdrop-blur-sm text-gray-900 px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-bold shadow-lg text-sm sm:text-base" style={{zIndex: 4}}>
                    ₹{heroProduct.discount_price}
                  </div>
                </div>
              </div>
            ) : (
              // No hero product available - show placeholder or empty space
              <div className="relative order-first lg:order-last animate-fade-in-up">
                <div className="w-full h-64 sm:h-80 lg:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center p-8">
                    <div className="text-4xl sm:text-6xl mb-4">📦</div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-2">No Featured Product</h3>
                    <p className="text-gray-500 text-sm sm:text-base">Upload products to showcase here</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features"
        className={`py-12 sm:py-16 bg-white transition-all duration-${isMobile ? '300' : '1000'} ${
          isVisible.features ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className={`text-center group ${isMobile ? '' : 'hover:bg-gradient-to-br hover:from-fuchsia-50 hover:to-pink-50'} p-4 sm:p-6 rounded-xl transition-all duration-500 ${isMobile ? '' : 'hover:shadow-lg hover:-translate-y-2'} animate-fade-in-up`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-fuchsia-100 to-pink-100 rounded-xl mb-3 sm:mb-4 ${isMobile ? '' : 'group-hover:from-fuchsia-200 group-hover:to-pink-200 group-hover:scale-110'} transition-all duration-300`}>
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-fuchsia-600" />
                  </div>
                  <h3 className={`font-bold text-gray-900 text-sm sm:text-lg mb-1 sm:mb-2 ${isMobile ? '' : 'group-hover:text-fuchsia-600'} transition-colors duration-300`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section 
        id="products"
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 transition-all duration-${isMobile ? '300' : '1000'} ${
          isVisible.products ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}
      >
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 font-heading">
            FEATURED COLLECTION
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto font-inter">
            Handpicked sarees that embody the perfect blend of traditional craftsmanship and contemporary elegance
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="bg-gray-200 h-48 sm:h-64 rounded-xl mb-4"></div>
                <div className="space-y-3">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  <div className="bg-gray-200 h-6 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🛍️</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">No products found</h3>
            <p className="text-gray-600 text-base sm:text-lg">Please check back later for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" id="featured-collection">
            {products.map((product, idx) => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product.id)}
                className={`group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden ${isMobile ? '' : 'hover:shadow-2xl hover:-translate-y-2'} transition-all duration-500 cursor-pointer animate-fade-in-up`}
              >
                <div className="relative overflow-hidden">
                  <FastImage
                    src={product.hero_image_url}
                    alt={product.title}
                    size="thumbnail"
                    className={`w-full h-48 sm:h-64 object-cover transition-all duration-${isMobile ? '300' : '700'} ${isMobile ? '' : 'group-hover:scale-110'}`}
                    showLoader={true}
                    priority={idx < 3}
                    fallback="/Designer.jpg"
                    width="400"
                    height="320"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent ${isMobile ? '' : 'group-hover:from-black/40'} transition-all duration-300`} style={{zIndex: 3}}></div>
                  
                  {/* New Tag */}
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-lg" style={{zIndex: 4}}>
                    New
                  </div>
                  
                  {/* Discount Badge */}
                  {product.original_price > product.discount_price && (
                    <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg ${isMobile ? '' : 'animate-pulse'}`} style={{zIndex: 4}}>
                      {Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)}% OFF
                    </div>
                  )}

                  {/* Quick View Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center ${isMobile ? '' : 'opacity-0 group-hover:opacity-100'} transition-all duration-300`} style={{zIndex: 5}}>
                    <div className={`bg-white/95 backdrop-blur-sm text-fuchsia-600 px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg ${isMobile ? '' : 'transform scale-90 group-hover:scale-100'} transition-transform duration-300`}>
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">Quick View</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                  <h3 className={`text-sm sm:text-lg font-bold text-gray-900 ${isMobile ? '' : 'group-hover:text-fuchsia-600'} transition-colors duration-300 line-clamp-2`}>
                    {product.title}
                  </h3>
                  
                  <div className="flex justify-between items-start text-xs sm:text-sm">
                    <div className="space-y-1 flex-1">
                      <div className="text-gray-500">
                        <span className="font-medium text-gray-700">Fabric:</span> {product.fabric}
                      </div>
                      <div className="text-gray-500 hidden sm:block">
                        <span className="font-medium text-gray-700">Category:</span> {product.category}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-sm sm:text-xl font-bold text-green-600">₹{product.discount_price}</span>
                        {product.original_price > product.discount_price && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">₹{product.original_price}</span>
                        )}
                      </div>
                      {product.original_price > product.discount_price && (
                        <div className="text-xs text-green-600 font-medium">
                          Save ₹{product.original_price - product.discount_price}
                        </div>
                      )}
                    </div>
                    
                    <div className={`${isMobile ? '' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'} transition-all duration-300`}>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Products Button */}
        {!loading && products.length > 0 && (
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={handleViewAllProducts}
              className={`bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-fuchsia-700 hover:to-pink-700 ${isMobile ? '' : 'hover:scale-105'} transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mx-auto`}
            >
              View All Products
              <ArrowRight className={`w-5 h-5 ${isMobile ? '' : 'group-hover:translate-x-1'} transition-transform duration-300`} />
            </button>
          </div>
        )}
      </section>

      {/* Search by Categories Section */}
      <section 
        id="categories"
        className={`py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-fuchsia-50/30 transition-all duration-${isMobile ? '300' : '1000'} ${
          isVisible.categories ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 font-heading">
              SEARCH BY CATEGORIES
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-inter">
              Explore our diverse collection of traditional and contemporary sarees
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {categories.map((category, idx) => (
              <div
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`group cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${isMobile ? '' : 'hover:shadow-2xl hover:-translate-y-3'} transition-all duration-500 animate-fade-in-up`}
              >
                <div className="relative overflow-hidden h-40 sm:h-48 bg-gray-50">
                  <img
                    src={getUltraFastThumbnail(category.image)}
                    alt={category.name}
                    loading="lazy"
                    width="300"
                    height="200"
                    className={`w-full h-full object-cover ${isMobile ? '' : 'group-hover:scale-110'} transition-transform duration-${isMobile ? '300' : '700'}`}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent ${isMobile ? '' : 'group-hover:from-black/70'} transition-all duration-300`}></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm text-fuchsia-600 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    New
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center ${isMobile ? '' : 'opacity-0 group-hover:opacity-100'} transition-all duration-300`}>
                    <div className={`bg-white/95 backdrop-blur-sm text-fuchsia-600 px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg ${isMobile ? '' : 'transform scale-90 group-hover:scale-100'} transition-transform duration-300`}>
                      <span className="text-sm">Explore</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4 text-center">
                  <h3 className={`text-sm sm:text-lg font-bold text-gray-900 ${isMobile ? '' : 'group-hover:text-fuchsia-600'} transition-colors duration-300 mb-1 sm:mb-2`}>
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section 
        id="testimonials"
        className={`bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 py-12 sm:py-16 transition-all duration-${isMobile ? '300' : '1000'} ${
          isVisible.testimonials ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 font-heading">
              WHAT OUR CUSTOMERS SAY
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-inter">
              Real stories from real customers who love Ashok Kumar Textiles
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 ${isMobile ? '' : 'hover:shadow-xl hover:bg-white/90 hover:-translate-y-2'} transition-all duration-500 animate-fade-in-up`}
              >
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold text-base sm:text-lg shadow-lg">
                      {t.initial}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-base sm:text-lg">{t.name}</div>
                    <div className="text-gray-500 text-xs sm:text-sm">{t.location}</div>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <blockquote className="text-gray-700 italic mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  "{t.quote}"
                </blockquote>

                <div className="text-xs sm:text-sm text-fuchsia-600 font-semibold bg-fuchsia-50 px-3 sm:px-4 py-2 rounded-full inline-block border border-fuchsia-200">
                  Purchased: {t.purchased}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { value: "4.7", label: "Average Rating" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "100k+", label: "Instagram Followers" },
              { value: "100%", label: "Quality Assured" }
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`bg-white/80 backdrop-blur-sm rounded-xl py-4 sm:py-6 px-3 sm:px-4 text-center border border-white/20 shadow-md ${isMobile ? '' : 'hover:shadow-lg hover:bg-white/90 hover:-translate-y-2'} transition-all duration-500 animate-fade-in-up`}
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-semibold text-xs sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />

    </div>
  );
};

export default Home;