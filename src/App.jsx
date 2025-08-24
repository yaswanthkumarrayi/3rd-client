import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Footer from "./components/Footer";
import TermsAndConditions from "./documents/TermsAndConditions";
import PrivacyPolicy from "./documents/PrivacyPolicy";
import RefundPolicy from "./documents/RefundPolicy";
import Contact from "./pages/Contact";
import About from "./pages/About";
import ShippingPolicy from "./documents/ShippingPolicy";
import AdminLogin from "./pages/AdminLogin";
import AdminOrders from "./pages/AdminOrders";
import Admin from "./pages/Admin";
import Product from "./pages/Product";
import User from "./pages/User";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Search from "./pages/Search";
import Payment from "./pages/Payment";
import Category from "./pages/Category";

// WhatsApp phone number
const WHATSAPP_NUMBER = "9704447158";

// Protected Route for Admin
const ProtectedAdminRoute = ({ children }) => {
  const location = useLocation();
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    return <Navigate to="/adminlogin" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/category/:name" element={<Category />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/user" element={<User />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/search" element={<Search />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping" element={<ShippingPolicy />} />

        {/* Admin Login */}
        <Route path="/adminlogin" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/adminorders"
          element={
            <ProtectedAdminRoute>
              <AdminOrders />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          }
        />
      </Routes>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#25D366",
          color: "white",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        <FaWhatsapp />
      </a>
    </Router>
  );
};

export default App;
