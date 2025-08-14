import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";

const testimonials = [
  {
    quote: "The recent lehanga which I have purchased from you is excellent.. quality and fitting of blouse and lehanga is top notch. Thank you for maintaining such good quality and fast delivery service.",
    purchased: "Paithani Lehanga",
    name: "Komali",
    location: "Hyderabad, Telangana",
    initial: "K"
  },
  {
    quote: "Bought latest trending space silk saree from your page .. wore it for a wedding. Got many compliments from everyone. Thank you ",
    purchased: "Space silk saree with Jarkhan work",
    name: "Swetha",
    location: "Nellore, Andhra Pradesh",
    initial: "S"
  },
  {
    quote: "Absolutely in love with the saree I ordered! The fabric quality is top-notch, and it looked exactly like the pictures. VedhaTrendz has become my go-to for festive shopping!",
    purchased: "Benarasi Saree",
    name: "Priya",
    location: "Hanumakonda, Telangana",
    initial: "P"
  },
  {
    quote: "Was worried about online saree shopping, but VedhaTrendz made it so easy. The frock fitting is perfect and delivery was on time. Highly recommended. Customer service was very responsive too!!",
    purchased: "Mul Mul Cotton Frock",
    name: "Anilisha",
    location: "Chennai, Tamil Nadu",
    initial: "A"
  }
];

const stats = [
  { label: "Average Rating", value: "4.8" },
  { label: "Instagram Followers", value: "22K+" },
  { label: "Satisfaction Rate", value: "99%" },
  { label: "Happy Customers", value: "1000+" }
];

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setProducts(data || []);
  }
  const bestSelling = products[0];
  return (
<div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Image Section */}
      {bestSelling && (
        <section className="w-full bg-fuchsia-50 py-12 mb-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 px-4">
            <img
              src={bestSelling.hero_image_url}
              alt={bestSelling.title}
              className="w-full md:w-96 h-72 object-cover rounded-xl shadow-lg border border-fuchsia-200"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-fuchsia-700 mb-2 animate-fade-in">
                Best Selling Item
              </h1>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{bestSelling.title}</h2>
              <p className="text-gray-700 mb-3">{bestSelling.description}</p>
              <div className="flex gap-4 mb-2">
                <span className="font-semibold text-gray-700">Original: ₹{bestSelling.original_price}</span>
                <span className="font-semibold text-green-600">Discount: ₹{bestSelling.discount_price}</span>
              </div>
              <span className="inline-block bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded-full text-xs font-semibold">
                New Arrival
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Featured Collection */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-fuchsia-700 mb-8 text-center">Featured Collection</h2>
        {products.length === 0 ? (
          <div className="text-center text-fuchsia-700 py-12">
            No products found. Please add new arrivals!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(1, 7).map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg border border-fuchsia-100 p-6 flex flex-col hover:scale-105 transition-transform duration-300">
                <img
                  src={product.hero_image_url}
                  alt={product.title}
                  className="w-full h-56 object-cover rounded-lg mb-4 border border-fuchsia-100"
                />
                <h3 className="text-xl font-bold text-fuchsia-700 mb-2">{product.title}</h3>
                <p className="text-gray-700 mb-2 line-clamp-2">{product.description}</p>
                <div className="text-sm text-gray-500 mb-2">Fabric: {product.fabric}</div>
                <div className="text-sm text-gray-500 mb-2">Category: {product.category}</div>
                <div className="flex gap-4 mb-2">
                  <span className="font-semibold text-gray-700">Original: ₹{product.original_price}</span>
                  <span className="font-semibold text-green-600">Discount: ₹{product.discount_price}</span>
                </div>
                <span className="inline-block bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded-full text-xs font-semibold">
                  New Arrival
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-fuchsia-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-fuchsia-700 mb-8 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-6 flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-fuchsia-700 text-white font-bold text-lg">{t.initial}</span>
                  <div>
                    <div className="font-semibold text-fuchsia-700">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.location}</div>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic mb-2">"{t.quote}"</blockquote>
                <div className="text-xs text-fuchsia-700 font-medium">Purchased: {t.purchased}</div>
              </div>
            ))}
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-fuchsia-100 rounded-xl py-6 px-2">
                <div className="text-2xl font-bold text-fuchsia-700 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-700">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;