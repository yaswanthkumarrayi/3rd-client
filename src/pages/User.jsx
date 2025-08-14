import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { User as UserIcon, LogOut, Settings, Package, Heart, MapPin, CreditCard } from 'lucide-react';
import Register from './Register';

const User = () => {
  const [user, loading, error] = useAuthState(auth);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-8 h-8 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <p className="text-red-600 mb-4">Authentication Error</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white px-6 py-2 rounded-lg hover:from-fuchsia-700 hover:to-fuchsia-800 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <UserIcon size={32} className="text-fuchsia-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to EliteWear</h2>
          <p className="text-gray-600 mb-6">Join our premium fashion community to unlock exclusive features</p>
          
          <button
            onClick={() => setShowRegister(true)}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-fuchsia-200 mb-4"
          >
            Create Account
          </button>
          
          <button
            onClick={() => setShowRegister(true)}
            className="w-full bg-white border-2 border-fuchsia-600 text-fuchsia-600 hover:bg-fuchsia-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            Sign In
          </button>
        </div>

        {showRegister && (
          <Register
            onClose={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false);
              // Handle switch to login
            }}
          />
        )}
      </div>
    );
  }

  const tabItems = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* User Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-20 h-20 flex items-center justify-center">
              <UserIcon size={32} className="text-fuchsia-600" />
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{user.displayName || 'Fashion Enthusiast'}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-fuchsia-600 mt-1">Premium Member since {new Date(user.metadata.creationTime).getFullYear()}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabItems.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'text-fuchsia-600 border-b-2 border-fuchsia-600 bg-fuchsia-50'
                        : 'text-gray-600 hover:text-fuchsia-600 hover:bg-fuchsia-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      defaultValue={user.displayName || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <button className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white px-6 py-2 rounded-lg transition-all duration-200">
                  Update Profile
                </button>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                <button className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white px-6 py-2 rounded-lg">
                  Start Shopping
                </button>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="text-center py-12">
                <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Your Wishlist is Empty</h3>
                <p className="text-gray-600 mb-4">Save items you love to your wishlist</p>
                <button className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white px-6 py-2 rounded-lg">
                  Browse Products
                </button>
              </div>
            )}

            {['addresses', 'payment', 'settings'].includes(activeTab) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">Coming Soon</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Feature in Development</h3>
                <p className="text-gray-600">This feature will be available soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;