import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";
import { Package, Calendar, CreditCard, ShoppingBag, Clock, CheckCircle, Truck, ArrowLeft, Filter, Search, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user && data.user.email) {
        fetchOrders(data.user.email);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function fetchOrders(email) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'placed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'placed':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus;
    const matchesSearch = searchTerm === '' || 
      order.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your orders</h2>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-fuchsia-700 hover:to-pink-700 transition-all duration-300"
            >
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 flex flex-col">
      <Header />
      
      <div className="flex-1 pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-fuchsia-200 mb-6">
              <div className="p-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                Your Orders
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">Track and manage your beautiful collection</p>
          </div>

          {/* Filters and Search */}
          {!loading && orders.length > 0 && (
            <div className="mb-8 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search orders or products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="all">All Orders</option>
                    <option value="placed">Placed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            /* Enhanced Loading State */
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-fuchsia-600 font-semibold text-lg">Loading your orders...</p>
              <p className="text-fuchsia-400 text-sm mt-2">Preparing your order history ✨</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* Enhanced Empty Orders State */
            <div className="text-center py-16 sm:py-24">
              <div className="max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-r from-fuchsia-100 to-pink-100 rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-200 to-pink-200 rounded-full animate-ping opacity-20"></div>
                    <Package className="w-16 h-16 text-fuchsia-400 relative z-10" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {orders.length === 0 ? "No orders yet" : "No matching orders"}
                </h3>
                <p className="text-gray-600 mb-8 text-base sm:text-lg leading-relaxed">
                  {orders.length === 0 
                    ? "Start your fashion journey with our beautiful collection!" 
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-fuchsia-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  >
                    Start Shopping
                  </button>
                  {orders.length > 0 && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                      }}
                      className="bg-white text-fuchsia-600 px-8 py-4 rounded-2xl font-semibold border border-fuchsia-200 hover:bg-fuchsia-50 transition-all duration-300"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Enhanced Orders List */
            <div className="space-y-6 sm:space-y-8">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500">
                  {/* Enhanced Order Header */}
                  <div className="bg-gradient-to-r from-fuchsia-50 via-pink-50 to-purple-50 px-6 py-5 border-b border-fuchsia-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-md">
                          <Package className="w-6 h-6 text-fuchsia-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-fuchsia-800 text-lg lg:text-xl">Order #{order.id}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-xl font-bold text-green-600">
                            <CreditCard className="w-5 h-5" />
                            <span>₹{order.total}</span>
                          </div>
                          <p className="text-sm text-gray-500">Total Amount</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Order Items */}
                  <div className="p-6 lg:p-8">
                    <h4 className="font-semibold text-gray-800 mb-6 text-sm uppercase tracking-wide flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Order Items ({order.items.length})
                    </h4>
                    <div className="grid gap-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 lg:gap-6 p-4 lg:p-6 bg-gradient-to-r from-fuchsia-25 to-pink-25 rounded-2xl border border-fuchsia-100 hover:shadow-md transition-all duration-300 group">
                          {/* Enhanced Product Image */}
                          <div className="flex-shrink-0">
                            <div className="relative overflow-hidden rounded-xl">
                              <img
                                src={item.hero_image_url}
                                alt={item.title}
                                className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 object-cover border border-fuchsia-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                            </div>
                          </div>
                          
                          {/* Enhanced Product Details */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-fuchsia-800 text-base sm:text-lg lg:text-xl mb-3 line-clamp-2 group-hover:text-fuchsia-600 transition-colors duration-300">
                              {item.title}
                            </h5>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="inline-block bg-white px-3 py-1.5 rounded-full text-xs font-semibold text-fuchsia-700 border border-fuchsia-200 shadow-sm">
                                {item.fabric}
                              </span>
                              <span className="inline-block bg-white px-3 py-1.5 rounded-full text-xs font-semibold text-purple-700 border border-purple-200 shadow-sm">
                                {item.category}
                              </span>
                            </div>
                            
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                              <div className="flex items-center gap-4">
                                <div className="text-lg lg:text-xl font-bold text-green-600">₹{item.discount_price}</div>
                                {item.original_price > item.discount_price && (
                                  <div className="text-gray-500 line-through text-sm lg:text-base">₹{item.original_price}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="bg-fuchsia-100 text-fuchsia-800 px-3 py-1.5 rounded-full text-sm font-bold border border-fuchsia-200">
                                  Qty: {item.quantity}
                                </span>
                                <div className="text-right">
                                  <div className="font-bold text-gray-800 text-base lg:text-lg">
                                    ₹{item.discount_price * item.quantity}
                                  </div>
                                  <p className="text-xs text-gray-500">Item Total</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Enhanced Order Summary */}
                    <div className="mt-8 pt-6 border-t border-fuchsia-100">
                      <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 rounded-2xl p-6 border border-fuchsia-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Package className="w-4 h-4" />
                              <span>Total Items: <span className="font-semibold">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>Premium Quality Assured</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                              ₹{order.total}
                            </div>
                            <p className="text-sm text-gray-500">Grand Total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

export default Orders;