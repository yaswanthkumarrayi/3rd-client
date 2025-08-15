import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Register from "./Register";
import { ArrowLeft, User as UserIcon, Mail, Phone, MapPin, Building, Hash, Home, Save, Loader, Edit3, X, Check } from "lucide-react";

const User = () => {
  const [user, setUser] = useState({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    checkAuthAndFetch();
    // eslint-disable-next-line
  }, []);

async function checkAuthAndFetch() {
    setLoading(true);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);
    setAuthUser(data.user);
    const email = data.user.email;
    await fetchUser(email);
  }

async function fetchUser(email) {
    if (!email) return;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user:", error);
      } else if (data) {
        setUser(data);
      } else {
        setUser(prev => ({ ...prev, email }));
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  }



  function handleChange(e) {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function validateForm() {
    const newErrors = {};
    
    if (!user.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    if (!user.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(user.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    
    if (!user.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!user.state.trim()) {
      newErrors.state = "State is required";
    }
    
    if (!user.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(user.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }
    
    if (!user.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave(e) {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setSaving(true);
  setSuccessMessage("");

  try {
    const { full_name, phone, city, state, pincode, address, email } = user;
    const upsertData = {
      full_name,
      phone,
      city,
      state,
      pincode,
      address,
      email,
    };

    // Use upsert so it creates or updates the user row
    const { error } = await supabase
  .from("users")
  .upsert([{
    full_name,
    phone,
    city,
    state,
    pincode,
    address,
    email, // must be NOT NULL and UNIQUE
  }], { onConflict: ['email'] });

    if (error) {
      setErrors({ general: "Error updating profile: " + error.message });
    } else {
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  } catch (error) {
    setErrors({ general: "Error updating profile: " + error.message });
  } finally {
    setSaving(false);
  }
}

  function handleEdit() {
    setIsEditing(true);
    setErrors({});
    setSuccessMessage("");
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setErrors({});
    setSuccessMessage("");
    // Reset form to original values
    fetchUser(user.email, user.phone);
  }
  function handleBack() {
    window.history.back();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <Register />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:py-8 lg:py-12">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back</span>
        </button>

        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <UserIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Keep your information up to date to ensure the best experience
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-800 font-medium text-center">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 font-medium text-center">{errors.general}</p>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Edit/View Toggle */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Profile' : 'Profile Information'}
              </h2>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave}>
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                      <UserIcon className="w-4 h-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={user.full_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 ${
                        errors.full_name ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && (
                      <p className="mt-2 text-sm text-red-600">{errors.full_name}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={user.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 ${
                        errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      placeholder="Email address"
                    />
                    <p className="mt-2 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* City */}
                  <div>
                    <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                      <Building className="w-4 h-4" />
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={user.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 ${
                        errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'
                      }`}
                      placeholder="Enter your city"
                    />
                    {errors.city && (
                      <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                      <MapPin className="w-4 h-4" />
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={user.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 ${
                        errors.state ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'
                      }`}
                      placeholder="Enter your state"
                    />
                    {errors.state && (
                      <p className="mt-2 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                      <Hash className="w-4 h-4" />
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={user.pincode}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 ${
                        errors.pincode ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'
                      }`}
                      placeholder="Enter your pincode"
                      maxLength="6"
                    />
                    {errors.pincode && (
                      <p className="mt-2 text-sm text-red-600">{errors.pincode}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                      <Home className="w-4 h-4" />
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={user.address}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none bg-white text-gray-900 ${
                        errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'
                      }`}
                      placeholder="Enter your complete address"
                    />
                    {errors.address && (
                      <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 sm:flex-none sm:min-w-[200px] px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
                    >
                      {saving ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-900 font-medium">
                    {user.full_name || 'Not provided'}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-900 font-medium">
                    {user.phone || 'Not provided'}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-900 font-medium">
                    {user.email}
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <Building className="w-4 h-4" />
                    City
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-900 font-medium">
                    {user.city || 'Not provided'}
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <MapPin className="w-4 h-4" />
                    State
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-900 font-medium">
                    {user.state || 'Not provided'}
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <Hash className="w-4 h-4" />
                    Pincode
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-900 font-medium">
                    {user.pincode || 'Not provided'}
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <Home className="w-4 h-4" />
                    Address
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-900 font-medium min-h-[100px] whitespace-pre-wrap">
                    {user.address || 'Not provided'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Your information is secure and will only be used to provide better services
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default User;