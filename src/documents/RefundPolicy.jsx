import React from "react";

const SectionTitle = ({ children }) => (
  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-700 via-pink-500 to-yellow-400 bg-clip-text text-transparent mb-4 mt-8">
    {children}
  </h2>
);

const RefundPolicy = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-10">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-700 via-pink-500 to-yellow-400 bg-clip-text text-transparent mb-6 text-center">
        Refund &amp; Exchange Policy
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto text-center">
        Please read our refund and exchange policy carefully. We strive to ensure your satisfaction while maintaining fair business practices.
      </p>
      <p className="text-sm text-gray-500 mb-2 text-center">Last updated: July 23, 2025</p>
      
      <SectionTitle>Important Policy Notice</SectionTitle>
      <ul className="list-disc ml-6 text-pink-700 mb-4">
        <li>⚠️ <span className="font-semibold">NO RETURNS POLICY</span> — All sales are final and non-refundable.</li>
        <li>⚠️ <span className="font-semibold">NO CANCELLATION</span> — Strictly no cancellation after payment is completed. Please review your order carefully before making payment.</li>
      </ul>

      <SectionTitle>Exchange Policy</SectionTitle>
      <p className="text-gray-700 mb-2 font-semibold">Limited Exchange Available</p>
      <p className="text-gray-700 mb-4">
        Exchange (same dress) is applicable <span className="font-semibold">ONLY</span> if damage is clearly shown in the unpacking video.
      </p>

      <SectionTitle>Exchange Eligibility Criteria</SectionTitle>
      <div className="mb-4">
        <p className="font-semibold text-green-700 mb-1">✅ Valid for Exchange</p>
        <ul className="list-disc ml-6 text-gray-700 mb-2">
          <li>Significant damage to the product clearly visible in unpacking video</li>
          <li>Manufacturing defects that affect product usability</li>
          <li>Wrong product delivered (different from order)</li>
          <li>Major color variations (not due to photography/screen differences)</li>
          <li>Torn or damaged fabric</li>
        </ul>
        <p className="font-semibold text-red-700 mb-1">❌ NOT Valid for Exchange</p>
        <ul className="list-disc ml-6 text-gray-700">
          <li>Personal preference (like or dislike of the product)</li>
          <li>Size issues or fitting problems</li>
          <li>Minor loose threads</li>
          <li>Removable stains or spots</li>
          <li>Missing stitching that doesn't affect product integrity</li>
          <li>Slight color variations due to digital photography or monitor settings</li>
          <li>Color differences due to lighting conditions</li>
          <li>Change of mind after purchase</li>
        </ul>
      </div>

      <SectionTitle>Unpacking Video Requirements</SectionTitle>
      <p className="text-gray-700 mb-2 font-semibold">🎥 Video Documentation Required</p>
      <p className="text-gray-700 mb-4">
        A complete unpacking video is mandatory for any exchange request. Without this video, exchanges cannot be processed.
      </p>
      <p className="text-gray-700 mb-2 font-semibold">Video Guidelines</p>
      <ul className="list-disc ml-6 text-gray-700 mb-4">
        <li>Record continuously: The video must be recorded continuously from package opening to product inspection</li>
        <li>Show package condition: Record the package before opening, including any visible damage</li>
        <li>Clear visibility: Ensure good lighting and clear visibility of the product and any damage</li>
        <li>Show all sides: Display the product from all angles, highlighting any issues</li>
        <li>No editing: The video must be unedited and continuous</li>
        <li>Time stamp: Video should be recorded within 24 hours of delivery</li>
        <li>File format: MP4, MOV, or AVI format (max 100MB)</li>
      </ul>
      <p className="text-pink-700 font-semibold mb-4">
        Important: If you don't record an unpacking video and later find damage, we cannot process any exchange request. The video serves as proof of the product's condition upon delivery.
      </p>

      <SectionTitle>Exchange Process</SectionTitle>
      <ol className="list-decimal ml-6 text-gray-700 mb-4 space-y-2">
        <li>
          <span className="font-semibold">Contact Us Within 24 Hours:</span> Email us at <span className="underline">ashokkumartextiles@gmail.com</span> with your order number and unpacking video.
        </li>
        <li>
          <span className="font-semibold">Review Process:</span> Our team will review your video and determine if the exchange is valid (2-3 business days).
        </li>
        <li>
          <span className="font-semibold">Approval Notification:</span> If approved, we'll provide return shipping instructions and a return label.
        </li>
        <li>
          <span className="font-semibold">Return Shipping:</span> Pack the item carefully and ship it back using the provided label (shipping costs covered by us).
        </li>
        <li>
          <span className="font-semibold">Exchange Processing:</span> Once received, we'll send a replacement item within 5-7 business days.
        </li>
      </ol>

      <SectionTitle>Return Shipping Information</SectionTitle>
      <p className="text-gray-700 mb-2 font-semibold">Who Pays for Shipping?</p>
      <ul className="list-disc ml-6 text-gray-700 mb-4">
        <li>If damage is confirmed: Ashok Kumar Textiles pays return shipping</li>
        <li>If exchange is denied: Customer pays return shipping (if item was sent back)</li>
      </ul>
      <p className="text-gray-700 mb-2 font-semibold">Return Packaging Requirements</p>
      <ul className="list-disc ml-6 text-gray-700 mb-4">
        <li>Use original packaging if available</li>
        <li>Pack securely to prevent damage during return shipping</li>
        <li>Include all original tags and accessories</li>
        <li>Add a copy of your order confirmation</li>
      </ul>

      <SectionTitle>Refund Information</SectionTitle>
      <p className="text-gray-700 mb-4">
        <span className="font-semibold">No Monetary Refunds:</span> We do not offer monetary refunds under any circumstances. Approved exchanges will only receive a replacement of the same product.
      </p>

      <SectionTitle>Payment Security</SectionTitle>
      <p className="text-gray-700 mb-4">
        All payments are processed securely through Razorpay. Once payment is completed, the transaction is final and cannot be reversed through our system.
      </p>

      <SectionTitle>Special Circumstances</SectionTitle>
      <ul className="list-disc ml-6 text-gray-700 mb-4">
        <li>
          <span className="font-semibold">Wrong Product Delivered:</span> If you receive a completely different product than what you ordered, we will exchange it for the correct item at no additional cost.
        </li>
        <li>
          <span className="font-semibold">Shipping Damage:</span> Damage that occurs during shipping and is clearly visible in your unpacking video will be eligible for exchange.
        </li>
        <li>
          <span className="font-semibold">Repeated Quality Issues:</span> If a replacement item also has quality issues, we will work with you to find a suitable solution, which may include store credit for future purchases.
        </li>
      </ul>

      <SectionTitle>Important Timelines</SectionTitle>
      <ul className="list-disc ml-6 text-gray-700 mb-4">
        <li><span className="font-semibold">Report Issue:</span> Within 24 hours of delivery</li>
        <li><span className="font-semibold">Review Process:</span> 2-3 business days</li>
        <li><span className="font-semibold">Return Item:</span> Within 7 days of approval</li>
        <li><span className="font-semibold">Replacement Dispatch:</span> 5-7 business days after receipt</li>
      </ul>

      <SectionTitle>Contact Us for Exchanges</SectionTitle>
      <div className="bg-pink-50 rounded-lg p-4 mb-2">
        <p className="text-pink-700 font-semibold mb-1">
          Email: <span className="font-normal">ashokkumartextiles@gmail.com</span>
        </p>
        <p className="text-pink-700 font-semibold mb-1">
          Phone: <span className="font-normal">+91 9704447158</span>
        </p>
        <p className="text-pink-700 font-semibold mb-1">
          Address: <span className="font-normal">Vijayawada, Andhra Pradesh, India</span>
        </p>
        <p className="text-pink-700 font-semibold">
          Support Hours: <span className="font-normal">Monday to Saturday, 10:00 AM to 6:00 PM (IST)</span>
        </p>
      </div>

      <SectionTitle>Policy Updates</SectionTitle>
      <p className="text-gray-700 mb-4">
        This refund and exchange policy may be updated from time to time. Any changes will be posted on this page with an updated date. Continued use of our website after changes constitutes acceptance of the revised policy.
      </p>
    </div>
  </div>
);
export default RefundPolicy;