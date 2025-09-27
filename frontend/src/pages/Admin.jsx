import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { optimizeImage } from "../utils/imageOptimizer";
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
  id: null,
  title: "",
  description: "",
  quantity: "",
  fabric: "",
  original_price: "",
  discount_price: "",
  category: "",
  colors: [], // Array of color objects: [{color: "#000000", name: "Black", images: []}] - will be converted to JSONB fields
  hero_image: null,
  hero_image_url: "",
  isEditing: false
};

const categories = [
  "Mangalagiri",
  "Kanchi",
  "Banarasi",
  "Mysore Silk",
  "Designer"
];

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialProduct);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const navigate = useNavigate();
  const PRODUCTS_PER_PAGE = 10;

  // Fetch products and orders
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProducts(),
          fetchOrders()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  async function fetchProducts(pageNum = 0) {
    const offset = pageNum * PRODUCTS_PER_PAGE;
    
    const { data, error } = await supabase
      .from("products")
      .select("id, title, description, quantity, fabric, original_price, discount_price, category, hero_image_url, created_at")
      .order('created_at', { ascending: false })
      .range(offset, offset + PRODUCTS_PER_PAGE - 1);
    
    if (!error) {
      // Debug: Log available columns
      if (data && data.length > 0) {
        console.log('Available product columns:', Object.keys(data[0]));
      }
      
      // Check if we have more products
      setHasMoreProducts(data && data.length === PRODUCTS_PER_PAGE);
      setPage(pageNum);
      
      // Convert JSONB color and code fields to colors array format for display
      const processedProducts = (data || []).map(product => {
        let colors = [];
        // Only process colors if the fields exist
        if (product.color && product.code) {
          const colorArray = Array.isArray(product.color) ? product.color : [];
          const codeArray = Array.isArray(product.code) ? product.code : [];
          const imagesArray = Array.isArray(product.color_images) ? product.color_images : [];
          const maxLength = Math.max(colorArray.length, codeArray.length);
          
          for (let i = 0; i < maxLength; i++) {
            colors.push({
              color: colorArray[i] || "#000000",
              name: codeArray[i] || "",
              images: imagesArray[i] || []
            });
          }
        }
        
        return {
          ...product,
          colors: colors
        };
      });
      
      setProducts(pageNum === 0 ? processedProducts : [...products, ...processedProducts]);
    } else {
      console.error('Error fetching products:', error);
    }
  }

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("id, status, created_at, amount, user_email")
      .order('created_at', { ascending: false })
      .limit(10); // Limit to recent orders for admin dashboard
    if (!error) setOrders(data || []);
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "hero_image") {
      setForm(prevForm => ({ ...prevForm, hero_image: files[0] }));
    } else {
      setForm(prevForm => ({ ...prevForm, [name]: value }));
    }
  };

  // Handle color image upload (max 4 images per color)
  const handleColorImageUpload = (colorIndex, files) => {
    const selectedFiles = Array.from(files).slice(0, 4); // Limit to 4 images
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((color, index) => 
        index === colorIndex 
          ? { ...color, images: selectedFiles }
          : color
      )
    }));
  };

  // Add a new color
  const addColor = () => {
    setForm(prev => ({
      ...prev,
      colors: [...prev.colors, { color: "#000000", name: "", images: [] }]
    }));
  };

  // Remove a color
  const removeColor = (index) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  // Update a specific color
  const updateColor = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => 
        i === index ? { ...color, [field]: value } : color
      )
    }));
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

  // Handle edit click - FIXED for JSONB structure with color images
  const handleEdit = (product) => {
    console.log("Editing product:", product); // Debug log
    
    // Convert color and code JSONB arrays back to colors array format
    let colors = [];
    if (product.color && product.code) {
      const colorArray = Array.isArray(product.color) ? product.color : [];
      const codeArray = Array.isArray(product.code) ? product.code : [];
      const imagesArray = Array.isArray(product.color_images) ? product.color_images : [];
      const maxLength = Math.max(colorArray.length, codeArray.length);
      
      for (let i = 0; i < maxLength; i++) {
        colors.push({
          color: colorArray[i] || "#000000",
          name: codeArray[i] || "",
          images: [], // Reset images for editing
          existingImages: imagesArray[i] || [] // Store existing images separately
        });
      }
    }
    
    setForm({
      id: product.id,
      title: product.title || "",
      description: product.description || "",
      quantity: product.quantity?.toString() || "1",
      fabric: product.fabric || "",
      original_price: product.original_price?.toString() || "",
      discount_price: product.discount_price?.toString() || "",
      category: product.category || "",
      colors: colors,
      hero_image: null,
      hero_image_url: product.hero_image_url || "",
      isEditing: true
    });
    setShowForm(true);
  };

  // Add or update product - FIXED with color images
  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);

    console.log("Submitting form:", form); // Debug log

    try {
      // Upload hero image only if a new one is selected
      let heroImageUrl = form.hero_image_url;
      if (form.hero_image) {
        heroImageUrl = await uploadImage(form.hero_image);
      }

      // Upload images for each color (max 4 per color)
      const colorImagesArrays = [];
      for (let i = 0; i < form.colors.length; i++) {
        const color = form.colors[i];
        let colorImages = [];
        
        if (color.images && color.images.length > 0) {
          // Upload new images for this color
          colorImages = await Promise.all(
            color.images.slice(0, 4).map(uploadImage) // Ensure max 4 images
          );
        } else if (color.existingImages && color.existingImages.length > 0) {
          // Keep existing images if no new ones uploaded
          colorImages = color.existingImages;
        }
        
        colorImagesArrays.push(colorImages);
      }

      const productData = {
        title: form.title,
        description: form.description,
        quantity: parseInt(form.quantity) || 1,
        fabric: form.fabric,
        original_price: parseFloat(form.original_price) || 0,
        discount_price: parseFloat(form.discount_price) || 0,
        category: form.category,
        color: form.colors.map(item => item.color), // Extract colors as JSONB array
        code: form.colors.map(item => item.name),   // Extract names as JSONB array
        color_images: colorImagesArrays,            // Array of arrays - each color has up to 4 images
        hero_image_url: heroImageUrl,
      };

      console.log("Product data to save:", productData); // Debug log

      let error;
      if (form.isEditing && form.id) {
        // Update existing product
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", form.id);
        error = updateError;
      } else {
        // Insert new product
        const { error: insertError } = await supabase
          .from("products")
          .insert([productData]);
        error = insertError;
      }
      
      if (error) throw error;

      // Reset form and refresh
      setForm(initialProduct);
      setShowForm(false);
      await fetchProducts(); // Wait for refresh to complete
      
      // Success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = form.isEditing ? 'Product updated successfully!' : 'Product added successfully!';
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    } catch (err) {
      console.error("Submit error:", err);
      // Error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = 'Error: ' + err.message;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
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
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    } else {
      // Error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = 'Error deleting product!';
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
      console.error("Delete error:", error);
    }
  }

  const loadMoreProducts = () => {
    if (!loading && hasMoreProducts) {
      fetchProducts(page + 1);
    }
  };

  const handleCancelEdit = () => {
    setForm(initialProduct);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setForm(initialProduct);
                    setShowForm(!showForm);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Add Product
                </button>
                <button
                  onClick={() => navigate("/adminorders")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Admin Orders
                </button>
              </div>
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
                  {form.isEditing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={handleCancelEdit}
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
                        step="0.01"
                        min="0"
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
                        step="0.01"
                        min="0"
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

                  {/* Multiple Colors Section with Images */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-slate-700">
                        <span className="inline-block w-4 h-4 mr-1 rounded-full border bg-gradient-to-r from-red-500 via-blue-500 to-green-500"></span>
                        Product Colors & Images
                      </label>
                      <button
                        type="button"
                        onClick={addColor}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Color
                      </button>
                    </div>
                    
                    {form.colors.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                        <div className="text-slate-400 mb-2">No colors added yet</div>
                        <button
                          type="button"
                          onClick={addColor}
                          className="text-blue-500 hover:text-blue-600 font-medium"
                        >
                          Click to add your first color
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {form.colors.map((colorItem, index) => (
                          <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            {/* Color Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-sm font-medium text-slate-600 w-8">#{index + 1}</span>
                              <input
                                type="color"
                                value={colorItem.color}
                                onChange={(e) => updateColor(index, 'color', e.target.value)}
                                className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
                              />
                              <div className="px-2 py-1 bg-white rounded text-xs font-mono text-slate-600 border">
                                {colorItem.color}
                              </div>
                              <input
                                type="text"
                                value={colorItem.name}
                                onChange={(e) => updateColor(index, 'name', e.target.value)}
                                placeholder="Color name (e.g., Royal Blue)"
                                required
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900"
                              />
                              <button
                                type="button"
                                onClick={() => removeColor(index)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Color Images Upload */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-slate-700">
                                  <ImageIcon className="inline h-4 w-4 mr-1" />
                                  Images for {colorItem.name || 'this color'} (Max 4)
                                </label>
                                <span className="text-xs text-slate-500">
                                  {colorItem.images?.length || 0}/4 uploaded
                                </span>
                              </div>
                              
                              {/* Existing Images (if editing) */}
                              {form.isEditing && colorItem.existingImages && colorItem.existingImages.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs text-slate-600 mb-2">Current images:</p>
                                  <div className="flex gap-2 flex-wrap">
                                    {colorItem.existingImages.map((img, imgIdx) => (
                                      <img
                                        key={imgIdx}
                                        src={optimizeImage(img, 'thumbnail')}
                                        alt={`${colorItem.name} ${imgIdx + 1}`}
                                        className="w-16 h-16 object-cover rounded border border-slate-200"
                                        loading="lazy"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Image Upload */}
                              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-slate-400 transition-colors">
                                <div className="text-center">
                                  <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleColorImageUpload(index, e.target.files)}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-600 file:text-white hover:file:bg-slate-700 file:cursor-pointer"
                                  />
                                  <p className="text-xs text-slate-500 mt-1">
                                    {form.isEditing ? 'Upload new images (will replace existing)' : 'Select up to 4 images for this color'}
                                  </p>
                                </div>
                              </div>

                              {/* Preview selected images */}
                              {colorItem.images && colorItem.images.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs text-slate-600 mb-2">Selected images:</p>
                                  <div className="flex gap-2 flex-wrap">
                                    {Array.from(colorItem.images).slice(0, 4).map((file, imgIdx) => (
                                      <div key={imgIdx} className="relative">
                                        <img
                                          src={URL.createObjectURL(file)}
                                          alt={`Preview ${imgIdx + 1}`}
                                          className="w-16 h-16 object-cover rounded border border-slate-200"
                                        />
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                                          {imgIdx + 1}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  {colorItem.images.length > 4 && (
                                    <p className="text-xs text-orange-600 mt-1">
                                      Only first 4 images will be uploaded
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                        {form.isEditing && form.hero_image_url ? (
                          <div className="space-y-4">
                            <img 
                              src={optimizeImage(form.hero_image_url, 'product')} 
                              alt="Current hero" 
                              className="w-48 h-48 object-cover rounded-lg border border-slate-200 mx-auto"
                              loading="lazy"
                            />
                            <p className="text-sm text-slate-600">Current Hero Image</p>
                          </div>
                        ) : (
                          <ImageIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        )}
                        <div className="space-y-2 mt-4">
                          <input
                            type="file"
                            name="hero_image"
                            accept="image/*"
                            onChange={handleChange}
                            required={!form.isEditing}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                          />
                          <p className="text-sm text-slate-500">
                            {form.isEditing ? 'Upload new hero image (optional)' : 'PNG, JPG, GIF up to 10MB'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Tips */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image Upload Guidelines
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Hero image: Main product photo (required)</li>
                      <li>• Color images: Up to 4 images per color variation</li>
                      <li>• Each color can have different images showing that specific color</li>
                      <li>• Use high-quality images for best results</li>
                      <li>• Square images work best for consistent display</li>
                      <li>• JPG, PNG, GIF formats supported</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
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
                      {form.isEditing ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add Product
                        </>
                      )}
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
            <>
              <div className="divide-y divide-slate-200">
                {products.map((product) => (
                <div key={product.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={optimizeImage(product.hero_image_url, 'thumbnail')}
                        alt={product.title}
                        className="w-full lg:w-32 h-48 lg:h-32 object-cover rounded-lg border border-slate-200"
                        loading="lazy"
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
                            {product.colors && product.colors.length > 0 && (
                              <div className="sm:col-span-2 lg:col-span-3">
                                <span className="text-slate-600 block mb-2">Colors:</span>
                                <div className="flex flex-wrap gap-2">
                                  {product.colors.map((colorItem, idx) => (
                                    <div key={idx} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                                      <div 
                                        className="w-3 h-3 rounded-full border border-slate-300"
                                        style={{ backgroundColor: colorItem.color }}
                                        title={colorItem.name}
                                      ></div>
                                      <span className="text-xs font-medium text-slate-900">{colorItem.name}</span>
                                      <span className="text-xs text-slate-400 font-mono">({colorItem.color})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
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
                        <div className="flex-shrink-0 space-y-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium w-full"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium w-full"
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
            
            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="p-6 text-center border-t border-slate-200">
                <button
                  onClick={loadMoreProducts}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Products'
                  )}
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;