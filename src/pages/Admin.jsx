import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { 
  Plus, 
  Upload, 
  X, 
  Package, 
  ShoppingBag, 
  Image as ImageIcon, 
  Trash2,
  DollarSign,
  Tag,
  FileText,
  Layers
} from "lucide-react";

const initialProduct = {
  title: "",
  description: "",
  quantity: 1,
  fabric: "",
  original_price: "",
  discount_price: "",
  category: "",
  hero_image: null,
  featured_images: [],
};

const categories = ["Saree", "Lehenga", "Gown", "Kidswear", "Blouse", "Other"];

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialProduct);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

    useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*");
    if (!error) setProducts(data || []);
    setLoading(false);
  }
  async function fetchOrders() {
const { data, error } = await supabase.from("orders").select("*");
    if (!error) setOrders(data || []);
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "hero_image") {
      setForm({ ...form, hero_image: files[0] });
    } else if (name === "featured_images") {
      setForm({ ...form, featured_images: Array.from(files) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Upload image to Supabase Storage
  async function uploadImage(file) {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from("product-images").getPublicUrl(fileName).data.publicUrl;
  }

  // Add product
  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload hero image
      let heroImageUrl = "";
      if (form.hero_image) {
        heroImageUrl = await uploadImage(form.hero_image);
      }

      // Upload featured images
      let featuredImageUrls = [];
      if (form.featured_images.length) {
        featuredImageUrls = await Promise.all(
          form.featured_images.map(uploadImage)
        );
      }

      // Insert product
      const { error } = await supabase.from("products").insert([
        {
          title: form.title,
          description: form.description,
          quantity: form.quantity,
          fabric: form.fabric,
          original_price: form.original_price,
          discount_price: form.discount_price,
          category: form.category,
          hero_image_url: heroImageUrl,
          featured_images: featuredImageUrls,
        },
      ]);
      if (error) throw error;

      setForm(initialProduct);
      setShowForm(false);
      fetchProducts();
      
      // Success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = 'Product added successfully!';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    } catch (err) {
      // Error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = 'Error: ' + err.message;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    }
    setUploading(false);
  }

async function handleDelete(id) {
  if (!window.confirm("Are you sure you want to delete this product?")) return;

  // Find the product to get image URLs
  const product = products.find((p) => p.id === id);
  if (!product) return;

  // Helper to extract file name from Supabase public URL
  const getFileName = (url) => {
    const parts = url.split("/product-images/");
    return parts.length > 1 ? parts[1] : null;
  };

  // Gather all image file names to delete
  const heroImageFile = product.hero_image_url ? getFileName(product.hero_image_url) : null;
  const featuredImageFiles = Array.isArray(product.featured_images)
    ? product.featured_images.map(getFileName).filter(Boolean)
    : [];

  // Delete images from Supabase Storage
  try {
    if (heroImageFile) {
      const { error: heroError } = await supabase.storage.from("product-images").remove([heroImageFile]);
      if (heroError) console.error("Error deleting hero image:", heroError);
    }
    if (featuredImageFiles.length > 0) {
      const { error: featuredError } = await supabase.storage.from("product-images").remove(featuredImageFiles);
      if (featuredError) console.error("Error deleting featured images:", featuredError);
    }
  } catch (imgErr) {
    console.error("Error deleting images from storage:", imgErr);
  }

  // Delete product from Supabase DB
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (!error) {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    // Success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = 'Product and images deleted successfully!';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  } else {
    // Error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = 'Error deleting product!';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
    console.error("Delete error:", error);
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Order ID</th>
                <th className="px-4 py-2 border">User</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Address</th>
                <th className="px-4 py-2 border">Products</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-4 py-2 border">{order.id}</td>
                  <td className="px-4 py-2 border">{order.users?.name || order.user_id}</td>
                  <td className="px-4 py-2 border">{order.users?.phone}</td>
                  <td className="px-4 py-2 border">{order.users?.address}</td>
                  <td className="px-4 py-2 border">{JSON.stringify(order.products)}</td>
                  <td className="px-4 py-2 border">₹{order.total}</td>
                  <td className="px-4 py-2 border">{order.status}</td>
                  <td className="px-4 py-2 border">{order.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 md:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                  Admin Dashboard
                </h1>
                <p className="mt-2 text-slate-600">Manage your product inventory</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Product Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Add New Product
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
                      Product Title
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter product title"
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Layers className="inline h-4 w-4 mr-1" />
                      Fabric
                    </label>
                    <input
                      name="fabric"
                      value={form.fabric}
                      onChange={handleChange}
                      placeholder="e.g., Cotton, Silk, Chiffon"
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Original Price
                      </label>
                      <input
                        name="original_price"
                        value={form.original_price}
                        onChange={handleChange}
                        placeholder="0"
                        required
                        type="number"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Tag className="inline h-4 w-4 mr-1" />
                        Discount Price
                      </label>
                      <input
                        name="discount_price"
                        value={form.discount_price}
                        onChange={handleChange}
                        placeholder="0"
                        required
                        type="number"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Package className="inline h-4 w-4 mr-1" />
                        Quantity
                      </label>
                      <input
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        placeholder="1"
                        required
                        type="number"
                        min="1"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Tag className="inline h-4 w-4 mr-1" />
                        Category
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter product description"
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Hero Image Section */}
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Hero Image Section
                      </h3>
                      <p className="text-sm text-blue-600">Upload the main product image that will be displayed prominently</p>
                    </div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      <ImageIcon className="inline h-4 w-4 mr-1" />
                      Main Product Image *
                    </label>
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-500 transition-colors bg-blue-50/30">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <input
                            type="file"
                            name="hero_image"
                            accept="image/*"
                            onChange={handleChange}
                            required
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                          />
                          <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Featured Images Section */}
                  <div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Featured Images Section
                      </h3>
                      <p className="text-sm text-green-600">Upload additional product images to showcase different angles and details</p>
                    </div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      <Upload className="inline h-4 w-4 mr-1" />
                      Additional Product Images (Optional)
                    </label>
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-8 hover:border-green-500 transition-colors bg-green-50/30">
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-green-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <input
                            type="file"
                            name="featured_images"
                            accept="image/*"
                            multiple
                            onChange={handleChange}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer"
                          />
                          <p className="text-sm text-slate-500">Select multiple images - PNG, JPG, GIF up to 10MB each</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image Upload Tips
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Hero image will be the main product photo</li>
                      <li>• Featured images show additional product details</li>
                      <li>• Use high-quality images for best results</li>
                      <li>• Square images work best for consistent display</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product List */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Products ({products.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-slate-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No products found. Add your first product to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {products.map((product) => (
                <div key={product.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={product.hero_image_url}
                        alt={product.title}
                        className="w-full lg:w-32 h-48 lg:h-32 object-cover rounded-lg border border-slate-200"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-2">{product.title}</h3>
                          <p className="text-slate-600 mb-3 line-clamp-2">{product.description}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600">Fabric: <span className="font-medium text-slate-900">{product.fabric}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600">Category: <span className="font-medium text-slate-900">{product.category}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600">Qty: <span className="font-medium text-slate-900">{product.quantity}</span></span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 mt-3">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600">Original: </span>
                              <span className="font-semibold text-slate-900">₹{product.original_price}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Tag className="h-4 w-4 text-green-500" />
                              <span className="text-slate-600">Discounted: </span>
                              <span className="font-semibold text-green-600">₹{product.discount_price}</span>
                            </div>
                          </div>

                          {/* Featured Images */}
                          {product.featured_images && product.featured_images.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm text-slate-600 mb-2">Featured Images:</p>
                              <div className="flex gap-2 flex-wrap">
                                {product.featured_images.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img}
                                    alt={`Featured ${i + 1}`}
                                    className="w-16 h-16 object-cover rounded border border-slate-200"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;