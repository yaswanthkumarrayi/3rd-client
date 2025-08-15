import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ArrowRight, Star, Sparkles, Heart, ShoppingBag, Truck, Shield, Award } from "lucide-react";

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
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and secure shipping"
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
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

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

  const handleExploreCollection = () => {
    document.getElementById('featured-collection').scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden pt-20">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 pt-16 pb-20 lg:py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-r from-fuchsia-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-fuchsia-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Hero Content */}
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="space-y-4 lg:space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-fuchsia-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-fuchsia-500 animate-spin" style={{animationDuration: '3s'}} />
                  <span className="text-fuchsia-600 font-semibold text-xs lg:text-sm">Premium Collection</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                  <span className="block opacity-0 animate-slideUp" style={{animationFillMode: 'forwards'}}>
                    Timeless
                  </span>
                  <span className="block bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 bg-clip-text text-transparent opacity-0 animate-slideUp" 
                        style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
                    Elegance
                  </span>
                  <span className="block opacity-0 animate-slideUp" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
                    Redefined
                  </span>
                </h1>
              </div>
              
              <p className=" font-inter text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 opacity-0 animate-fadeIn" 
                 style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
                Indulge in the artistry of timeless weaves, crafted to celebrate your elegance and make every occasion unforgettable.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 lg:gap-6 py-6 lg:py-8 opacity-0 animate-fadeIn" 
                   style={{animationDelay: '0.8s', animationFillMode: 'forwards'}}>
                {stats.map((stat, idx) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={stat.label} className="text-center group cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-fuchsia-500 group-hover:scale-125 transition-all duration-300" />
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-all duration-300">
                          {stat.value}
                        </div>
                        <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={handleExploreCollection}
                className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-8 lg:px-10 py-3 lg:py-4 rounded-2xl font-semibold text-base lg:text-lg hover:from-fuchsia-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 opacity-0 animate-fadeIn group"
                style={{animationDelay: '1s', animationFillMode: 'forwards'}}
              >
                Explore Collection 
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Hero Image */}
            {featuredProduct && (
              <div className="relative group cursor-pointer opacity-0 animate-fadeInRight order-first lg:order-last" 
                   style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}
                   onClick={() => handleProductClick(featuredProduct.id)}>
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-400 to-pink-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-700 transform group-hover:scale-110 animate-pulse"></div>
                <div className="relative transform transition-all duration-700 group-hover:scale-105">
                  <img
                    src={featuredProduct.hero_image_url}
                    alt={featuredProduct.title}
                    className="w-full h-64 sm:h-80 lg:h-[500px] xl:h-[600px] object-cover rounded-3xl shadow-2xl border-2 border-white/50 group-hover:shadow-3xl transition-all duration-700"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-white/95 backdrop-blur-sm text-fuchsia-700 px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-bold text-sm lg:text-lg flex items-center gap-3 shadow-2xl transform scale-95 group-hover:scale-100 transition-all duration-300">
                      <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
                      View Details 
                      <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute top-4 lg:top-6 left-4 lg:left-6 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-2xl text-xs lg:text-sm font-bold shadow-xl animate-bounce">
                    ✨ Featured
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-4 lg:bottom-6 right-4 lg:right-6 bg-white/95 backdrop-blur-sm text-gray-900 px-3 lg:px-4 py-2 rounded-xl font-bold shadow-xl text-sm lg:text-base">
                    ₹{featuredProduct.discount_price}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} 
                     className="text-center group cursor-pointer opacity-0 animate-fadeInUp hover:bg-gradient-to-br hover:from-fuchsia-50 hover:to-pink-50 p-4 lg:p-6 rounded-2xl transition-all duration-300"
                     style={{animationDelay: `${idx * 0.1}s`, animationFillMode: 'forwards'}}>
                  <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-fuchsia-100 to-pink-100 rounded-2xl mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 lg:w-8 lg:h-8 text-fuchsia-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm lg:text-lg mb-2 group-hover:text-fuchsia-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section id="featured-collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20" data-animate>
        <div className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${isVisible['featured-collection'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-fuchsia-600 via-fuchsia-800 to-pink-400 bg-clip-text text-transparent mb-4 lg:mb-6 font-heading">
            Featured Collection
          </h2>
          <p className="text-gray-600 text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto font-inter">
            Handpicked sarees that embody the perfect blend of traditional craftsmanship and contemporary elegance
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-64 lg:h-80 rounded-2xl mb-4"></div>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-4 rounded w-3/4"></div>
                  <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-4 rounded w-1/2"></div>
                  <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-6 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 lg:py-20">
            <div className="text-6xl lg:text-8xl mb-6">🛍️</div>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">No products found</h3>
            <p className="text-gray-600 text-lg">Please check back later for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {products.slice(1).map((product, index) => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product.id)}
                className={`group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.03] ${isVisible['featured-collection'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{
                  transitionDelay: isVisible['featured-collection'] ? `${index * 0.1}s` : '0s'
                }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.hero_image_url}
                    alt={product.title}
                    className="w-full h-48 sm:h-64 lg:h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>
                  
                  {/* New Tag */}
                  <div className="absolute top-3 lg:top-4 left-3 lg:left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-bold shadow-lg animate-pulse">
                    New
                  </div>
                  
                  {/* Discount Badge */}
                  {product.original_price > product.discount_price && (
                    <div className="absolute top-3 lg:top-4 right-3 lg:right-4 bg-red-500 text-white px-2 lg:px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)}% OFF
                    </div>
                  )}

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-white/90 backdrop-blur-sm text-fuchsia-600 px-4 lg:px-6 py-2 lg:py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300 text-sm lg:text-base">
                      <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
                      Quick View
                    </div>
                  </div>
                </div>
                
                <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
                  <h3 className="text-base lg:text-lg font-bold text-gray-900 group-hover:text-fuchsia-600 transition-colors duration-300 line-clamp-2 leading-tight">
                    {product.title}
                  </h3>
                  
                  <div className="flex justify-between items-start text-sm">
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
                      <div className="flex items-center gap-2 lg:gap-3">
                        <span className="text-lg lg:text-xl font-bold text-green-600">₹{product.discount_price}</span>
                        {product.original_price > product.discount_price && (
                          <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>
                        )}
                      </div>
                      {product.original_price > product.discount_price && (
                        <div className="text-xs text-green-600 font-medium">
                          Save ₹{product.original_price - product.discount_price}
                        </div>
                      )}
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-3">
                      <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-fuchsia-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

{/* Testimonials */}
<section className="bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 py-16 lg:py-24" data-animate>
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Heading */}
    <div className="text-center mb-12 lg:mb-16">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-4 lg:mb-6 font-heading">
        What Our Customers Say
      </h2>
      <p className="text-gray-600 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
        Real stories from real customers who love Ashok Kumar Textiles
      </p>
    </div>

    {/* Testimonials Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 lg:mb-16">
      {testimonials.map((t, idx) => (
        <div
          key={idx}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 lg:p-8 border border-white/50 hover:shadow-2xl transition-all duration-500 group hover:bg-white opacity-100 translate-y-0"
          style={{ transitionDelay: `${idx * 0.2}s` }}
        >
          <div className="flex items-start gap-4 lg:gap-6 mb-6">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold text-lg lg:text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                {t.initial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-lg lg:text-xl">{t.name}</div>
              <div className="text-gray-500 text-sm lg:text-base">{t.location}</div>
              <div className="flex items-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 lg:w-5 lg:h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>
          </div>

          <blockquote className="text-gray-700 italic mb-6 leading-relaxed text-base lg:text-lg">
            "{t.quote}"
          </blockquote>

          <div className="text-sm text-fuchsia-600 font-semibold bg-fuchsia-50 px-4 py-2 rounded-full inline-block border border-fuchsia-200">
            Purchased: {t.purchased}
          </div>
        </div>
      ))}
    </div>

    {/* Additional Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
      {[
        { value: "4.7", label: "Average Rating" },
        { value: "98%", label: "Satisfaction Rate" },
        { value: "100k+", label: "Instagram Followers" },
        { value: "100%", label: "Quality Assured" }
      ].map((stat, idx) => (
        <div
          key={stat.label}
          className="bg-white/90 backdrop-blur-sm rounded-2xl py-6 lg:py-8 px-4 lg:px-6 text-center border border-white/50 shadow-lg hover:shadow-xl transition-all duration-500 group cursor-pointer opacity-100 translate-y-0"
          style={{ transitionDelay: `${idx * 0.1 + 0.8}s` }}
        >
          <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
            {stat.value}
          </div>
          <div className="text-gray-600 font-semibold text-sm lg:text-base">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      <Footer />

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 1s ease-out forwards;
        }

        .animate-fadeInRight {
          animation: fadeInRight 1s ease-out forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Home;