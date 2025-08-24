import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ArrowRight, Star, Sparkles, Heart, ShoppingBag, DollarSign, Shield, Award, Check } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    
    // Intersection Observer for scroll animations
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
      { threshold: 0.1, rootMargin: '50px' }
    );

    // Observe sections
    const sections = ['hero', 'features', 'products', 'categories', 'testimonials'];
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  const featuredProduct = products[0];

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  const handleExploreCollection = () => {
    document.getElementById('featured-collection').scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section 
        id="hero"
        className={`relative bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 pt-20 sm:pt-24 pb-12 sm:pb-16 transition-all duration-1000 ${
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
                  <Sparkles className="w-4 h-4 text-fuchsia-500 animate-pulse" />
                  <span className="text-fuchsia-600 font-medium text-sm">Premium Collection</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="block animate-fade-in-up font-heading">Classic</span>
                  <span className="block bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up animation-delay-200 font-heading">
                    Meets
                  </span>
                  <span className="block animate-fade-in-up animation-delay-400 font-heading">Elegance</span>
                </h1>
              </div>
              
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-600 font-inter">
                Indulge in the artistry of timeless weaves, crafted to celebrate your elegance and make every occasion unforgettable.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 py-6 sm:py-8">
                {stats.map((stat, idx) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={stat.label} className={`text-center animate-fade-in-up animation-delay-${800 + idx * 200}`}>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-fuchsia-100 to-pink-100 rounded-full flex items-center justify-center mb-2 hover:scale-110 transition-transform duration-300">
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
                className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-fuchsia-700 hover:to-pink-700 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl animate-fade-in-up animation-delay-1000"
              >
                Explore Collection 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Hero Image */}
            {featuredProduct && (
              <div className={`relative group cursor-pointer order-first lg:order-last animate-fade-in-up animation-delay-600`}
                   onClick={() => handleProductClick(featuredProduct.id)}>
                <div className="relative">
                  <img
                    src={featuredProduct.hero_image_url}
                    alt={featuredProduct.title}
                    className="w-full h-64 sm:h-80 lg:h-[500px] object-cover rounded-2xl shadow-xl border border-gray-200 group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-500"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
                    <div className="bg-white/95 backdrop-blur-sm text-fuchsia-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-300">
                      <Sparkles className="w-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">View Details</span>
                      <ArrowRight className="w-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-lg animate-bounce">
                    ✨ Featured
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-white/95 backdrop-blur-sm text-gray-900 px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-bold shadow-lg text-sm sm:text-base">
                    ₹{featuredProduct.discount_price}
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
        className={`py-12 sm:py-16 bg-white transition-all duration-1000 ${
          isVisible.features ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className={`text-center group hover:bg-gradient-to-br hover:from-fuchsia-50 hover:to-pink-50 p-4 sm:p-6 rounded-xl transition-all duration-500 hover:shadow-lg hover:-translate-y-2 animate-fade-in-up animation-delay-${200 + idx * 100}`}>
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-fuchsia-100 to-pink-100 rounded-xl mb-3 sm:mb-4 group-hover:from-fuchsia-200 group-hover:to-pink-200 group-hover:scale-110 transition-all duration-300">
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-fuchsia-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-lg mb-1 sm:mb-2 group-hover:text-fuchsia-600 transition-colors duration-300">
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
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 transition-all duration-1000 ${
          isVisible.products ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}
      >
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 font-heading">
            Featured Collection
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto font-inter">
            Handpicked sarees that embody the perfect blend of traditional craftsmanship and contemporary elegance
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, idx) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" id="featured-collection">
            {products.slice(1).map((product, idx) => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product.id)}
                className={`group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer animate-fade-in-up animation-delay-${100 + idx * 50}`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.hero_image_url}
                    alt={product.title}
                    className="w-full h-82 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300"></div>
                  
                  {/* New Tag */}
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    New
                  </div>
                  
                  {/* Discount Badge */}
                  {product.original_price > product.discount_price && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      {Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)}% OFF
                    </div>
                  )}

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/95 backdrop-blur-sm text-fuchsia-600 px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">Quick View</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-5 space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-fuchsia-600 transition-colors duration-300 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  <div className="flex justify-between items-start text-xs sm:text-sm">
                    <div className="space-y-1 flex-1">
                      <div className="text-gray-500">
                        <span className="font-medium text-gray-700">Fabric:</span> {product.fabric}
                      </div>
                      <div className="text-gray-500">
                        <span className="font-medium text-gray-700">Category:</span> {product.category}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-bold text-green-600">₹{product.discount_price}</span>
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
                    
                    <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      <ArrowRight className="w-5 h-5 text-fuchsia-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Search by Categories Section */}
      <section 
        id="categories"
        className={`py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-fuchsia-50/30 transition-all duration-1000 ${
          isVisible.categories ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 font-heading">
              Search by Categories
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-inter">
              Explore our diverse collection of traditional and contemporary sarees
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
  {categories.map((category, idx) => (
    <div
      key={category.name}
      onClick={() => handleCategoryClick(category.name)}
      className={`group cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 animate-fade-in-up animation-delay-${100 + idx * 100}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-92 sm:h-44 object-cover group-hover:scale-110 transition-transform duration-700"
          style={{ minHeight: 420, maxHeight: 620 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
        {/* Category Badge */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm text-fuchsia-600 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          New
        </div>
        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-sm text-fuchsia-600 px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <span className="text-sm">Explore</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4 text-center">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-fuchsia-600 transition-colors duration-300 mb-1 sm:mb-2">
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
        className={`bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 py-12 sm:py-16 transition-all duration-1000 ${
          isVisible.testimonials ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 font-heading">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-inter">
              Real stories from real customers who love Ashok Kumar Textiles
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 hover:shadow-xl hover:bg-white/90 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up animation-delay-${200 + idx * 100}`}
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

          {/* Additional Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { value: "4.7", label: "Average Rating" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "100k+", label: "Instagram Followers" },
              { value: "100%", label: "Quality Assured" }
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`bg-white/80 backdrop-blur-sm rounded-xl py-4 sm:py-6 px-3 sm:px-4 text-center border border-white/20 shadow-md hover:shadow-lg hover:bg-white/90 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up animation-delay-${400 + idx * 100}`}
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

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
          opacity: 0;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
          opacity: 0;
        }
        
        .animation-delay-50 {
          animation-delay: 0.05s;
          opacity: 0;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }
        
        .animation-delay-150 {
          animation-delay: 0.15s;
          opacity: 0;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }
        
        @media (max-width: 640px) {
          .animate-fade-in-up {
            animation-duration: 0.6s;
          }
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom gradient backgrounds */
        .gradient-bg-1 {
          background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%);
        }
        
        .gradient-bg-2 {
          background: linear-gradient(135deg, #fafafa 0%, #fdf2f8 50%, #fce7f3 100%);
        }
        
        /* Enhanced hover effects */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        /* Backdrop blur support */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        
        /* Custom pulse animation for badges */
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;