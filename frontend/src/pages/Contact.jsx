import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, ArrowLeft, Clock, MessageCircle } from 'lucide-react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from 'react-router-dom';

const CONTACT_NUMBER = "+91 9704447158";
const WHATSAPP_NUMBER = "9704447158";
const EMAIL = "aktexmsp9@gmail.com";
const LOCATION_URL = "https://maps.app.goo.gl/WZ3LQK9c8qHntpML7";
const FACEBOOK_URL = "https://www.facebook.com/ashokkumartextiles.guntur/";
const INSTAGRAM_URL = "https://www.instagram.com/ashok_kumar_textiles";
const YOUTUBE_URL = "https://www.youtube.com/@ashokkumartextiles9333";

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const contactMethods = [
    {
      icon: Phone,
      label: "Phone",
      value: CONTACT_NUMBER,
      action: `tel:${CONTACT_NUMBER}`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      hoverColor: "hover:bg-emerald-100"
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Chat with us",
      action: `https://wa.me/91${WHATSAPP_NUMBER}`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      external: true
    },
    {
      icon: Mail,
      label: "Email",
      value: EMAIL,
      action: `mailto:${EMAIL}`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Vijayawada, AP, India",
      action: LOCATION_URL,
      color: "text-fuchsia-600",
      bgColor: "bg-fuchsia-50",
      hoverColor: "hover:bg-fuchsia-100",
      external: true
    }
  ];

  const socialLinks = [
    {
      icon: Facebook,
      name: "Facebook",
      url: FACEBOOK_URL,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100"
    },
    {
      icon: Instagram,
      name: "Instagram",
      url: INSTAGRAM_URL,
      color: "text-fuchsia-600",
      bgColor: "bg-fuchsia-50",
      hoverColor: "hover:bg-fuchsia-100"
    },
    {
      icon: Youtube,
      name: "YouTube",
      url: YOUTUBE_URL,
      color: "text-red-600",
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-fuchsia-50/30 flex flex-col">
      <Header />
      
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-16 sm:top-20 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-fuchsia-600 text-white font-medium hover:bg-fuchsia-700 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 text-sm sm:text-base"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
        {/* Hero Section */}
        <div className={`text-center mb-8 sm:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-fuchsia-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent font-heading">
              Contact Us
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            We're here to help you with all your textile needs. Reach out to us through any of the channels below.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {contactMethods.map((method, index) => (
            <a
              key={method.label}
              href={method.action}
              {...(method.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-lg ${method.hoverColor} cursor-pointer`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${method.bgColor} ${method.color} mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <method.icon size={20} className="sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{method.label}</h3>
              <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 break-words">
                {method.value}
              </p>
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-fuchsia-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          ))}
        </div>

        {/* Map and Business Info */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Map Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
              <MapPin className="text-fuchsia-600 w-5 h-5 sm:w-6 sm:h-6" />
              Our Location
            </h3>
            <div className="rounded-lg sm:rounded-xl overflow-hidden shadow-md">
              <iframe
                title="Ashok Kumar Textiles Location"
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3820.3714169631185!2d80.41723587505908!3d16.306625084450467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4a757aea679931%3A0x656acee616014f9!2sAshok%20Kumar%20Textiles!5e0!3m2!1sen!2sin!4v1692012345678!5m2!1sen!2sin"                width="100%"
                height="240"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="hover:contrast-110 transition-all duration-300 sm:h-70"
              />
            </div>
          </div>

          {/* Business Hours and Info */}
          <div className="space-y-6">
            {/* Business Hours */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <Clock className="text-fuchsia-600" size={24} />
                Business Hours
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">Monday - Saturday</span>
                  <span className="font-medium text-gray-900">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium text-red-500">Closed</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Time Zone</span>
                  <span className="font-medium text-gray-900">IST (GMT +5:30)</span>
                </div>
              </div>
            </div>

            {/* Quick Response Badge */}
            <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-2xl p-6 text-white">
              <h4 className="font-semibold text-lg mb-2">Quick Response Guarantee</h4>
              <p className="text-fuchsia-100 text-sm leading-relaxed">
                We respond to all inquiries within 2 hours during business hours. 
                For urgent matters, call or WhatsApp us directly.
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3 font-heading">Follow Us</h3>
            <p className="text-gray-600">Stay connected for latest updates and offers</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-3 bg-white rounded-xl px-6 py-4 border border-gray-100 ${social.hoverColor} transition-all duration-300 hover:scale-105 hover:shadow-md w-full sm:w-auto justify-center sm:justify-start`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`p-2 rounded-lg ${social.bgColor} ${social.color} group-hover:scale-110 transition-transform duration-300`}>
                  <social.icon size={20} />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-gray-700">
                  {social.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <p className="text-gray-600 text-sm leading-relaxed">
              <span className="font-medium text-fuchsia-600">Ashok Kumar Textiles</span> - Your trusted partner for quality textiles since years. 
              We pride ourselves on excellent customer service and premium products.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;