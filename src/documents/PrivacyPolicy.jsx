import React from "react";

const SectionTitle = ({ children }) => (
  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-700 via-pink-500 to-yellow-400 bg-clip-text text-transparent mb-4 mt-8">
    {children}
  </h2>
);

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-10">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-700 via-pink-500 to-yellow-400 bg-clip-text text-transparent mb-6 text-center">
        Privacy Policy
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto mb-2 text-center">
        At Ashok Kumar Textiles, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.
      </p>
      <p className="text-sm text-gray-500 mb-2 text-center">Last updated: August 14, 2025</p>
      
      <SectionTitle>Information We Collect</SectionTitle>
      <p className="text-gray-700 mb-2 font-semibold">Personal Information</p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Name, email address, and phone number</li>
        <li>Billing and shipping addresses</li>
        <li>Payment information (processed securely through Razorpay)</li>
        <li>Order history and preferences</li>
        <li>Account credentials and profile information</li>
      </ul>
      <p className="text-gray-700 mb-2 font-semibold">Non-Personal Information</p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Browser type, device information, and IP address</li>
        <li>Website usage patterns and analytics data</li>
        <li>Cookies and tracking preferences</li>
      </ul>
      
      <SectionTitle>How We Use Your Information</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Processing and fulfilling your orders</li>
        <li>Providing customer support and responding to inquiries</li>
        <li>Sending order confirmations, updates, and shipping notifications</li>
        <li>Improving our website functionality and user experience</li>
        <li>Analyzing website usage to enhance our services</li>
        <li>Sending promotional content and newsletters (with your consent)</li>
        <li>Ensuring website security and preventing fraud</li>
        <li>Complying with legal obligations and requirements</li>
      </ul>
      
      <SectionTitle>Third-Party Services</SectionTitle>
      <p className="text-gray-700 mb-2 font-semibold">Services We Use</p>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>
          <span className="font-semibold">Firebase (Google):</span> Used for order management, user authentication, and data storage. Your order information and account details are securely stored on Firebase servers.
        </li>
        <li>
          <span className="font-semibold">Supabase :</span> Used for order management, admin data posting, and data storage. Your order information and account details are securely stored on Supabase servers.
        </li>
        <li>
          <span className="font-semibold">Razorpay:</span> All payment processing is handled by Razorpay, a secure payment gateway. We do not store your complete payment card details on our servers.
        </li>
        <li>
          <span className="font-semibold">Shipping Partners:</span> We share necessary delivery information (name, address, phone number) with our shipping partners to ensure successful delivery of your orders.
        </li>
      </ul>
      <p className="text-pink-700 mb-4 font-semibold">
        Important: We never sell, rent, or trade your personal information to unrelated third parties for marketing purposes.
      </p>
      
      <SectionTitle>Data Security</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>SSL encryption for all data transmission</li>
        <li>Secure payment processing through certified payment gateways</li>
        <li>Regular security updates and monitoring</li>
        <li>Limited access to personal data on a need-to-know basis</li>
        <li>Secure storage with automatic backups</li>
        <li>Regular security audits and vulnerability assessments</li>
      </ul>
      
      <SectionTitle>Cookies and Tracking Technologies</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Essential cookies for website functionality</li>
        <li>Analytics cookies to understand website usage</li>
        <li>Preference cookies to remember your settings</li>
        <li>Marketing cookies for relevant advertisements (with consent)</li>
      </ul>
      <p className="text-gray-700 mb-4">
        You can manage or disable cookies in your browser settings. However, some website features may not function properly without certain cookies.
      </p>
      
      <SectionTitle>Your Rights and Choices</SectionTitle>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Access: Request a copy of the personal data we hold about you</li>
        <li>Correction: Update or correct inaccurate personal information</li>
        <li>Deletion: Request deletion of your personal data (subject to legal requirements)</li>
        <li>Opt-out: Unsubscribe from marketing communications at any time</li>
        <li>Data Portability: Request your data in a portable format</li>
        <li>Object: Object to certain types of data processing</li>
      </ul>
      <p className="text-gray-700 mb-4">
        To exercise these rights or for any privacy-related questions, please contact us at privacy@Ashok Kumar Textiles.com
      </p>
      
      <SectionTitle>Data Retention</SectionTitle>
      <p className="text-gray-700 mb-4">
        We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order information is typically retained for 7 years for tax and accounting purposes.
      </p>
      
      <SectionTitle>Children's Privacy</SectionTitle>
      <p className="text-gray-700 mb-4">
        Our website is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
      </p>
      
      <SectionTitle>International Data Transfers</SectionTitle>
      <p className="text-gray-700 mb-4">
        Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are conducted in accordance with applicable data protection laws and that appropriate safeguards are in place.
      </p>
      
      <SectionTitle>Changes to This Policy</SectionTitle>
      <p className="text-gray-700 mb-4">
        We may update our Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make significant changes, we will notify you through our website or via email. We encourage you to review this policy periodically.
      </p>
      
      <SectionTitle>Contact Us</SectionTitle>
      <div className="bg-pink-50 rounded-lg p-4 mb-2">
        <p className="text-pink-700 font-semibold mb-1">Email: <span className="font-normal">aktexmsp9@gmail.com</span></p>
        <p className="text-pink-700 font-semibold mb-1">Phone: <span className="font-normal">+91 9704447158  </span></p>
        <p className="text-pink-700 font-semibold mb-1">Phone: <span className="font-normal">+91 9652303183  </span></p>
        <p className="text-pink-700 font-semibold mb-1">Address: <span className="font-normal">Vijayawada, Andhra Pradesh, India</span></p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;