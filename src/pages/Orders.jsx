import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";
import { Package, Calendar, CreditCard, ShoppingBag, Clock, CheckCircle, Truck, ArrowLeft, User } from "lucide-react";
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
    if (!error && data) setOrders(data);
    setLoading(false);
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-fuchsia-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-fuchsia-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">Order #{order.id}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xl font-bold text-gray-900">
                            <span>₹{order.total}</span>
                          </div>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    {(() => {
                      const orderItems = parseOrderItems(order.items);
                      return (
                        <>
                          <div className="flex items-center gap-2 mb-4">
                            <ShoppingBag className="w-4 h-4 text-gray-600" />
                            <h4 className="font-medium text-gray-900">
                              Items ({orderItems.length})
                            </h4>
                          </div>
                          
                          <div className="space-y-4">
                            {orderItems.map((item, idx) => (
                              <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                  <img
                                    src={item.hero_image_url}
                                    alt={item.title}
                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200"
                                  />
                                </div>
                                
                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
                                    {item.title}
                                  </h5>
                                  
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="inline-block bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 border border-gray-200">
                                      {item.fabric}
                                    </span>
                                    <span className="inline-block bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 border border-gray-200">
                                      {item.category}
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-gray-900">₹{item.discount_price}</span>
                                      {item.original_price > item.discount_price && (
                                        <span className="text-gray-500 line-through text-sm">₹{item.original_price}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="bg-fuchsia-50 text-fuchsia-700 px-2 py-1 rounded text-sm font-medium border border-fuchsia-200">
                                        Qty: {item.quantity}
                                      </span>
                                      <div className="text-right">
                                        <div className="font-semibold text-gray-900">
                                          ₹{item.discount_price * item.quantity}
                                        </div>
                                        <p className="text-xs text-gray-500">Subtotal</p>
                                      </div>
                                    </div>
                                  </div>
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