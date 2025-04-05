import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { checkAuth, repairAuth } from '../utils/authDebug';
import { api } from '../services/api';
import Loader from '../utils/LazyLoader';

const PrivateRoute = () => {
  const { user, isAuthenticated, loading, login } = useAuth();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  
  // Debug auth state
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Try to verify token and restore session immediately on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.warn('No token found in localStorage');
          setVerifying(false);
          setTokenValid(false);
          return;
        }

        // Create a user object from token if possible
        try {
          // Direct token verification by decoding JWT
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          ).join(''));
          
          const decoded = JSON.parse(jsonPayload);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            console.warn('Token is expired');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setTokenValid(false);
            setVerifying(false);
            return;
          }
          
          // Token is valid, proceed with session recovery
          setTokenValid(true);
          
          // Try to get user data from localStorage
          const storedUser = localStorage.getItem('user');
          
          // If we have user data stored, use that
          if (storedUser) {
            console.log('Restoring user from localStorage');
            const userData = JSON.parse(storedUser);
            
            // Call login to update the auth context
            login(userData, token);
          } else {
            // Create a minimal user object from token
            const userData = {
              id: decoded.id,
              role: decoded.role || 'user',
              name: decoded.name || 'User'
            };
            
            console.log('Recreating user from token payload:', userData);
            
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Call login to update the auth context
            login(userData, token);
          }
          
          // Also try to verify with backend if possible, but don't block
          try {
            api.get('/user/me').then(response => {
              console.log('User verification successful with backend');
            }).catch(err => {
              console.error('Backend verification failed, but using token data:', err);
            });
          } catch (backendError) {
            console.error('Error verifying with backend:', backendError);
          }
        } catch (tokenError) {
          console.error('Error processing token:', tokenError);
          
          // Try to repair authentication state
          if (repairAuth()) {
            console.log('Auth state repaired successfully');
            setTokenValid(true);
          } else {
            console.error('Could not repair auth state');
            setTokenValid(false);
          }
        }
      } finally {
        setVerifying(false);
      }
    };

    // Only verify if not already authenticated
    if (!isAuthenticated && !loading) {
      verifyToken();
    } else {
      setVerifying(false);
      setTokenValid(isAuthenticated);
    }
  }, [isAuthenticated, loading, login]);

  // Show loading while checking
  if (loading || verifying) {
    return <Loader size="medium" />;
  }
  
  // If authenticated or token is valid, render protected content
  if (isAuthenticated || tokenValid) {
    console.log('User is authenticated, allowing access to private route');
    return <Outlet />;
  }
  
  // Otherwise redirect to login
  console.warn('Not authenticated, redirecting to login');
  toast.error('Please login to access this page');
  return <Navigate to="/auth/signin" state={{ from: location }} replace />;
};

export default PrivateRoute;
