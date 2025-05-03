import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../../../utils/ReactToast";
import { useAuth } from "../../../contexts/AuthContext";

const Header = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    document.querySelector(".sidebar").classList.toggle("-translate-x-full");
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const closeProfileMenu = () => {
    setProfileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    showToast("Logged Out Successfully", "success");
    navigate("/auth/sign-in");
  };

  return (
    <header
      className="fixed w-full bg-white text-indigo-800 z-50 shadow-lg"
      onClick={closeProfileMenu}
      onMouseLeave={() => setProfileMenuOpen(false)}
    >
      <div
        className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between h-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Menu Button */}
        <button
          className="p-2 lg:hidden text-2xl text-indigo-800"
          onClick={toggleMobileMenu}
        >
          <i className="bx bx-menu text-3xl"></i>
        </button>

        {/* Title */}
        <div className="text-xl font-bold text-blue-900">
          <span className="text-indigo-800">User Dashboard</span>
        </div>

        {/* Icons and Profile */}
        <div className="flex items-center space-x-2 relative">
          <img
            className="w-10 h-10 rounded-full transition-transform duration-300 hover:scale-110 object-cover cursor-pointer"
            src={(user && user.avatar) || "https://i.pinimg.com/564x/de/0f/3d/de0f3d06d2c6dbf29a888cf78e4c0323.jpg"}
            alt="Profile"
            onMouseEnter={toggleProfileMenu}
            onClick={toggleProfileMenu}
          />
          {/* Dynamic User Details in Profile Menu */}
          {profileMenuOpen && (
            <div
              onMouseLeave={toggleProfileMenu}
              className="absolute right-0 mt-60 w-64 bg-white border rounded-lg shadow-lg z-50 p-4 transition-all"
            >
              <div className="flex items-center mb-4">
                <img
                  className="w-12 h-12 rounded-full object-cover mr-3"
                  src={(user && user.avatar) || "https://i.pinimg.com/564x/de/0f/3d/de0f3d06d2c6dbf29a888cf78e4c0323.jpg"}
                  alt="User"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {user ? user.name : "User"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {user && user.email ? user.email : "user@example.com"}
                  </p>
                </div>
              </div>
              <hr className="my-2" />
             
             
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
