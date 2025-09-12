import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search as SearchIcon, Filter, Grid, ArrowLeft, ChevronDown } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('newest');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    fetchProducts();
  }, [query, selectedCategory]);

  async function fetchProducts() {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('products')
        .select('*');

      // Apply search filter if query exists
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,fabric.ilike.%${query}%`);
      }

      // Apply category filter if selected
      if (selectedCategory) {
        queryBuilder = queryBuilder.eq('category', selectedCategory);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.discount_price - b.discount_price;
      case 'price_high':
        return b.discount_price - a.discount_price;
      case 'name_az':
        return a.title.localeCompare(b.title);
      case 'name_za':
        return b.title.localeCompare(a.title);
      default:
        return 0; // Keep original order for 'newest'
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Search Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-fuchsia-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search for products..."
              defaultValue={query}
              onChange={(e) => {
                const newQuery = e.target.value;
                const params = new URLSearchParams(window.location.search);
                if (newQuery) {
                  params.set('q', newQuery);
                } else {
                  params.delete('q');
                }
                navigate(`/search?${params.toString()}`);
              }}
              className="w-full p-4 pl-12 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? (
              <>Search results for "{query}"</>
            ) : (
              'All Products'
            )}
          </h1>
          <p className="text-gray-600">{products.length} products found</p>
        </div>

        {/* Filters and Sort */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
            >
              <option value="">All Categories</option>
              <option value="Mangalagiri">Mangalagiri</option>
              <option value="Kanchi">Kanchi</option>
              <option value="Banarasi">Banarasi</option>
              <option value="Mysore Silk">Mysore Silk</option>
              <option value="Designer">Designer</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name_az">Name: A to Z</option>
              <option value="name_za">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-600">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
              >
                <div className="aspect-square rounded-t-xl overflow-hidden">
                  <img
                    src={product.hero_image_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-fuchsia-600 transition-colors mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-fuchsia-600">₹{product.discount_price?.toLocaleString()}</p>
                      {product.original_price > product.discount_price && (
                        <p className="text-sm text-gray-500 line-through">₹{product.original_price?.toLocaleString()}</p>
                      )}
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Search;