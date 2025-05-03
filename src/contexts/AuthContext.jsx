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
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('userData');
      
      // Only consider user logged in if BOTH token and userData exist
      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Validate user object has required fields
        if (parsedUser && parsedUser._id && parsedUser.email) {
          return parsedUser;
        } else {
          // Clean up invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error initializing auth state:', error);
      // Clean up if there's any error
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('user'); // Remove legacy key if exists
      return null;
    }
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Only consider authenticated if both token and valid user data exist
    return !!localStorage.getItem('token') && !!user;
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
          console.log('Admin token found in localStorage:', adminToken.substring(0, 10) + '...');
          
          try {
            // Validate admin token
            const adminData = JSON.parse(localStorage.getItem(ADMIN_DATA_KEY) || '{}');
            
            if (adminData && (adminData.username || adminData.id)) {
              console.log('Valid admin data found:', adminData.username || adminData.id);
              setAdminUser(adminData);
              setAdminAuth({
                isAuthenticated: true,
                admin: adminData,
                token: adminToken,
                loading: false
              });
              
              // Set this in API headers for subsequent requests
              api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
              console.log('Set admin token in API headers');
            } else {
              // Clear invalid admin data
              console.warn('Admin data invalid:', adminData);
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
          console.log('No admin token found in localStorage');
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
  const loginUser = (token, userData) => {
    console.log('AuthContext: Login called with token and user data');
    
    if (!token || !userData) {
      console.error('Login attempt with invalid data');
      return false;
    }
    
    // Store token and user data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Set token in API headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Update context state
    setUser(userData);
    setIsAuthenticated(true);
    
    console.log('AuthContext: User login successful');
    return true;
  };

  // Admin login function - only affects admin auth
  const loginAdmin = (token, admin) => {
    console.log('Admin login in context:', admin?.username);
    
    // Store token with consistent naming
    if (token) localStorage.setItem('adminToken', token);
    if (admin) localStorage.setItem('adminData', JSON.stringify(admin));
    
    // Update admin auth state
    setAdminAuth({
      isAuthenticated: true,
      admin,
      token
    });
    setAdminUser(admin);
    
    // Log admin token length for debugging
    console.log('Admin token stored, length:', token?.length || 0);
    return true;
  };

  // User logout function - only affects user auth
  const logoutUser = () => {
    console.log('AuthContext: User logout called');
    
    // Clear auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];
    
    // Update context state
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('AuthContext: User logged out');
    
    // Redirect to login page
    navigate('/auth/sign-in');
    return true;
  };

  // Admin logout function - only affects admin auth
  const logoutAdmin = () => {
    console.log('AuthContext: Admin logout called');
    
    // Clear admin auth data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_DATA_KEY);
    
    // Remove token from API headers if it was for admin
    if (api.defaults.headers.common['Authorization']?.includes('Bearer ')) {
      delete api.defaults.headers.common['Authorization'];
    }
    
    // Update admin auth state
    setAdminAuth({
      isAuthenticated: false,
      admin: null,
      token: null,
      loading: false
    });
    setAdminUser(null);
    
    console.log('AuthContext: Admin logged out');
    
    // Redirect to admin login page
    navigate('/admin/sign-in');
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      loginUser,
      logoutUser,
      adminUser,
      adminAuth,
      loginAdmin,
      logoutAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
