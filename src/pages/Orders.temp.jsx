import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";
import { Package, Calendar, CreditCard, ShoppingBag, Clock, CheckCircle, Truck, ArrowLeft, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to safely parse items
  const parseOrderItems = (itemsData) => {
    try {
      // If it's already an array, return it
      if (Array.isArray(itemsData)) {
        return itemsData;
      }
      // If it's a string, try to parse it as JSON
      if (typeof itemsData === 'string') {
        return JSON.parse(itemsData);
      }
      // If it's neither, return empty array
      return [];
    } catch (error) {
      console.error('Error parsing order items:', error);
      console.log('Raw items data:', itemsData);
      return [];
    }
  };

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
    if (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      return;
    }
    if (data) {
      console.log('Fetched orders:', data);
      setOrders(data);
    }
    setLoading(false);
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-fuchsia-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your order history</p>
            <button
              onClick={() => navigate('/')}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Go to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-fuchsia-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Shopping</span>
              </button>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-7 h-7 text-fuchsia-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Orders</h1>
            </div>
            <p className="text-gray-600">Track and manage your purchases</p>
          </div>

          {loading ? (
            /* Loading State */
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            /* Empty Orders State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No orders yet</h3>
                <p className="text-gray-600 mb-8">
                  Start shopping to see your orders here
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:border-fuchsia-200 transition-all duration-300">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 rounded-xl flex items-center justify-center shadow-sm">
                            <Package className="w-6 h-6 text-fuchsia-600" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Order #{order.id}</h3>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span>{order.status}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(order.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(order.created_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-4 lg:mt-0">
                        <div className="flex-1 lg:flex-none">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Payment ID:</span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                {order.payment_id || 'Paid'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Shipping:</span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                ₹{order.shipping || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-full lg:w-auto">
                          <div className="bg-fuchsia-50 rounded-xl p-4">
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Order Total</div>
                              <div className="text-2xl font-bold text-fuchsia-600">₹{order.total || order.amount}</div>
                              {order.items && parseOrderItems(order.items).some(item => item.original_price > item.discount_price) && (
                                <div className="text-xs text-green-600 mt-1">Savings included</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Shipping Details</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {order.phone && (
                          <div className="text-sm">
                            <span className="text-gray-600">Phone: </span>
                            <span className="font-medium text-gray-900">{order.phone}</span>
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="text-gray-600">Address: </span>
                          <span className="font-medium text-gray-900">
                            {order.address && `${order.address}, `}
                            {order.city && `${order.city}, `}
                            {order.state && `${order.state} `}
                            {order.pincode && `- ${order.pincode}`}
                          </span>
                        </div>
                        {order.shipping && (
                          <div className="text-sm">
                            <span className="text-gray-600">Shipping Charge: </span>
                            <span className="font-medium text-gray-900">₹{order.shipping}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 sm:p-6">
                    {(() => {
                      const orderItems = parseOrderItems(order.items);
                      return (
                        <>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-5 h-5 text-fuchsia-600" />
                              <h4 className="font-semibold text-gray-900">
                                Items ({orderItems.length})
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Order Total:</span>
                              <span className="text-lg font-bold text-fuchsia-600">₹{order.total}</span>
                            </div>
                          </div>
                          
                          <div className="grid gap-4">
                            {orderItems.map((item, idx) => (
                              <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-fuchsia-50/50 transition-colors duration-200">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                  <div className="relative group">
                                    <img
                                      src={item.hero_image_url || item.image_url}
                                      alt={item.title}
                                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:border-fuchsia-200 transition-all duration-200"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/vite.svg';  // Fallback image
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">View Product</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div>
                                      <h5 className="font-medium text-gray-900 text-base sm:text-lg mb-2 truncate line-clamp-2 hover:text-fuchsia-600 transition-colors duration-200">
                                        {item.title || 'Product Title Unavailable'}
                                      </h5>
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        {item.fabric && (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
                                            {item.fabric}
                                          </span>
                                        )}
                                        {item.category && (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                            {item.category}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Price:</span>
                                        <span className="font-bold text-gray-900">₹{item.discount_price || item.price || 0}</span>
                                        {item.original_price && item.original_price > (item.discount_price || item.price) && (
                                          <span className="text-gray-500 line-through text-sm">₹{item.original_price}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Qty:</span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
                                          {item.quantity || 1}
                                        </span>
                                      </div>
                                      <div className="mt-1">
                                        <div className="font-bold text-lg text-fuchsia-600">
                                          ₹{((item.discount_price || item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                        </div>
                                        <p className="text-xs text-gray-500 text-right">Item Total</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {item.original_price && (item.discount_price || item.price) && 
                                   item.original_price > (item.discount_price || item.price) && (
                                    <div className="mt-2 text-sm text-green-600">
                                      You saved ₹{((item.original_price - (item.discount_price || item.price)) * (item.quantity || 1)).toLocaleString()}!
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
