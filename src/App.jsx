import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Footer from "./components/Footer";
import TermsAndConditions from "./documents/TermsAndConditions";
import PrivacyPolicy from "./documents/PrivacyPolicy";
import Contact from "./pages/Contact";
import About from "./pages/About";
import ShippingPolicy from "./documents/ShippingPolicy";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import Product from "./pages/Product";
import User from "./pages/User";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";




const App = () => {
  return (
    
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/footer" element={<Footer />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/user" element={<User />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/terms" element={<TermsAndConditions />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/shipping" element={<ShippingPolicy />} />
        </Routes>
    </Router>
  );
};

export default App;
