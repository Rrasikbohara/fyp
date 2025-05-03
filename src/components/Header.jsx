import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { user, adminAuth, logoutUser, logoutAdmin } = useAuth(); // Ensure correct functions are imported
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Use the correct logout function based on the logged-in user type
      if (adminAuth && adminAuth.isAuthenticated) {
        await logoutAdmin();
      } else {
        await logoutUser();
      }
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Gym Management
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/dashboard" className="hover:underline">
                Dashboard
              </Link>
            </li>
            if (adminAuth && adminAuth.isAuthenticated)  {
              (
              <>
                <li>
                  <Link to="/auth/sign-in" className="hover:underline">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/auth/sign-up" className="hover:underline">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;