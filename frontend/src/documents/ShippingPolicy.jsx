import React from "react";

const SectionTitle = ({ children }) => (
  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-700 via-pink-500 to-yellow-400 bg-clip-text text-transparent mb-4 mt-8">
    {children}
  </h2>
);

const ShippingPolicy = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-10">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-700 via-pink-500 to-yellow-400 bg-clip-text text-transparent mb-6 text-center">
        Shipping Policy
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto mb-2 text-center">
        We are committed to delivering your beautiful sarees safely and efficiently. Learn about our shipping process, timelines, and policies below.
      </p>
      <p className="text-sm text-gray-500 mb-2 text-center">Last updated: August 14, 2025</p>
      
      <SectionTitle>Free Shipping All Over India! 🇮🇳</SectionTitle>
      <p className="text-pink-700 font-semibold mb-4 text-center">
        Enjoy complimentary shipping on all orders within India, no minimum order value required.
      </p>
      
      <SectionTitle>Order Processing Time</SectionTitle>
      <p className="text-gray-700 mb-2 font-semibold">Standard Processing</p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>2-3 working days before dispatch</li>
        <li>Includes order verification, quality check, and careful packaging of your saree</li>
      </ul>
      <p className="text-gray-700 mb-4">
        <span className="font-semibold">What We Do:</span>
        <ul className="list-disc ml-6">
          <li>Quality inspection</li>
          <li>Careful packaging</li>
          <li>Order verification</li>
          <li>Label preparation</li>
        </ul>
        <span className="block mt-2 text-sm text-gray-500">
          Note: Processing time excludes weekends and public holidays. Orders placed on Friday evening or weekends will be processed starting the next working day.
        </span>
      </p>
      
      <SectionTitle>Delivery Timeline</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Domestic Shipping (India): 8-9 working days after dispatch</li>
        <li>Free shipping nationwide 🚚</li>
      </ul>
      
      <SectionTitle>Factors Affecting Delivery Time</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Weather conditions and natural disasters</li>
        <li>Peak season demand (festivals, holidays)</li>
        <li>Remote location accessibility</li>
        <li>Local courier service schedules</li>
      </ul>
      
      <SectionTitle>Shipping Coverage</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>We ship to all states and union territories in India</li>
        <li>Remote areas may take an additional 2-3 days for delivery</li>
      </ul>
      
      <SectionTitle>Our Shipping Partners</SectionTitle>
      <p className="text-gray-700 mb-4">
        We work with trusted shipping partners to ensure safe and timely delivery of your orders:
      </p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Blue Dart</li>
        <li>DTDC</li>
        <li>Ekart</li>
        <li>India Post</li>
        <li>XpressBees</li>
        <li>Delhivery</li>
      </ul>
      <p className="text-gray-700 mb-4">
        The shipping partner is selected based on your location and the fastest available service.
      </p>
      
      <SectionTitle>Delivery Process</SectionTitle>
      <ol className="list-decimal ml-6 mb-4 text-gray-700">
        <li>Order Confirmation: You'll receive an email confirmation with order details</li>
        <li>Processing & Packaging: 2-3 working days for quality check and packaging</li>
        <li>Dispatch Notification: Email with tracking details once shipped</li>
        <li>In Transit: Track your package using the provided tracking number</li>
        <li>Delivered: Package delivered to your doorstep</li>
      </ol>
      
      <SectionTitle>Important Delivery Information</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>
          <span className="font-semibold">Door Delivery Not Possible:</span> If door delivery is not possible, you will need to collect the package from the nearest courier service center.
        </li>
        <li>
          <span className="font-semibold">Package Shows Delivered:</span> If the tracking shows "delivered" but you haven't received the package, please visit the nearest courier branch immediately.
        </li>
        <li>
          <span className="font-semibold">Address Changes:</span> Delivery address cannot be changed once the order is shipped. Please ensure your address is correct before placing the order.
        </li>
      </ul>
      
      <SectionTitle>Tracking Your Order</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Email notification with tracking number</li>
        <li>SMS updates on delivery status</li>
        <li>WhatsApp notifications (if opted in)</li>
        <li>Direct link to track your package</li>
      </ul>
      <p className="text-gray-700 mb-4">
        <span className="font-semibold">Tip:</span> Keep your tracking number handy and check the status regularly for the most up-to-date delivery information.
      </p>
      
      <SectionTitle>Packaging Standards</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Acid-free tissue paper to protect fabric</li>
        <li>Moisture-resistant packaging materials</li>
        <li>Sturdy boxes to prevent damage during transit</li>
        <li>Fragile stickers for delicate items</li>
        <li>Eco-friendly packaging materials when possible</li>
      </ul>
      
      <SectionTitle>Shipping Support</SectionTitle>
      <div className="bg-pink-50 rounded-lg p-4 mb-2">
        <p className="text-pink-700 font-semibold mb-1">Email: <span className="font-normal">aktexmsp9@gmail.com</span></p>
        <p className="text-pink-700 font-semibold mb-1">Phone: <span className="font-normal">+91 9704447158</span></p>
        <p className="text-pink-700 font-semibold mb-1">WhatsApp: <span className="font-normal">+91 9652303183</span></p>
        <p className="text-pink-700 font-semibold">Support Hours: <span className="font-normal">Monday to Saturday, 10:00 AM to 6:00 PM (IST)</span></p>
      </div>
    </div>
  </div>
);

export default ShippingPolicy;