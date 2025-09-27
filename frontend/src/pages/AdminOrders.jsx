import React, { useEffect, useState } from "react";
import { ShoppingBag, Package, User, Phone, MapPin, DollarSign } from "lucide-react";
import { supabase } from "../supabaseClient";
import { optimizeImage } from "../utils/imageOptimizer";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ORDERS_PER_PAGE = 20;

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const loadMoreOrders = () => {
    if (!loading && hasMore) {
      fetchAllOrders(page + 1);
    }
  };

async function fetchAllOrders(pageNum = 0) {
  setLoading(true);
  try {
    const offset = pageNum * ORDERS_PER_PAGE;
    
    // Start with minimal query to avoid column errors
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, user_email, items, amount, status, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + ORDERS_PER_PAGE - 1);

    if (ordersError) throw ordersError;

    // Debug: Log available columns
    if (orders && orders.length > 0) {
      console.log('Available order columns:', Object.keys(orders[0]));
    }

    // Check if we have more orders
    setHasMore(orders && orders.length === ORDERS_PER_PAGE);
    setPage(pageNum);

    // Batch fetch user details for all unique emails
    const uniqueEmails = [...new Set(orders.filter(o => o.user_email).map(o => o.user_email))];
    let userDetailsMap = {};
    
    if (uniqueEmails.length > 0) {
      const { data: usersData } = await supabase
        .from("users")
        .select("email, full_name")
        .in("email", uniqueEmails);
      
      if (usersData) {
        userDetailsMap = usersData.reduce((acc, user) => {
          acc[user.email] = user;
          return acc;
        }, {});
      }
    }

    const safeNumber = (val, fallback = 0) => {
      const num = Number(val);
      return isNaN(num) ? fallback : num;
    };

    // Get unique product IDs from all orders to batch fetch product data
    const allProductIds = new Set();
    orders.forEach(order => {
      try {
        const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        if (Array.isArray(items)) {
          items.forEach(item => {
            if (item?.id) allProductIds.add(item.id);
          });
        }
      } catch (e) {
        console.error("Error parsing items for order:", order.id, e);
      }
    });

    // Batch fetch product data
    let productsMap = {};
    if (allProductIds.size > 0) {
      const { data: productsData } = await supabase
        .from("products")
        .select("id, hero_image_url")
        .in("id", Array.from(allProductIds));
      
      if (productsData) {
        productsMap = productsData.reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {});
      }
    }

    const formattedOrders = orders.map(order => {
        let parsedItems = [];
        try {
          const items = typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items;

          parsedItems = Array.isArray(items)
            ? items.map(item => {
                // keep original price/amount logic
                const quantity = safeNumber(item?.quantity, 1);
                const price = safeNumber(item?.discount_price || item?.price, 0);

                // Get product data from batch fetch
                const productData = productsMap[item?.id];
                let productImage = item?.hero_image_url || item?.image_url || item?.image || "";
                let productColors = [];

                if (productData) {
                  productImage = productImage || productData.hero_image_url || "";
                  
                  // Color information is handled from the individual item data
                }

                // Fallback to old single color format if no colors from DB
                if (productColors.length === 0 && item?.color && item?.code) {
                  productColors.push({
                    color: item.color,
                    name: item.code
                  });
                }

                // If item has selectedColor from order, prioritize that
                let itemSelectedColor = null;
                if (item?.selectedColor) {
                  itemSelectedColor = item.selectedColor;
                }

                return {
                  ...item,
                  id: item?.id || "",
                  title: item?.title || item?.name || "Unknown Product",
                  category: item?.category || "",
                  fabric: item?.fabric || "",
                  quantity,
                  discount_price: price,
                  original_price: safeNumber(item?.original_price || item?.price, 0),
                  hero_image_url: productImage,
                  colors: productColors, // Array of color objects
                  selectedColor: itemSelectedColor, // User's selected color for this order
                  amount: price * quantity,
                };
              })
            : [];
        } catch (e) {
          console.error("Error parsing items for order:", order.id, e);
        }

        // keep your amount/shipping/total logic as-is
        const subtotal = safeNumber(order.amount, 0);
        const total = subtotal;

        // Process order-level colors from the orders table (if they exist)
        let orderColors = [];
        // Only process colors if the fields exist
        if (order.color && order.code) {
          const colorArray = Array.isArray(order.color) ? order.color : [];
          const codeArray = Array.isArray(order.code) ? order.code : [];
          const maxLength = Math.max(colorArray.length, codeArray.length);
          
          for (let i = 0; i < maxLength; i++) {
            orderColors.push({
              color: colorArray[i] || "#000000",
              name: codeArray[i] || ""
            });
          }
        }

        return {
          ...order,
          items: parsedItems,
          subtotal,
          total,
          orderColors: orderColors, // Add order-level selected colors
          created_at: order.created_at || new Date().toISOString(),
          updated_at: order.updated_at || order.created_at || new Date().toISOString(),
          status: order.status || "paid",
          user_details: {
            full_name: userDetailsMap[order.user_email]?.full_name || order.user_email || "Guest User",
            email: order.user_email || "",
            phone: order.phone || "Not provided",
            address: order.address || "Not provided",
            city: order.city || "Not provided",
            state: order.state || "Not provided",
            pincode: order.pincode || "Not provided",
          },
          payment_id: order.payment_id || "Not available",
          razorpay_order_id: order.razorpay_order_id || "Not available",
          tracking_id: order.tracking_id || "Not available",
        };
      });

    setOrders(pageNum === 0 ? formattedOrders : [...orders, ...formattedOrders]);
  } catch (error) {
    console.error("Error fetching orders:", error);
  } finally {
    setLoading(false);
  }
}


  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800 font-semibold';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'placed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-900">
                              {order.user_details.full_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.user_details.email}
                            </div>
                            <div className="text-sm text-gray-600">
                              📞 {order.user_details.phone}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              <p className="font-medium">Shipping Address:</p>
                              <p>{order.user_details.address}</p>
                              <p>{order.user_details.city}, {order.user_details.state}</p>
                              <p>PIN: {order.user_details.pincode}</p>
                            </div>
                          </div>
                        </td>
                        {/* Order Items */}
                        <td className="px-6 py-4">
                          <div className="space-y-3">
                            {Array.isArray(order.items) && order.items.map((item, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-start space-x-3">
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                    {item.hero_image_url ? (
                                      <img 
                                        src={optimizeImage(item.hero_image_url, 'thumbnail')} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-full h-full ${item.hero_image_url ? 'hidden' : 'flex'} items-center justify-center bg-gray-100`}>
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                        <p className="text-xs text-gray-500">Product ID: {item.id}</p>
                                        <p className="text-xs text-gray-500">Category: {item.category}</p>
                                        <p className="text-xs text-gray-500">Fabric: {item.fabric}</p>
                                        {item.selectedColor && (
                                          <div className="mt-1">
                                            <span className="text-xs text-gray-500">Selected Color:</span>
                                            <div className="flex items-center gap-1 mt-1">
                                              <div 
                                                className="w-3 h-3 rounded-full border border-gray-300"
                                                style={{ backgroundColor: item.selectedColor.color }}
                                                title={item.selectedColor.name}
                                              ></div>
                                              <span className="text-xs text-gray-700 font-medium">{item.selectedColor.name}</span>
                                            </div>
                                          </div>
                                        )}
                                        {item.colors && item.colors.length > 0 && (
                                          <div className="mt-1">
                                            <span className="text-xs text-gray-500">All Colors:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {item.colors.map((colorItem, colorIdx) => (
                                                <div key={colorIdx} className="flex items-center gap-1">
                                                  <div 
                                                    className="w-3 h-3 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: colorItem.color }}
                                                    title={colorItem.name}
                                                  ></div>
                                                  <span className="text-xs text-gray-700 font-medium">{colorItem.name}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                          ₹{item.discount_price?.toLocaleString()}
                                        </p>
                                        {item.original_price > item.discount_price && (
                                          <p className="text-xs text-gray-500 line-through">
                                            ₹{item.original_price?.toLocaleString()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="mt-2 flex justify-between items-center text-sm">
                                      <span className="text-gray-600">Qty: {item.quantity}</span>
                                      <span className="font-medium text-gray-900">
                                        Total: ₹{(item.discount_price * item.quantity)?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">
                              Subtotal: ₹{order.subtotal?.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">
                              Shipping: ₹{order.shipping?.toLocaleString()}
                            </div>
                            <div className="text-sm font-medium text-gray-900 pt-1 border-t">
                              Total: ₹{order.total?.toLocaleString()}
                            </div>
                            {order.payment_id && (
                              <div className="text-xs text-gray-600 mt-2">
                                Payment ID: {order.payment_id}
                              </div>
                            )}
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
              
              {/* Load More Button for Desktop */}
              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMoreOrders}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'Load More Orders'
                    )}
                  </button>
                </div>
              )}
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
                            <p className="text-sm text-gray-600">{order.user_details.email}</p>
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
                        {Array.isArray(order.items) && order.items.map((item, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {item.hero_image_url ? (
                                  <img 
                                    src={optimizeImage(item.hero_image_url, 'thumbnail')} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full ${item.hero_image_url ? 'hidden' : 'flex'} items-center justify-center bg-gray-100`}>
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Product ID: {item.id}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {item.fabric} | {item.category}
                                    </div>
                                    {item.selectedColor && (
                                      <div className="mt-1">
                                        <span className="text-xs text-gray-500">Selected Color:</span>
                                        <div className="flex items-center gap-1 mt-1">
                                          <div 
                                            className="w-3 h-3 rounded-full border border-gray-300"
                                            style={{ backgroundColor: item.selectedColor.color }}
                                            title={item.selectedColor.name}
                                          ></div>
                                          <span className="text-xs text-gray-700 font-medium">{item.selectedColor.name}</span>
                                        </div>
                                      </div>
                                    )}
                                    {item.colors && item.colors.length > 0 && (
                                      <div className="mt-1">
                                        <span className="text-xs text-gray-500">All Colors:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {item.colors.map((colorItem, colorIdx) => (
                                            <div key={colorIdx} className="flex items-center gap-1">
                                              <div 
                                                className="w-3 h-3 rounded-full border border-gray-300"
                                                style={{ backgroundColor: colorItem.color }}
                                                title={colorItem.name}
                                              ></div>
                                              <span className="text-xs text-gray-700 font-medium">{colorItem.name}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    <div className="mt-2 text-sm text-gray-600">
                                      Quantity: {item.quantity}
                                    </div>
                                  </div>
                                  <div className="text-right ml-2">
                                    <div className="text-sm font-medium text-gray-900">
                                      ₹{item.discount_price?.toLocaleString()}
                                    </div>
                                    {item.original_price > item.discount_price && (
                                      <div className="text-xs text-gray-500 line-through">
                                        ₹{item.original_price?.toLocaleString()}
                                      </div>
                                    )}
                                    <div className="text-sm font-medium text-gray-900 mt-2">
                                      Total: ₹{(item.discount_price * item.quantity)?.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Subtotal:</span>
                          <span className="text-sm font-medium text-gray-900">₹{order.subtotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Shipping:</span>
                          <span className="text-sm font-medium text-gray-900">₹{order.shipping?.toLocaleString()}</span>
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
            
            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMoreOrders}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Orders'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;