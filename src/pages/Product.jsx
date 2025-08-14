import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [cartCount, setCartCount] = useState(
    Number(localStorage.getItem("cartCount")) || 0
  );

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (!error) setProduct(data);
  }

  const images = product
    ? [product.hero_image_url, ...(product.featured_images || [])]
    : [];

  function addToCart() {
    // You can expand this to store cart items in localStorage or context
    localStorage.setItem("cartCount", cartCount + 1);
    setCartCount(cartCount + 1);
  }

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-fuchsia-100 text-fuchsia-700 rounded hover:bg-fuchsia-200"
        >
          Back
        </button>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image Slider */}
          <div className="flex flex-col items-center md:w-1/2">
            <div className="w-full h-80 flex items-center justify-center bg-fuchsia-50 rounded-xl border border-fuchsia-200 mb-4">
              <img
                src={images[activeImg]}
                alt={product.title}
                className="max-h-72 object-contain rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Product ${idx + 1}`}
                  className={`w-16 h-16 object-cover rounded border cursor-pointer ${
                    activeImg === idx
                      ? "border-fuchsia-700"
                      : "border-fuchsia-100"
                  }`}
                  onClick={() => setActiveImg(idx)}
                />
              ))}
            </div>
          </div>
          {/* Product Details */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-fuchsia-700 mb-2">
              {product.title}
            </h1>
            <p className="text-gray-700 mb-3">{product.description}</p>
            <div className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Fabric:</span> {product.fabric}
            </div>
            <div className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Category:</span> {product.category}
            </div>
            <div className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Quantity:</span> {product.quantity}
            </div>
            <div className="flex gap-4 mb-4">
              <span className="font-semibold text-gray-700">
                Original: ₹{product.original_price}
              </span>
              <span className="font-semibold text-green-600">
                Discount: ₹{product.discount_price}
              </span>
            </div>
            <button
              onClick={addToCart}
              className="px-6 py-3 bg-fuchsia-700 text-white rounded-lg font-semibold hover:bg-fuchsia-800 transition mb-2"
            >
              Add to Cart
            </button>
            <div className="mt-2 text-fuchsia-700 font-bold">
              Cart: {cartCount} item{cartCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;