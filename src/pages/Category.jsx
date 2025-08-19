import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Category = () => {
  const { name } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [name]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", name);
    setProducts(data || []);
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-fuchsia-700 text-center">
        {name} Sarees
      </h1>
      {loading ? (
        <div className="text-center py-16 text-fuchsia-600 font-semibold">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No products found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow p-4">
              <img
                src={product.hero_image_url}
                alt={product.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h3 className="font-bold text-lg mb-1">{product.title}</h3>
              <p className="text-fuchsia-700 font-semibold mb-2">₹{product.discount_price}</p>
              <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;