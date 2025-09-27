import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ArrowRight, Search, Filter, Grid, List, ArrowLeft } from "lucide-react";
import { optimizeImage, createBlurPlaceholder, getThumbnail, getUltraFastThumbnail } from "../utils/imageOptimizer";
import { simplePerformanceTracker } from "../utils/simplePerformanceTracker";

const ViewAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const PRODUCTS_PER_PAGE = 24;
  const navigate = useNavigate();
  
  const { trackImageLoad, trackApiCall, trackImageError } = simplePerformanceTracker;

  // Categories for filtering
  const categories = [
    "All",
    "Mangalagiri",
    "Kanchi", 
    "Banarasi",
    "Mysore Silk",
    "Designer"
  ];

  useEffect(() => {
    fetchAllProducts();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy, currentPage]);

  async function fetchAllProducts() {
    try {
      const startTime = Date.now();
      
      const { data, error, count } = await supabase
        .from("products")
        .select("id, title, hero_image_url, discount_price, original_price, fabric, category, description", { count: 'exact' })
        .order("created_at", { ascending: false });
      
      const responseTime = Date.now() - startTime;
      trackApiCall('all-products', responseTime);
      
      if (!error && data) {
        setProducts(data);
        setTotalPages(Math.ceil(data.length / PRODUCTS_PER_PAGE));
        console.log(`✅ All products loaded in ${responseTime}ms`);
      } else {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      trackApiCall('all-products-error', Date.now() - startTime);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortProducts() {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.fabric.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(product =>
        product.category === selectedCategory
      );
    }

    // Sort products
    switch (sortBy) {
      case "newest":
        // Already sorted by created_at desc from the query
        break;
      case "price-low":
        filtered.sort((a, b) => a.discount_price - b.discount_price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.discount_price - a.discount_price);
        break;
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    // Paginate
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const paginatedProducts = filtered.slice(startIndex, endIndex);
    
    setFilteredProducts(paginatedProducts);
    setTotalPages(Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(12)].map((_, idx) => (
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Navigation */}
          <div className="mb-6">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-fuchsia-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>
          </div>

          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-4">
              All Products
            </h1>
            <p className="text-gray-600 text-lg">
              Explore our complete collection of premium sarees
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              {/* Search Bar */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, categories, fabrics..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all"
                >
                  {categories.map(category => (
                    <option key={category} value={category === "All" ? "" : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
                {searchTerm && ` for "${searchTerm}"`}
                {selectedCategory && selectedCategory !== "All" && ` in ${selectedCategory}`}
              </p>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid" ? "bg-fuchsia-100 text-fuchsia-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list" ? "bg-fuchsia-100 text-fuchsia-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🔍</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">No products found</h3>
              <p className="text-gray-600 text-base sm:text-lg">
                {searchTerm || selectedCategory ? "Try adjusting your search or filters" : "Check back later for new arrivals!"}
              </p>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 sm:gap-6 mb-8 ${
                viewMode === "grid" 
                  ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1 lg:grid-cols-2"
              }`}>
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product.id)}
                    className={`group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden ${
                      isMobile ? '' : 'hover:shadow-2xl hover:-translate-y-2'
                    } transition-all duration-500 cursor-pointer ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
                      {/* Blur placeholder while image loads */}
                      {imageLoadingStates[`product-${product.id}`] !== false && (
                        <div 
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${createBlurPlaceholder(200, 200)})`,
                            backgroundSize: 'cover',
                            filter: 'blur(8px)',
                            zIndex: 1
                          }}
                        />
                      )}
                      <img
                        src={getUltraFastThumbnail(product.hero_image_url)}
                        alt={product.title}
                        loading="lazy"
                        width="400"
                        height="320"
                        className={`w-full ${viewMode === "list" ? "h-48" : "h-48 sm:h-64"} object-cover transition-all duration-${isMobile ? '300' : '700'} ${isMobile ? '' : 'group-hover:scale-110'} ${imageLoadingStates[`product-${product.id}`] === false ? 'opacity-100' : 'opacity-0'}`}
                        style={{
                          zIndex: 2,
                          position: 'relative'
                        }}
                        onLoad={() => {
                          setImageLoadingStates(prev => ({
                            ...prev,
                            [`product-${product.id}`]: false
                          }));
                          trackImageLoad(product.hero_image_url);
                        }}
                        onLoadStart={() => {
                          setImageLoadingStates(prev => ({
                            ...prev,
                            [`product-${product.id}`]: true
                          }));
                        }}
                        onError={(e) => {
                          e.target.src = "Designer.jpg";
                          trackImageError(product.hero_image_url);
                          setImageLoadingStates(prev => ({
                            ...prev,
                            [`product-${product.id}`]: false
                          }));
                        }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent ${isMobile ? '' : 'group-hover:from-black/40'} transition-all duration-300`} style={{zIndex: 3}}></div>
                      
                      {/* Badges */}
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-2" style={{zIndex: 4}}>
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          New
                        </span>
                        {product.original_price > product.discount_price && (
                          <span className={`bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg ${isMobile ? '' : 'animate-pulse'}`}>
                            {Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`p-3 sm:p-5 space-y-2 sm:space-y-3 ${viewMode === "list" ? "flex-1" : ""}`}>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-fuchsia-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ViewAllProducts;