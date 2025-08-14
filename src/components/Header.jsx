import React, { useState, useEffect } from 'react';
import { User, ShoppingCart, Menu, X, LogOut, Settings, Package } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import Register from '../pages/Register';

const Header = () => {
  const [user, loading] = useAuthState(auth);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu') && !event.target.closest('.user-button')) {
        setShowUserMenu(false);
      }
      if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { name: 'Sarees', href: '#sarees' },
    { name: 'Lehengas', href: '#lehengas' },
    { name: 'Childware', href: '#childware' }
  ];

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200">
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
                    if (!user && !loading) {
                      setShowRegister(true);
                    } else {
                      setShowUserMenu(!showUserMenu);
                    }
                  }}
                  className="user-button flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 text-black hover:text-fuchsia-600 transition-all duration-200 transform hover:scale-105"
                >
                  <User size={20} />
                </button>

                {/* User Dropdown */}
                {showUserMenu && user && (
                  <div className="user-menu absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <User size={18} className="text-fuchsia-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.displayName || 'User'}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button className="w-full px-4 py-3 text-left text-gray-800 hover:bg-fuchsia-50 hover:text-fuchsia-600 transition-colors duration-200 flex items-center space-x-3">
                        <Package size={18} />
                        <span>My Orders</span>
                      </button>
                      <button className="w-full px-4 py-3 text-left text-gray-800 hover:bg-fuchsia-50 hover:text-fuchsia-600 transition-colors duration-200 flex items-center space-x-3">
                        <Settings size={18} />
                        <span>Account Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <div className="relative">
                <button className="flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 text-black hover:text-fuchsia-600 transition-all duration-200 transform hover:scale-105">
                  <ShoppingCart size={20} />
                </button>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-fuchsia-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="mobile-menu-button lg:hidden flex items-center justify-center w-10 h-10 text-black hover:text-fuchsia-600 transition-all duration-200 transform hover:scale-105"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="mobile-menu lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 text-gray-800 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg font-medium transition-all duration-200"
                >
                  {item.name}
                </a>
              ))}
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
            // Handle switch to login if you have a login component
          }}
        />
      )}
    </>
  );
};

export default Header;