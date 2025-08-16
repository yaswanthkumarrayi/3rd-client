import React, { useState, useEffect } from 'react';
import { User, ShoppingCart, Menu, X, LogOut, Settings, ShoppingBag, Bell } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Register from '../pages/Register';
import { useNavigate } from "react-router-dom";
import Login from '../pages/Login';
import { Heart } from 'lucide-react';

const Header = () => {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Initial cart load
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);

    // Listen for cart changes
    const handleStorage = () => {
      const updatedItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const updatedCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(updatedCount);
    };
    const handleCartUpdate = () => {
      const updatedItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const updatedCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(updatedCount);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
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
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-fuchsia-100' 
          : 'bg-white/90 backdrop-blur-md shadow-md border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="text-center transform group-hover:scale-105 transition-all duration-300">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-fuchsia-900 via-fuchsia-800 to-fuchsia-600 bg-clip-text text-transparent font-heading">
                  Ashok Kumar
                </h1>
                <p className="text-xs lg:text-sm text-fuchsia-600/80 font-medium -mt-1">
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
                  className="text-gray-700 hover:text-fuchsia-600 font-medium transition-all duration-300 relative group py-2"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </nav>

            {/* Actions Section */}
            <div className="flex items-center space-x-2 lg:space-x-3">
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
                  className="user-button relative flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 text-gray-700 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <User size={20} />
                  {user && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {/* Enhanced User Dropdown */}
                {showUserMenu && user && (
                  <div className="user-menu absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-fuchsia-100 py-2 z-50 animate-fade-in-up">
                    {/* User Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-fuchsia-50 to-pink-50 border-b border-fuchsia-100 rounded-t-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{user.email}</p>
                          <p className="text-sm text-fuchsia-600">Welcome back!</p>
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
                        className="w-full px-6 py-3 text-left text-gray-800 hover:bg-fuchsia-50 hover:text-fuchsia-600 transition-all duration-200 flex items-center space-x-4 group"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                          <Settings size={18} className="text-blue-600" />
                        </div>
                        <span className="font-medium">Profile Information</span>
                      </button>

                      {/* Your Orders */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/orders");
                        }}
                        className="w-full px-6 py-3 text-left text-gray-800 hover:bg-fuchsia-50 hover:text-fuchsia-600 transition-all duration-200 flex items-center space-x-4 group"
                      >
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                          <ShoppingBag size={18} className="text-purple-600" />
                        </div>
                        <span className="font-medium">Your Orders</span>
                      </button>

                      {/* Your Cart */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/cart");
                        }}
                        className="w-full px-6 py-3 text-left text-gray-800 hover:bg-fuchsia-50 hover:text-fuchsia-600 transition-all duration-200 flex items-center space-x-4 group"
                      >
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                          <ShoppingCart size={18} className="text-green-600" />
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">Your Cart</span>
                          {cartCount > 0 && (
                            <span className="bg-fuchsia-600 text-white text-xs rounded-full px-2.5 py-1 font-bold">
                              {cartCount}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>

                    <div className="border-t border-fuchsia-100 pt-2">
                      {/* Sign Out */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 text-left text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center space-x-4 group"
                      >
                        <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
                          <LogOut size={18} className="text-red-600" />
                        </div>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Cart Icon */}
              <div className="relative">
                <button
                  onClick={() => navigate("/cart")}
                  className="relative flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 text-gray-700 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <>
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                        {cartCount}
                      </span>
                      <span className="absolute -top-2 -right-2 bg-fuchsia-400 rounded-full w-6 h-6 animate-ping opacity-75"></span>
                    </>
                  )}
                </button>
              </div>
                  <div className="relative">
                    <button
                      onClick={() => navigate("/wishlist")}
                      className="flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 text-gray-700 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl transition-all duration-300 transform hover:scale-105 group"
                      title="Wishlist"
                    >
                      <Heart size={20} />
                      {/* Optional: Show count of wishlisted items */}
                      {localStorage.getItem("wishlistItems") &&
                        JSON.parse(localStorage.getItem("wishlistItems")).length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {JSON.parse(localStorage.getItem("wishlistItems")).length}
                          </span>
                        )}
                    </button>
                  </div>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="mobile-menu-button lg:hidden flex items-center justify-center w-10 h-10 text-gray-700 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {showMobileMenu && (
          <div className="mobile-menu lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in">
            <div 
              className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-b border-fuchsia-100 animate-slide-down"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-3 text-gray-800 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl font-medium transition-all duration-200 border border-transparent hover:border-fuchsia-200"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      {showRegister && (
        <Register
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;