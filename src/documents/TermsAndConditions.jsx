import React from "react";

const SectionTitle = ({ children }) => (
  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-700 via-pink-500 to-yellow-400 bg-clip-text text-transparent mb-4 mt-8">
    {children}
  </h2>
);

const TermsAndConditions = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-10">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-700 via-pink-500 to-yellow-400 bg-clip-text text-transparent mb-6 text-center">
        Terms & Conditions
      </h1>
      <p class="mobile-text text-muted-foreground max-w-2xl mx-auto">Please read these terms and conditions carefully before using our website or purchasing our products. By accessing or using Ashok Kumar Textiles, you agree to be bound by these terms.</p>
      <p className="text-sm text-gray-500 mb-2 text-center">Last updated: August 14, 2025</p>
      <SectionTitle>Acceptance of Terms</SectionTitle>
      <p className="text-gray-700 mb-4">
        By accessing and using the VedhaTrendz website, placing orders, or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our website or services.
      </p>
      <SectionTitle>Important Notice</SectionTitle>
      <ul className="list-disc ml-6 text-pink-700 mb-4">
        <li>⚠️ <span className="font-semibold">STRICTLY NO CANCELLATION</span> after payment is completed</li>
        <li>⚠️ <span className="font-semibold">NO RETURNS</span> - Exchange (same dress) applicable only if damage is shown in unpacking video</li>
      </ul>
      <SectionTitle>Order and Payment Terms</SectionTitle>
      <p className="text-gray-700 mb-2 font-semibold">Payment Processing</p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>All payments are processed securely through Razorpay</li>
        <li>We accept major credit cards, debit cards, UPI, and net banking</li>
        <li>Prices are listed in Indian Rupees (INR) and include applicable taxes</li>
        <li>Payment must be completed at the time of placing the order</li>
      </ul>
      <p className="text-gray-700 mb-2 font-semibold">Order Confirmation</p>
      <p className="text-gray-700 mb-4">
        Once your payment is successfully processed, you will receive an order confirmation email. This confirmation constitutes acceptance of your order and creates a binding contract between you and VedhaTrendz.
      </p>
      <p className="text-gray-700 mb-2 font-semibold">Pricing and Availability</p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>All prices are subject to change without notice</li>
        <li>Product availability is subject to stock levels</li>
        <li>We reserve the right to limit order quantities</li>
        <li>In case of pricing errors, we reserve the right to cancel the order</li>
      </ul>
      <SectionTitle>Shipping and Delivery</SectionTitle>
      <p className="text-gray-700 mb-2 font-semibold">Processing Time</p>
      <p className="text-gray-700 mb-4">Order processing time is 2-3 working days before dispatch.</p>
      <p className="text-gray-700 mb-2 font-semibold">Delivery Timeline</p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>India: 8-9 working days after dispatch</li>
        <li>International: 10-12 working days after dispatch</li>
        <li>Free shipping available all over India</li>
      </ul>
      <p className="text-gray-700 mb-2 font-semibold">Delivery Conditions</p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>If door delivery is not possible, customers must collect the package from the courier service</li>
        <li>If a package shows "delivered" but you haven't received it, please visit the nearest courier branch</li>
        <li>Delivery address cannot be changed once the order is shipped</li>
      </ul>
      <SectionTitle>Returns and Exchange Policy</SectionTitle>
      <p className="text-gray-700 mb-2 font-semibold">No Returns Policy</p>
      <p className="text-gray-700 mb-4">We have a strict NO RETURNS policy. All sales are final.</p>
      <p className="text-gray-700 mb-2 font-semibold">Exchange Policy</p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Damage is clearly shown in the unpacking video</li>
        <li>The unpacking video must be recorded continuously from package opening to product inspection</li>
        <li>Exchange request must be raised within 24 hours of delivery</li>
        <li>Product must be unused and in original packaging</li>
      </ul>
      <p className="text-gray-700 mb-2 font-semibold">What is NOT considered damage</p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Personal preference (like or dislike of the product)</li>
        <li>Minor issues like loose threads</li>
        <li>Removable stains or spots</li>
        <li>Missing stitching that doesn't affect product integrity</li>
        <li>Slight color variations due to digital photography or screen settings</li>
        <li>Color differences due to lighting conditions</li>
      </ul>
      <p className="text-gray-700 mb-2 font-semibold">Exchange Process</p>
      <p className="text-gray-700 mb-4">
        If your exchange request is approved, you will need to courier the dress back to us. Shipping charges for the return will be paid by VedhaTrendz if the damage is confirmed.
      </p>
      <SectionTitle>Product Information and Accuracy</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>We strive to provide accurate product descriptions, images, and specifications</li>
        <li>Colors may vary slightly due to monitor settings and lighting conditions</li>
        <li>Product images are for illustration purposes and may not reflect exact appearance</li>
        <li>We reserve the right to make changes to product specifications without notice</li>
        <li>Size charts are provided as guidelines; actual measurements may vary slightly</li>
      </ul>
      <SectionTitle>User Responsibilities</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Provide accurate and complete information when placing orders</li>
        <li>Use the website in compliance with applicable laws and regulations</li>
        <li>Not engage in fraudulent or unauthorized activities</li>
        <li>Respect intellectual property rights</li>
        <li>Not attempt to damage or disrupt our website or services</li>
        <li>Keep your account credentials secure and confidential</li>
      </ul>
      <SectionTitle>Intellectual Property Rights</SectionTitle>
      <p className="text-gray-700 mb-4">
        All content on this website, including text, graphics, logos, images, and software, is the property of VedhaTrendz or its content suppliers and is protected by Indian and international copyright laws. You may not reproduce, distribute, or use any content without our express written permission.
      </p>
      <SectionTitle>Privacy and Data Protection</SectionTitle>
      <p className="text-gray-700 mb-4">
        Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
      </p>
      <SectionTitle>Limitation of Liability</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Any indirect, incidental, special, or consequential damages</li>
        <li>Loss of profits, data, or business opportunities</li>
        <li>Damages resulting from website downtime or technical issues</li>
        <li>Damages caused by third-party services or shipping partners</li>
        <li>Any amount exceeding the total amount paid for the relevant order</li>
      </ul>
      <SectionTitle>Governing Law and Jurisdiction</SectionTitle>
      <p className="text-gray-700 mb-4">
        These Terms and Conditions are governed by the laws of India. Any disputes arising from these terms or your use of our website shall be subject to the exclusive jurisdiction of the courts in Andhra Pradesh, India.
      </p>
      <SectionTitle>Modifications to Terms</SectionTitle>
      <p className="text-gray-700 mb-4">
        We reserve the right to modify these Terms and Conditions at any time without prior notice. Changes will be effective immediately upon posting on our website. Your continued use of our website after any modifications constitutes acceptance of the revised terms.
      </p>
      <SectionTitle>Severability</SectionTitle>
      <p className="text-gray-700 mb-4">
        If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions shall continue to be valid and enforceable to the fullest extent permitted by law.
      </p>
      <SectionTitle>Contact Information</SectionTitle>
      <div className="bg-pink-50 rounded-lg p-4 mb-2">
        <p className="text-pink-700 font-semibold mb-1">Email: <span className="font-normal">ashokkumartextiles@gmail.com</span></p>
        <p className="text-pink-700 font-semibold mb-1">Phone: <span className="font-normal">+91 9704447158</span></p>
        <p className="text-pink-700 font-semibold mb-1">Address: <span className="font-normal">Vijayawada, Andhra Pradesh, India</span></p>
        <p className="text-pink-700 font-semibold">Business Hours: <span className="font-normal">Monday to Saturday, 10:00 AM to 6:00 PM (IST)</span></p>
      </div>
    </div>
  </div>
);

export default TermsAndConditions;