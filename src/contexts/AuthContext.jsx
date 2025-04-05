import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AuthContext = createContext();

// Keys for local storage - keep these completely separate
const USER_TOKEN_KEY = 'userToken';
const USER_DATA_KEY = 'userData';
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_DATA_KEY = 'adminData';

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage to prevent unauthorized flashes
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if we have a valid token in localStorage
    return !!localStorage.getItem('token');
  });

  const [loading, setLoading] = useState(true);
  
  // Admin state - completely separate from user state
  const [adminUser, setAdminUser] = useState(null);
  const [adminAuth, setAdminAuth] = useState({
    isAuthenticated: false,
    loading: true
  });
  
  const navigate = useNavigate();

  // Load user/admin from local storage on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // First check for user authentication
        const userToken = localStorage.getItem(USER_TOKEN_KEY);
        if (userToken) {
          console.log('User token found in localStorage');
          
          try {
            // Validate user token
            const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
            
            if (userData && userData.email) {
              console.log('Valid user token found');
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              console.log('Invalid or incomplete user data, trying to fetch from API');
              try {
                // Get user data from API
                const response = await api.get('/user/me');
                if (response.data) {
                  localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data));
                  setUser(response.data);
                  setIsAuthenticated(true);
                }
              } catch (apiError) {
                console.error('Failed to fetch user data, clearing token', apiError);
                localStorage.removeItem(USER_TOKEN_KEY);
                localStorage.removeItem(USER_DATA_KEY);
              }
            }
          } catch (error) {
            console.error('Error validating user token:', error);
            // Clear invalid token
            localStorage.removeItem(USER_TOKEN_KEY);
            localStorage.removeItem(USER_DATA_KEY);
          }
        }

        // Separately check for admin authentication - completely independent from user auth
        const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
        if (adminToken) {
          console.log('Admin token found in localStorage');
          
          try {
            // Validate admin token
            const adminData = JSON.parse(localStorage.getItem(ADMIN_DATA_KEY) || '{}');
            
            if (adminData && adminData.username) {
              console.log('Valid admin token found');
              setAdminUser(adminData);
              setAdminAuth({
                isAuthenticated: true,
                loading: false
              });
            } else {
              // Clear invalid admin data
              localStorage.removeItem(ADMIN_TOKEN_KEY);
              localStorage.removeItem(ADMIN_DATA_KEY);
              setAdminAuth({
                isAuthenticated: false,
                loading: false
              });
            }
          } catch (error) {
            console.error('Error validating admin token:', error);
            // Clear invalid token
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            localStorage.removeItem(ADMIN_DATA_KEY);
            setAdminAuth({
              isAuthenticated: false,
              loading: false
            });
          }
        } else {
          setAdminAuth({
            isAuthenticated: false,
            loading: false
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // User login function - only affects user auth
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Set the token in the API instance's default headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(userData);
    setIsAuthenticated(true);
    console.log('Auth context: User logged in', userData);
  };

  // Admin login function - only affects admin auth
  const adminLogin = (adminData, token) => {
    try {
      console.log('Setting up admin session with token');
      
      // First, make sure to save the token
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      
      // Store admin data
      localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
      
      // Update state
      setAdminUser(adminData);
      setAdminAuth({
        isAuthenticated: true,
        loading: false
      });
      
      return true;
    } catch (error) {
      console.error('Error during admin login:', error);
      return false;
    }
  };

  // User logout function - only affects user auth
  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
    console.log('Auth context: User logged out');
  };

  // Admin logout function - only affects admin auth
  const adminLogout = () => {
    // Clear admin auth data only
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_DATA_KEY);
    
    // Update state
    setAdminUser(null);
    setAdminAuth({
      isAuthenticated: false,
      loading: false
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      adminUser,
      adminAuth,
      adminLogin,
      adminLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
