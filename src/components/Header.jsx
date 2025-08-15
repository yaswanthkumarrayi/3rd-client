import React, { useState, useEffect } from 'react';
import { User, ShoppingCart, Menu, X, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Register from '../pages/Register';
import { useNavigate } from "react-router-dom";
import Login from '../pages/Login';

const Header = () => {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  
  useEffect(() => {
    // Initial load
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartCount(items.length);

    // Listen for cart changes from other tabs/windows
    const handleStorage = () => {
      const updatedItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartCount(updatedItems.length);
    };
    window.addEventListener("storage", handleStorage);

    // Listen for custom cart update events (for same tab)
    const handleCartUpdate = () => {
      const updatedItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartCount(updatedItems.length);
    };
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    // Get current Supabase user
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if click is outside BOTH the menu and the button
      if (
        showMobileMenu &&
        !event.target.closest('.mobile-menu') &&
        !event.target.closest('.mobile-menu-button')
      ) {
        setShowMobileMenu(false);
      }
      if (
        showUserMenu &&
        !event.target.closest('.user-menu') &&
        !event.target.closest('.user-button')
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMobileMenu, showUserMenu]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowUserMenu(false);
    navigate("/");
  };

  const menuItems = [
    { name: 'Sarees', href: '#sarees' },
    { name: 'Lehengas', href: '#lehengas' },
    { name: 'Childware', href: '#childware' }
  ];

  return (
    <>
      <header className="bg-white shadow-lg fixed top-0 left-0 w-full z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-fuchsia-900 via-fuchsia-800 to-yellow-700 bg-clip-text text-transparent font-heading">
                  Ashok Kumar
                </h1>
                <p className="text-xs lg:text-sm bg-gray-600 bg-clip-text text-transparent font-medium -mt-1">
                  Textiles
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-800 hover:text-fuchsia-600 font-medium transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fuchsia-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </nav>

            {/* Actions Section */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (!user) {
                      setShowRegister(true);
                    } else {
                      setShowUserMenu((prev) => !prev);
                    }
                  }}
                  className="user-button flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 text-gray-700 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-full transition-all duration-200 transform hover:scale-105"
                >
                  <User size={20} />
                </button>

                {/* Enhanced User Dropdown */}
                {showUserMenu && user && (
                  <div className="user-menu fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm lg:absolute lg:right-0 lg:mt-3 lg:w-72 lg:bg-white lg:rounded-lg lg:shadow-xl lg:border lg:border-gray-200 lg:py-2">
                    {/* User Info Header */}
                    <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-fuchsia-50 to-purple-50 rounded-t-2xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full shadow-md">
                          <User size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate text-sm">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-500">Welcome back!</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      {/* Profile Information */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/user");
                        }}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-purple-50 hover:text-fuchsia-700 transition-all duration-200 flex items-center space-x-3 group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-fuchsia-100 rounded-full transition-colors duration-200">
                          <Settings size={16} />
                        </div>
                        <span className="font-medium">Profile Settings</span>
                      </button>

                      {/* Your Orders */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/orders");
                        }}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-purple-50 hover:text-fuchsia-700 transition-all duration-200 flex items-center space-x-3 group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-fuchsia-100 rounded-full transition-colors duration-200">
                          <ShoppingBag size={16} />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">Your Orders</span>
                          <p className="text-xs text-gray-500">Track & manage orders</p>
                        </div>
                      </button>

                      Your Cart
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/cart");
                        }}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-purple-50 hover:text-fuchsia-700 transition-all duration-200 flex items-center space-x-3 group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-fuchsia-100 rounded-full transition-colors duration-200 relative">
                          <ShoppingCart size={16} />
                          {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-fuchsia-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                              {cartCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">Shopping Cart</span>
                          <p className="text-xs text-gray-500">
                            {cartCount === 0 ? 'Empty cart' : `${cartCount} item${cartCount > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </button>

                      {/* Divider */}
                      <div className="border-t border-gray-100 my-2"></div>

                      {/* Sign Out */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center space-x-3 group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-red-100 group-hover:bg-red-200 rounded-full transition-colors duration-200">
                          <LogOut size={16} />
                        </div>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <div className="relative">
                <button
                  onClick={() => navigate("/cart")}
                  className="flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 text-gray-700 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-full transition-all duration-200 transform hover:scale-105"
                >
                  <ShoppingCart size={20} />
                </button>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="mobile-menu-button lg:hidden flex items-center justify-center w-10 h-10 text-gray-700 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-full transition-all duration-200 transform hover:scale-105"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {showMobileMenu && (
          <div
            className="mobile-menu fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          >
            <div
              className="absolute top-16 left-0 w-full bg-white shadow-2xl max-h-[calc(100vh-4rem)] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-4 py-6 space-y-2">
                {/* Navigation Links */}
                <div className="space-y-1">
                  {menuItems.map((item, index) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className="block px-4 py-4 text-gray-800 hover:text-fuchsia-600 hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-200 transform hover:translate-x-1"
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>

                {/* User Section for Mobile */}
                {user && (
                  <>
                    <div className="border-t border-gray-200 my-4"></div>
                    <div className="space-y-1">
                      <div className="px-4 py-3 bg-gradient-to-r from-fuchsia-50 to-purple-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full">
                            <User size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm truncate max-w-48">
                              {user.email}
                            </p>
                            <p className="text-xs text-gray-500">Account Menu</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          navigate("/user");
                        }}
                        className="w-full px-4 py-4 text-left text-gray-700 hover:text-fuchsia-600 hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3"
                      >
                        <Settings size={18} />
                        <span>Profile Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          navigate("/orders");
                        }}
                        className="w-full px-4 py-4 text-left text-gray-700 hover:text-fuchsia-600 hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3"
                      >
                        <ShoppingBag size={18} />
                        <span>Your Orders</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          navigate("/cart");
                        }}
                        className="w-full px-4 py-4 text-left text-gray-700 hover:text-fuchsia-600 hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-purple-50 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3"
                      >
                        <ShoppingCart size={18} />
                        <div className="flex items-center space-x-2">
                          <span>Shopping Cart</span>
                          {cartCount > 0 && (
                            <span className="bg-fuchsia-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                              {cartCount}
                            </span>
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-4 text-left text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Register Modal */}
      {showRegister && (
        <Register
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      {/* Login Modal */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}
    </>
  );
};

export default Header;