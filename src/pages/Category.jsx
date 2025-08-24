import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Sparkles, ArrowRight, Filter, Grid, List, Search, ShoppingBag, Star, Heart, Eye } from "lucide-react";

const Category = () => {
  const { name } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [name]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", name)
        .order("created_at", { ascending: false });
      
      if (!error) {
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.fabric.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.discount_price - b.discount_price;
        case "price-high":
          return b.discount_price - a.discount_price;
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const ProductCard = ({ product }) => {
    const isSoldOut = product.quantity === 0;
    
    return (
      <div 
        onClick={() => handleProductClick(product.id)}
        className="relative group cursor-pointer"
      >
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
          <img
            src={product.hero_image_url}
            alt={product.title}
            className="h-full w-full object-cover object-center group-hover:opacity-75"
          />
          {isSoldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                Sold Out
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm text-gray-700">{product.title}</h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-lg font-medium text-gray-900">₹{product.discount_price}</p>
            {product.original_price > product.discount_price && (
              <p className="text-sm text-gray-500 line-through">₹{product.original_price}</p>
            )}
          </div>
          {!isSoldOut && product.quantity <= 5 && (
            <p className="text-sm text-red-600 mt-1">
              Only {product.quantity} left!
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 pt-24 pb-12">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
          }`}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-fuchsia-200 shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-fuchsia-500" />
              <span className="text-fuchsia-600 font-medium text-sm">Premium Collection</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-4 font-heading">
              {name} Sarees
            </h1>
            
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-inter">
              Discover our exquisite collection of {name.toLowerCase()} sarees, crafted with precision and designed for elegance
            </p>

            {/* Stats */}
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-fuchsia-500" />
                <span>{products.length} Products</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Customer Favorite</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-8">
            {/* Loading Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-fuchsia-50 px-6 py-3 rounded-full">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-fuchsia-600 border-t-transparent"></div>
                <span className="text-fuchsia-600 font-medium">Loading amazing products...</span>
              </div>
            </div>

            {/* Loading Grid */}
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
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
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {searchTerm ? "No products match your search" : "No products found"}
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              {searchTerm 
                ? `Try adjusting your search term "${searchTerm}"` 
                : `No products available in ${name} category at the moment.`
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-fuchsia-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-fuchsia-700 transition-colors duration-200"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products found
                {searchTerm && (
                  <span className="ml-2">
                    for "<span className="font-medium text-fuchsia-600">{searchTerm}</span>"
                  </span>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 max-w-4xl mx-auto"
            }`}>
              {filteredProducts.map((product, idx) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className={`group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer animate-fade-in-up animation-delay-${idx * 100} ${
                    viewMode === "list" ? "flex gap-6" : ""
                  }`}
                >
                  <div className={`relative overflow-hidden ${
                    viewMode === "list" ? "w-64 flex-shrink-0" : ""
                  }`}>
                    <img
                      src={product.hero_image_url}
                      alt={product.title}
                      className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                        viewMode === "list" ? "w-full h-48" : "w-full h-64"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        New
                      </div>
                      {product.original_price > product.discount_price && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                          {Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
                      <div className="bg-white/95 backdrop-blur-sm text-fuchsia-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Eye className="w-4 h-4" />
                        Quick View
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-5 space-y-3 ${viewMode === "list" ? "flex-1" : ""}`}>
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
          </div>
        )}
      </main>

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
        
        .animation-delay-0 {
          animation-delay: 0s;
          opacity: 0;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
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
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
        
        .animation-delay-700 {
          animation-delay: 0.7s;
          opacity: 0;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
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
      `}</style>
    </div>
  );
};
export default Category;