import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";
import { Package, Calendar, CreditCard, ShoppingBag, Clock, CheckCircle } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        return <ShoppingBag className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 flex flex-col">
      <Header />
      
      <div className="flex-1 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="w-8 h-8 text-fuchsia-600" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fuchsia-800">Your Orders</h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">Track and manage your order history</p>
          </div>

          {loading ? (
            /* Loading State */
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-fuchsia-600 font-semibold text-lg">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            /* Empty Orders State */
            <div className="text-center py-12 sm:py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-fuchsia-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">No orders yet</h3>
                <p className="text-gray-600 mb-8 text-sm sm:text-base">
                  When you place your first order, it will appear here.
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-fuchsia-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-6 sm:space-y-8">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-fuchsia-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 px-4 sm:px-6 py-4 border-b border-fuchsia-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg">
                          <Package className="w-5 h-5 text-fuchsia-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-fuchsia-800 text-lg">Order #{order.id}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
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
                      
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-bold text-green-600">
                          <CreditCard className="w-4 h-4" />
                          <span>₹{order.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 sm:p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Order Items</h4>
                    <div className="grid gap-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-fuchsia-25 rounded-xl border border-fuchsia-50">
                          {/* Large Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.hero_image_url}
                              alt={item.title}
                              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-cover rounded-xl border border-fuchsia-100 shadow-sm"
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-fuchsia-800 text-base sm:text-lg mb-2 line-clamp-2">{item.title}</h5>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="inline-block bg-white px-3 py-1 rounded-full text-xs font-medium text-fuchsia-700 border border-fuchsia-200">
                                {item.fabric}
                              </span>
                              <span className="inline-block bg-white px-3 py-1 rounded-full text-xs font-medium text-fuchsia-700 border border-fuchsia-200">
                                {item.category}
                              </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-green-600 text-lg">₹{item.discount_price}</span>
                                {item.original_price > item.discount_price && (
                                  <span className="text-gray-500 line-through text-sm">₹{item.original_price}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="bg-fuchsia-100 px-3 py-1 rounded-full text-sm font-semibold text-fuchsia-800">
                                  Qty: {item.quantity}
                                </span>
                                <span className="font-semibold text-gray-700">
                                  Total: ₹{item.discount_price * item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 pt-4 border-t border-fuchsia-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Items:</span>
                        <span className="font-semibold">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-lg font-bold text-fuchsia-800">Order Total:</span>
                        <span className="text-xl font-bold text-green-600">₹{order.total}</span>
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
    </div>
  );
};

export default Orders;