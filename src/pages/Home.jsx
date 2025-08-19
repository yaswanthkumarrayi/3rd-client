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
  "Mangalagiri",
  "Kanchi",
  "Banarasi",
  "Mysore Silk",
  "Designer"
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
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
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-fuchsia-50 to-pink-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-fuchsia-200 shadow-sm">
                  <Sparkles className="w-4 h-4 text-fuchsia-500" />
                  <span className="text-fuchsia-600 font-medium text-sm">Premium Collection</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="block">Timeless</span>
                  <span className="block bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                    Elegance
                  </span>
                  <span className="block">Redefined</span>
                </h1>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-inter">
                Indulge in the artistry of timeless weaves, crafted to celebrate your elegance and make every occasion unforgettable.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-8">
                {stats.map((stat, idx) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <IconComponent className="w-6 h-6 text-fuchsia-500" />
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                        <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={handleExploreCollection}
                className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-fuchsia-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                Explore Collection 
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Hero Image */}
            {featuredProduct && (
              <div className="relative group cursor-pointer order-first lg:order-last"
                   onClick={() => handleProductClick(featuredProduct.id)}>
                <div className="relative">
                  <img
                    src={featuredProduct.hero_image_url}
                    alt={featuredProduct.title}
                    className="w-full h-80 lg:h-[500px] object-cover rounded-2xl shadow-xl border border-gray-200 group-hover:shadow-2xl transition-all duration-500"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white text-fuchsia-700 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg">
                      <Sparkles className="w-5 h-5" />
                      View Details 
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
                    ✨ Featured
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg font-bold shadow-lg">
                    ₹{featuredProduct.discount_price}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="text-center group hover:bg-fuchsia-50 p-6 rounded-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-fuchsia-100 rounded-xl mb-4 group-hover:bg-fuchsia-200 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-fuchsia-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-fuchsia-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section id="featured-collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-4 font-heading">
            Featured Collection
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto font-inter">
            Handpicked sarees that embody the perfect blend of traditional craftsmanship and contemporary elegance
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
                <div className="space-y-3">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  <div className="bg-gray-200 h-6 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🛍️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No products found</h3>
            <p className="text-gray-600 text-lg">Please check back later for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.slice(1).map((product) => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product.id)}
                className="group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.hero_image_url}
                    alt={product.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  
                  {/* New Tag */}
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    New
                  </div>
                  
                  {/* Discount Badge */}
                  {product.original_price > product.discount_price && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)}% OFF
                    </div>
                  )}

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white text-fuchsia-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      Quick View
                    </div>
                  </div>
                </div>
                
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-fuchsia-600 transition-colors duration-300 line-clamp-2">
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
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-600">₹{product.discount_price}</span>
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
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
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
      <section className="my-12 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Search by Categories</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => navigate(`/category/${encodeURIComponent(cat)}`)}
              className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-medium shadow transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-fuchsia-50 to-pink-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-4 font-heading">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Real stories from real customers who love Ashok Kumar Textiles
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold text-lg">
                      {t.initial}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-lg">{t.name}</div>
                    <div className="text-gray-500 text-sm">{t.location}</div>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <blockquote className="text-gray-700 italic mb-6 leading-relaxed">
                  "{t.quote}"
                </blockquote>

                <div className="text-sm text-fuchsia-600 font-semibold bg-fuchsia-50 px-4 py-2 rounded-full inline-block border border-fuchsia-200">
                  Purchased: {t.purchased}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "4.7", label: "Average Rating" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "100k+", label: "Instagram Followers" },
              { value: "100%", label: "Quality Assured" }
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl py-6 px-4 text-center border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-semibold text-sm">
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
      `}</style>
    </div>
  );
};

export default Home;