import React from 'react';
import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Truck, 
  Shield, 
  Award,
  Facebook,
  Instagram,
  Youtube,
  DollarSign
} from 'lucide-react';
import SubFooter from './SubFooter';


const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-fuchsia-800 to-fuchsia-950 text-white ">
      {/* Newsletter Section */}
      <div className="border-b border-fuchsia-800 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 font-heading">Stay in Style</h2>
            <p className="text-fuchsia-200 mb-6 font-inter">
              Embrace the beauty of heritage craftsmanship, designed to reflect your unique style in every drape.
            </p>
            <p className="text-sm text-fuchsia-300 mb-6 font-inter">Join 10,000+ fashion enthusiasts</p>
            {/* <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors duration-300">
                Subscribe
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 font-heading">Ashok Kumar Textiles</h3>
            <p className="text-fuchsia-200 mb-6 leading-relaxed font-normal">
              Artistry in every drape - handpicked, handcrafted and unique. 
              We have sarees for every occasion ranging from festivals, cocktail parties, 
              daytime social events or simply elegant everyday wear.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                <span className="text-fuchsia-200">Guntur, Andhra Pradesh, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className="text-fuchsia-200">+91 9704447158</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className="text-fuchsia-200">+91 9652303183</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className="text-fuchsia-200">aktexmsp9@gmail.com</span>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/ashokkumartextiles.guntur/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-fuchsia-800 hover:bg-fuchsia-700 transition-colors duration-300"
                >
                  <Facebook className="w-5 h-5 text-blue-400" />
                </a>
                <a
                  href="https://www.instagram.com/ashok_kumar_textiles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-fuchsia-800 hover:bg-fuchsia-700 transition-colors duration-300"
                >
                  <Instagram className="w-5 h-5 text-fuchsia-400" />
                </a>
                <a
                  href="https://www.youtube.com/@ashokkumartextiles9333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-fuchsia-800 hover:bg-fuchsia-700 transition-colors duration-300"
                >
                  <Youtube className="w-5 h-5 text-red-500" />
                </a>
              </div>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-inter">Legal & Policies</h3>
            <ul className="space-y-3">
  <li>
    <Link
      to="/terms"
      className="text-fuchsia-200 hover:text-white transition-colors duration-300"
    >
      Terms & Conditions
    </Link>
  </li>
  <li>
    <Link
      to="/privacy"
      className="text-fuchsia-200 hover:text-white transition-colors duration-300"
    >
      Privacy Policy
    </Link>
  </li>
  <li>
    <Link
      to="/shipping"
      className="text-fuchsia-200 hover:text-white transition-colors duration-300"
    >
      Shipping Policy
    </Link>
  </li>
    <li>
    <Link
      to="/refund-policy"
      className="text-fuchsia-200 hover:text-white transition-colors duration-300"
    >
      Refund Policy
    </Link>
  </li>
</ul>
          </div>

          {/* Customer Support & About */}
          <div>
            <h3 className="text-lg font-bold mb-6">Customer Support</h3>
            <ul className="space-y-3 mb-8">
              <li>
                <Link
                    to="/contact"
                    className="text-fuchsia-200 hover:text-white transition-colors duration-300"
                  >
                    Contact Us
                  </Link>
              </li>
              <li>
                <Link
                    to="/about"
                    className="text-fuchsia-200 hover:text-white transition-colors duration-300"
                  >
                    About Us
                  </Link>
                </li>
              <li>
                       <Link
                        to="/adminlogin"
                        className="text-fuchsia-200 hover:text-white transition-colors duration-300"
                      >
                        Admin Pannel
                      </Link>                
              </li>

            </ul>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-fuchsia-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Shipping */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-fuchsia-800 rounded-full mb-4">
                <DollarSign className="w-8 h-8 text-yellow-500" />
              </div>
              <h5 className="text-lg font-semibold mb-2">Affordable Prices</h5>
              <p className="text-fuchsia-200">All over India</p>
            </div>

            {/* Secure Payment */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-fuchsia-800 rounded-full mb-4">
                <Shield className="w-8 h-8 text-yellow-500" />
              </div>
              <h5 className="text-lg font-semibold mb-2">Secure Payment</h5>
              <p className="text-fuchsia-200">100% protected</p>
            </div>

            {/* Quality Assured */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-fuchsia-800 rounded-full mb-4">
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
              <h5 className="text-lg font-semibold mb-2">Quality Assured</h5>
              <p className="text-fuchsia-200">Handpicked collection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-fuchsia-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-fuchsia-300 text-sm">
              © 2025 Ashok Kumar Textiles. All rights reserved.
            </p>
            <p className="text-fuchsia-300 text-sm mt-2 md:mt-0">
              Made with ❤️ for fashion lovers
            </p>
          </div>
        </div>
      </div>

      {/* Developer Credit */}
      <div className="mt-auto">
        <SubFooter />
      </div>
    </footer>
  );
};

export default Footer;