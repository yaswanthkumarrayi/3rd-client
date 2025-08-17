import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { ShoppingBag } from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  async function fetchAllOrders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        const parsedOrders = data.map((order) => {
          let parsedItems = [];
          try {
            if (Array.isArray(order.items)) {
              parsedItems = order.items;
            } else if (typeof order.items === "string") {
              parsedItems = JSON.parse(order.items);
            } else if (order.items && typeof order.items === "object") {
              parsedItems = order.items;
            }
          } catch (err) {
            console.error("Error parsing items for order", order.id, err);
          }
          return { ...order, items: parsedItems };
        });
        setOrders(parsedOrders);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Helper to color statuses
  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded";
      case "completed":
        return "bg-green-100 text-green-700 px-2 py-1 rounded";
      case "cancelled":
        return "bg-red-100 text-red-700 px-2 py-1 rounded";
      default:
        return "bg-gray-100 text-gray-700 px-2 py-1 rounded";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 md:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                Admin Orders
              </h1>
              <p className="mt-2 text-slate-600">
                View and manage all placed orders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section>
          <h2 className="text-xl font-bold mb-4">All Orders</h2>
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
            {loading ? (
              <div className="p-8 text-center text-blue-600 font-semibold">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-slate-600">
                <div className="text-6xl mb-6">📦</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  No orders found
                </h3>
              </div>
            ) : (
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-4 py-2 border">Order ID</th>
                    <th className="px-4 py-2 border">User Email</th>
                    <th className="px-4 py-2 border">Phone</th>
                    <th className="px-4 py-2 border">Address</th>
                    <th className="px-4 py-2 border">Items</th>
                    <th className="px-4 py-2 border">Total</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 border">{order.id}</td>
                      <td className="px-4 py-2 border">{order.user_email}</td>
                      <td className="px-4 py-2 border">
                        {order.phone || "-"}
                      </td>
                      <td className="px-4 py-2 border">
                        {order.address
                          ? `${order.address}, ${order.city || ""}, ${order.state || ""}, ${order.pincode || ""}`
                          : "-"}
                      </td>
                      <td className="px-4 py-2 border">
                        <ul className="list-disc pl-4">
                          {Array.isArray(order.items) && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <li key={idx}>
                                {item.title} x {item.quantity}
                              </li>
                            ))
                          ) : (
                            <li>-</li>
                          )}
                        </ul>
                      </td>
                      <td className="px-4 py-2 border">
                        ₹{order.total ?? 0}
                      </td>
                      <td className="px-4 py-2 border">
                        <span className={getStatusColor(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminOrders;
