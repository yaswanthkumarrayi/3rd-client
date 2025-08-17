import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";
import { ShoppingBag, User, CreditCard } from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  async function fetchAllOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50 flex flex-col">
      <Header />
      <div className="max-w-5xl mx-auto w-full px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold text-fuchsia-700 mb-8 text-center">All Orders (Admin)</h1>
        {loading ? (
          <div className="text-center py-16 text-fuchsia-600 font-semibold">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No orders found</h3>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-fuchsia-100 p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-fuchsia-700">Order #{order.id}</span>
                  <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="mb-2 text-sm text-gray-600 flex gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User size={16} className="text-fuchsia-600" />
                    {order.user_email}
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard size={16} className="text-green-600" />
                    {order.status}
                  </span>
                  {order.payment_id && (
                    <span className="flex items-center gap-1">
                      Payment ID: {order.payment_id}
                    </span>
                  )}
                </div>
                {order.phone && (
                  <div className="mb-2 text-sm text-gray-600">
                    <span className="font-medium">Contact:</span> {order.phone}
                  </div>
                )}
                {order.address && (
                  <div className="mb-2 text-sm text-gray-600">
                    <span className="font-medium">Shipping:</span> {order.address}, {order.city}, {order.state} - {order.pincode}
                  </div>
                )}
                <div className="mb-4">
                  <span className="font-medium text-gray-700">Items:</span>
                  <ul className="list-disc pl-6 mt-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="mb-3 flex items-center gap-4">
                        <img
                          src={item.hero_image_url}
                          alt={item.title}
                          className="w-14 h-14 object-cover rounded-lg border border-fuchsia-100"
                        />
                        <div>
                          <span className="font-semibold">{item.title}</span> x {item.quantity} — ₹{item.discount_price} each
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="font-bold text-green-700 text-lg">
                  Total: ₹{order.total}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminOrders;