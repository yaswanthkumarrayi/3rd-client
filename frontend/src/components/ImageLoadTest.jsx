/**
 * Image Loading Test Component - For debugging mobile image issues
 * Add this temporarily to any page to test image loading
 */
import React, { useState, useEffect } from 'react';
import FastImage from './FastImage';

const ImageLoadTest = () => {
  const [testResults, setTestResults] = useState([]);
  
  const testImages = [
    { 
      name: 'Good URL', 
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80' 
    },
    { 
      name: 'Slow URL', 
      url: 'https://httpbin.org/delay/3' 
    },
    { 
      name: 'Bad URL', 
      url: 'https://nonexistent-domain-12345.com/image.jpg' 
    },
    { 
      name: 'Local Fallback', 
      url: '/Designer.jpg' 
    }
  ];

  const handleImageLoad = (name) => {
    setTestResults(prev => [...prev, { name, status: 'loaded', time: Date.now() }]);
  };

  const handleImageError = (name) => {
    setTestResults(prev => [...prev, { name, status: 'error', time: Date.now() }]);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg m-4">
      <h3 className="text-lg font-semibold mb-4">📱 Mobile Image Loading Test</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {testImages.map((img, index) => (
          <div key={index} className="text-center">
            <div className="text-sm font-medium mb-2">{img.name}</div>
            <div className="w-full h-32 border rounded">
              <FastImage
                src={img.url}
                alt={img.name}
                size="thumbnail"
                onLoad={() => handleImageLoad(img.name)}
                onError={() => handleImageError(img.name)}
                fallback="/Designer.jpg"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Test Results:</h4>
        {testResults.length === 0 ? (
          <p className="text-gray-500">Testing image loading...</p>
        ) : (
          <ul className="text-sm space-y-1">
            {testResults.map((result, index) => (
              <li key={index} className={result.status === 'loaded' ? 'text-green-600' : 'text-red-600'}>
                ✓ {result.name}: {result.status}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
        <strong>Instructions:</strong> Check that all images show something (even if it's a fallback). 
        No blank spaces should appear on mobile.
      </div>
    </div>
  );
};

export default ImageLoadTest;