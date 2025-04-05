import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clearAllAuth } from '../../utils/authDebugger';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // Add error state variable
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Improved useEffect to check authentication status
  useEffect(() => {
    // Clear any invalid auth data that might be causing issues
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    // If we have both token and user data and auth context says we're authenticated
    if (token && userData && isAuthenticated) {
      console.log('Already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    } else if ((token || userData) && !isAuthenticated) {
      // We have inconsistent auth state - clear it
      console.log('Inconsistent auth state detected, clearing auth data');
      clearAllAuth();
    }
  }, [navigate, isAuthenticated]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Clear previous errors

    try {
      console.log('Attempting login with:', formData.email);
      const response = await api.post('/user/signin', formData);
      
      console.log('Login successful:', response.data);
      
      if (response.data.success && response.data.token) {
        // Save token in localStorage AND set it in the API instance
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Save user data
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Use the login function from auth context
        login(response.data.token, response.data.user);
        
        toast.success('Login successful!');
        
        // Short delay before redirect for better user experience
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setError(response.data.message || 'Login failed');
        toast.error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Set error state
      if (err.response?.status === 401) {
        setError('Invalid email or password');
        toast.error('Invalid email or password');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
        toast.error(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer />
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
            {error}
            {error.includes('Invalid credentials') && (
              <p className="mt-2 text-sm">
                If you recently changed your password and are having trouble logging in,
                please try <Link to="/auth/forgot-password" className="text-blue-600 hover:underline">resetting your password</Link>.
              </p>
            )}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="current-password"
            />
          </div>
          
          <div className="flex justify-end">
            <Link to="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white p-3 rounded-lg transition-colors flex justify-center items-center`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/sign-up" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;