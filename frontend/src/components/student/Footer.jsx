import React, { useState } from "react";
import { assets } from "../../assets/assets";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Simple email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
      // Handle subscription logic here (e.g., send to API)
      alert("Subscribed successfully!");
    }
  };

  return (
    <footer className="bg-gray-900 text-white px-6 w-full md:px-36 py-10 mt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        {/* Logo and Description */}
        <div className="max-w-md">
          <img src={assets.logo_dark} alt="Edemy Logo" className="mb-4" />
          <p className="text-gray-400 text-sm leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
            labore officiis debitis, dicta exercitationem cum atque, suscipit
            quos quasi nulla earum quisquam. Dolorem perferendis voluptatibus
            odio laborum quidem tempora repellendus!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li><a href="#" className="hover:text-white transition">Home</a></li>
            <li><a href="#" className="hover:text-white transition">About Us</a></li>
            <li><a href="#" className="hover:text-white transition">Courses</a></li>
            <li><a href="#" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info & Newsletter Subscription */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Contact</h3>
          <p className="text-gray-400 text-sm">Email: contact@gmail.com</p>
          <p className="text-gray-400 text-sm">Phone: +255 710227324</p>
          <p className="text-gray-400 text-sm">Location: Tanzania,Dar es salaam </p>

          {/* Subscribe to Newsletter */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Stay updated with the latest news and offers.</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                className="px-4 py-2 text-gray-800 rounded-l-lg w-full"
              />
              <button
                onClick={handleSubscribe}
                className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition"
              >
                Subscribe
              </button>
            </div>
            {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-500 text-sm mt-8 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} josianjidile. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
