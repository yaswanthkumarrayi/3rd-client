import React, { useState } from 'react';
import { User, ShoppingCart, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const menuItems = [
    { name: 'Sarees', href: '#sarees' },
    { name: 'Lehengas', href: '#lehengas' },
    { name: 'Child Wear', href: '#childwear' }
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-500 via-pink-600 to-yellow-500 bg-clip-text text-transparent">
                Ashok textiles
              </h1>
              <p className="hidden lg:block text-sm text-gray-600 font-medium -mt-1">
                Premium Fashion Collection
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-yellow-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Right Icons Section */}
          <div className="flex items-center space-x-4">
            {/* User Icon */}
            <button className="p-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all duration-200">
              <User size={24} />
            </button>

            {/* Cart Icon */}
            <button className="p-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all duration-200 relative">
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                3
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all duration-200"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-3">
              {menuItems.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200 font-medium"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <span className="ml-2">{item.name}</span>
                </a>
              ))}
              
              {/* Mobile Sub-heading */}
              <div className="px-4 pt-3 border-t border-gray-100 mt-3">
                <p className="text-sm text-gray-500 font-medium">
                  Premium Fashion Collection
                </p>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;