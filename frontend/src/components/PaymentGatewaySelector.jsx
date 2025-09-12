import React, { useState } from 'react';
import { CreditCard, Building2, Shield, Zap } from 'lucide-react';

const PaymentGatewaySelector = ({ onGatewaySelect, selectedGateway }) => {
  const gateways = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Quick and secure payments with multiple options',
      icon: Zap,
      features: ['UPI', 'Cards', 'Net Banking', 'Wallets'],
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      activeColor: 'bg-blue-100 border-blue-400',
      processing: 'Instant processing'
    },
    {
      id: 'hdfc',
      name: 'HDFC Bank',
      description: 'Secure bank-grade payment processing',
      icon: Building2,
      features: ['Credit/Debit Cards', 'Net Banking', 'Bank Security'],
      color: 'bg-green-50 border-green-200 text-green-800',
      activeColor: 'bg-green-100 border-green-400',
      processing: 'Bank-grade security'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Choose Payment Gateway</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {gateways.map((gateway) => {
          const Icon = gateway.icon;
          const isSelected = selectedGateway === gateway.id;
          
          return (
            <div
              key={gateway.id}
              onClick={() => onGatewaySelect(gateway.id)}
              className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? `${gateway.activeColor} ring-2 ring-offset-2 ring-blue-500` 
                  : `${gateway.color} hover:border-gray-300 hover:shadow-md`
                }
              `}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${isSelected ? 'bg-white' : 'bg-white/50'}`}>
                  <Icon className="h-6 w-6 text-gray-700" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-900">{gateway.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{gateway.description}</p>
                  
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Supported Methods:</p>
                    <div className="flex flex-wrap gap-1">
                      {gateway.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-white/70 text-gray-700 rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">{gateway.processing}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedGateway && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {selectedGateway === 'razorpay' ? 'Razorpay' : 'HDFC Bank'} gateway selected
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            You will be redirected to the secure payment page to complete your transaction.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentGatewaySelector;