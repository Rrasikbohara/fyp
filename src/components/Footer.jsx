import React, { useState, useEffect } from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin, FaArrowUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  return (
    <footer className="bg-gray-900 text-white pt-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Top Button */}
        {showScroll && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-platinum-red p-4 rounded-full shadow-lg hover:bg-red-600 transition-colors duration-300 z-50"
            aria-label="Back to top"
          >
            <FaArrowUp className="w-6 h-6" />
          </button>
        )}

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Gym Logo and Social Links */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center">
              <img 
                src="/platinum-gym-logo.png" 
                alt="Platinum Gym Logo"
                className="h-16 w-auto"
              />
            </Link>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-platinum-red transition-colors">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-platinum-red transition-colors">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-platinum-red transition-colors">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-platinum-red transition-colors">
                <FaYoutube className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-platinum-red transition-colors">
                <FaLinkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-platinum-red transition-colors">About Us</Link></li>
              <li><Link to="/membership" className="hover:text-platinum-red transition-colors">Membership</Link></li>
              <li><Link to="/classes" className="hover:text-platinum-red transition-colors">Classes</Link></li>
              <li><Link to="/trainers" className="hover:text-platinum-red transition-colors">Trainers</Link></li>
              <li><Link to="/contact" className="hover:text-platinum-red transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li>123 Fitness Street</li>
              <li>Kathmandu, Nepal</li>
              <li>Phone: +977 9841-123456</li>
              <li>Email: info@platinumgym.com</li>
            </ul>
          </div>

          {/* Sign In/Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4">Member Access</h3>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Link 
                  to="/auth/sign-in" 
                  className="bg-platinum-red px-4 py-2 rounded hover:bg-red-600 transition-colors text-center"
                >
                  Sign In
                </Link>
                <span className="text-sm">Not a member? <Link to="/auth/sign-up" className="text-platinum-red hover:underline">Join Now</Link></span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal and Copyright */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Platinum Gym. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;