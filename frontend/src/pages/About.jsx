import React, { useEffect, useState } from "react";
import Footer from "../components/Footer"
import { 
  ArrowLeft, 
  Shield, 
  Star, 
  Truck, 
  Award, 
  Heart, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Instagram,
  Palette
} from "lucide-react";

const stats = [
  { label: "Happy Customers", value: "1000+", icon: Users },
  { label: "Saree Designs", value: "500+", icon: Palette },
  { label: "Instagram Followers", value: "100k+", icon: Instagram },
];

const values = [
  {
    title: "Passion for Tradition",
    desc: "We celebrate the rich heritage of Indian textiles and bring you authentic sarees crafted with love.",
    icon: Heart,
  },
  {
    title: "Quality Excellence",
    desc: "Every saree in our collection meets the highest standards of quality and craftsmanship.",
    icon: Award,
  },
  {
    title: "Customer First",
    desc: "Your satisfaction is our priority. We provide personalized service and support.",
    icon: Users,
  },
  {
    title: "Reliable Delivery",
    desc: "Fast and secure shipping ensures your sarees reach you in perfect condition.",
    icon: CheckCircle,
  },
];

const features = [
  { icon: Shield, title: "Secure Payments", desc: "100% safe & encrypted" },
  { icon: Star, title: "4.8/5 Customer Rating", desc: "Trusted by thousands" },
  { icon: Truck, title: "Free Shipping", desc: "All over India" },
  { icon: Award, title: "Premium Quality", desc: "Guaranteed excellence" },
];

const About = () => {
  const [visible, setVisible] = useState(false);
const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = () => {
    // This would typically use React Router navigation
    console.log("Navigate to home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-fuchsia-50">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-fuchsia-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
                      onClick={() => window.history.back()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-600 text-white font-medium hover:bg-fuchsia-700 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2"
                    >
                      <ArrowLeft size={18} />
                      <span className="hidden sm:inline">Back to Home</span>
                      <span className="sm:hidden">Back</span>
                    </button>
        </div>
      </div>

      <div className="py-8 px-4">
        {/* Hero Section */}
        <div className={`max-w-6xl mx-auto mb-16 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-fuchsia-700 via-fuchsia-500 to-fuchsia-400 bg-clip-text text-transparent font-heading">
              About Us
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-fuchsia-500 to-fuchsia-300 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-700 text-xl md:text-2xl mb-4 font-medium max-w-4xl mx-auto leading-relaxed font-inter">
              Artistry in every drape - handpicked, handcrafted and unique
            </p>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              We have sarees for every occasion ranging from festivals, cocktail parties, daytime social events or simply elegant everyday wear.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`max-w-6xl mx-auto mb-16 transition-all duration-1000 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={stat.label} 
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-fuchsia-100 group hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      index === 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                      'bg-gradient-to-r from-purple-500 to-purple-600'
                    }`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-fuchsia-700 mb-2 text-center group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-semibold text-center">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Our Story Section */}
        <div className={`max-w-6xl mx-auto mb-16 transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-fuchsia-100">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-fuchsia-700 text-center font-heading">Our Story</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed font-inter">
                  Ashok Kumar Textiles was born from a passion for preserving and celebrating the rich tradition of Indian textiles. Founded with the vision of making authentic, high-quality sarees accessible to women everywhere.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed font-inter">
                  Our journey began with a simple belief: every woman deserves to feel beautiful and confident in traditional attire. We work directly with skilled artisans and weavers across India.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed font-inter">
                  Today, we serve thousands of customers, offering not just sarees, but a connection to India's textile legacy and the promise of timeless beauty.
                </p>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="bg-gradient-to-br from-fuchsia-100 to-fuchsia-200 rounded-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <TrendingUp className="w-24 h-24 text-fuchsia-600 mx-auto" />
                  <p className="text-fuchsia-700 font-semibold text-center mt-4">Growing Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values Section */}
        <div className={`max-w-6xl mx-auto mb-16 transition-all duration-1000 delay-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-fuchsia-700 text-center font-heading">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div 
                  key={value.title} 
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-fuchsia-100 group hover:scale-105"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full transition-all duration-500 ${hoveredCard === index ? 'scale-110' : ''} ${
                      index === 0 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      index === 1 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                      index === 2 ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                      'bg-gradient-to-r from-green-500 to-green-600'
                    }`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-fuchsia-700 mb-3 group-hover:text-fuchsia-800 transition-colors duration-300">
                        {value.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{value.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className={`max-w-6xl mx-auto mb-16 transition-all duration-1000 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-fuchsia-700 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={feature.title} 
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-fuchsia-100 group hover:scale-105 text-center"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${
                    index === 0 ? 'bg-gradient-to-r from-cyan-500 to-cyan-600' :
                    index === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    index === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                    'bg-gradient-to-r from-teal-500 to-teal-600'
                  }`}>
                    <IconComponent className="w-8 h-8 text-white mx-auto" />
                  </div>
                  <h3 className="font-bold text-fuchsia-700 mb-2 group-hover:text-fuchsia-800 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;