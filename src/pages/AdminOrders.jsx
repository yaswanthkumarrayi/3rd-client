import React, { useEffect, useState } from "react";
import { ShoppingBag, Package, User, Phone, MapPin, DollarSign } from "lucide-react";
import { supabase } from "../supabaseClient";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  async function fetchAllOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          user_details:user_email (
            full_name,
            phone,
            address,
            city,
            state,
            pincode
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      // Format the data to include user details
      const formattedData = data.map(order => ({
        ...order,
        user_details: order.user_details || {
          full_name: "N/A",
          phone: order.phone || "N/A",
          address: order.address || "N/A",
          city: order.city || "N/A",
          state: order.state || "N/A",
          pincode: order.pincode || "N/A"
        }
      }));
      
      setOrders(formattedData || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
    setLoading(false);
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600 text-sm">Manage all customer orders</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Info</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">Order #{order.id}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleString()}
                            </div>
                            {order.razorpay_order_id && (
                              <div className="text-xs text-gray-500">
                                RazorPay ID: {order.razorpay_order_id}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {order.user_details.full_name}
                            </div>
                            <div className="text-sm text-gray-600">{order.user_email}</div>
                            <div className="text-sm text-gray-600">{order.user_details.phone}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {order.user_details.address}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {Array.isArray(order.items) && order.items.length > 0 ? (
                              order.items.map((item, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900">{item.title}</span>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>Qty: {item.quantity}</span>
                                    <span>₹{item.discount_price}/item</span>
                                  </div>
                                  <span className="text-xs text-gray-500">{item.fabric} | {item.category}</span>
                                </div>
                              ))
                            ) : (
                              "No items"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              Total: ₹{order.total?.toLocaleString()}
                            </div>
                            {order.payment_id && (
                              <div className="text-xs text-gray-600">
                                Payment ID: {order.payment_id}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              Shipping: ₹100
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">{order.user_details.city}</div>
                            <div className="text-sm text-gray-600">{order.user_details.state}</div>
                            <div className="text-sm text-gray-600">PIN: {order.user_details.pincode}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {order.tracking_id ? `Tracking: ${order.tracking_id}` : 'No tracking info'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      {order.razorpay_order_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          RazorPay ID: {order.razorpay_order_id}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Customer Information */}
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{order.user_details.full_name}</p>
                            <p className="text-sm text-gray-600">{order.user_email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{order.user_details.phone}</span>
                        </div>

                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              {order.user_details.address}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.user_details.city}, {order.user_details.state} - {order.user_details.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {Array.isArray(order.items) && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm font-medium text-gray-900">{item.title}</div>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                                <span className="text-sm text-gray-600">₹{item.discount_price}/item</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.fabric} | {item.category}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No items</p>
                        )}
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Subtotal:</span>
                          <span className="text-sm font-medium text-gray-900">₹{(order.total - 100)?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Shipping:</span>
                          <span className="text-sm font-medium text-gray-900">₹100</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm font-medium text-gray-900">Total Amount:</span>
                          <span className="text-lg font-bold text-gray-900">₹{order.total?.toLocaleString()}</span>
                        </div>
                        {order.payment_id && (
                          <div className="text-xs text-gray-500 mt-2">
                            Payment ID: {order.payment_id}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Status */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Shipping Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {order.tracking_id ? `Tracking ID: ${order.tracking_id}` : 'No tracking information'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last Updated: {new Date(order.updated_at || order.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;