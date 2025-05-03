import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Typography, Input, Button, Card, CardBody, CardFooter } from '@material-tailwind/react';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { FiUser, FiLock, FiShield, FiKey, FiLogIn } from 'react-icons/fi';

// Keep token keys consistent
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_DATA_KEY = 'adminData';
const TEMP_TOKEN_KEY = 'adminTempToken';

export function AdminLogin() {
  const navigate = useNavigate();
  const { adminAuth, loginAdmin } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "", otp: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [loginMode, setLoginMode] = useState('admin');
  
  // Redirect immediately if already authenticated.
  useEffect(() => {
    if (adminAuth?.isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [adminAuth, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const toggleLoginMode = () => {
    if (loginMode === 'admin') {
      navigate('/auth/sign-in');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setIsSubmitting(true);
    
    try {
      // Add debug logging
      console.log('Submitting admin login for:', formData.username);
      
      // If OTP is required and we have a temp token, submit with OTP
      if (requiresOTP && tempToken) {
        const verifyResponse = await api.post('/admin/verify-otp', {
          username: formData.username,
          otp: formData.otp,
          tempToken
        });
        
        if (verifyResponse.data.success) {
          // OTP verification successful
          localStorage.setItem(ADMIN_TOKEN_KEY, verifyResponse.data.token);
          localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(verifyResponse.data.admin));
          
          // Log keys in localStorage for debugging
          console.log('localStorage keys after admin login:', Object.keys(localStorage));
          
          // Set admin in context
          loginAdmin(verifyResponse.data.token, verifyResponse.data.admin);
          
          toast.success("Admin authentication successful!");
          
          // Clean up temp token
          localStorage.removeItem(TEMP_TOKEN_KEY);
          
          // Redirect to admin dashboard
          navigate('/admin/dashboard');
          return;
        } else {
          setError(verifyResponse.data.message || 'OTP verification failed');
          toast.error("OTP verification failed");
        }
      } else {
        // Regular login flow
        const response = await api.post('/admin/signin', {
          username: formData.username,
          password: formData.password
        });
        
        console.log('Admin login response status:', response.status);
        
        if (response.data.success) {
          if (response.data.requiresOTP) {
            // Store temp token and set OTP requirement
            setTempToken(response.data.tempToken);
            localStorage.setItem(TEMP_TOKEN_KEY, response.data.tempToken);
            setRequiresOTP(true);
            toast.info('Please enter the verification code sent to your email');
            
            
          } else {
            // Normal login success
            localStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
            localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(response.data.admin));
            
            // Log keys in localStorage for debugging
            console.log('localStorage keys after admin login:', Object.keys(localStorage));
            
            // Set admin in context
            loginAdmin(response.data.token, response.data.admin);
            toast.success("Admin login successful!");
            
            // Redirect to admin dashboard
            navigate('/admin/dashboard');
          }
        } else {
          setError(response.data.message || 'Login failed');
        }
      }
    } catch (err) {
      console.error('Admin login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid username or password');
        toast.error("Invalid credentials");
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
        toast.error("Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Admin</span>
        <div 
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer 
          ${loginMode === 'admin' ? 'bg-blue-500' : 'bg-gray-300'}`}
          onClick={toggleLoginMode}
        >
          <div className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 
            ${loginMode === 'admin' ? 'translate-x-6' : ''}`}>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-600">User</span>
      </div>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardBody className="flex flex-col gap-6 px-6 pt-8">
          <div className="text-center">
            <div className="inline-flex justify-center items-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FiShield className="h-8 w-8 text-blue-600" />
            </div>
            <Typography variant="h3" className="mb-2 text-gray-800">Admin Portal</Typography>
            <Typography variant="paragraph" className="text-gray-600">
              {requiresOTP ? 'Enter verification code' : 'Sign in to access admin dashboard'}
            </Typography>
          </div>
          
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <Typography color="red" className="text-sm">
                {error}
              </Typography>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!requiresOTP ? (
              <>
                <div>
                  <Typography variant="small" className="text-gray-700 font-medium mb-1">Username</Typography>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                      className="pl-10"
                      containerProps={{ className: 'min-w-full' }}
                    />
                  </div>
                </div>
                
                <div>
                  <Typography variant="small" className="text-gray-700 font-medium mb-1">Password</Typography>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      className="pl-10"
                      containerProps={{ className: 'min-w-full' }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Typography variant="small" className="text-gray-700 font-medium mb-1">Verification Code</Typography>
                <div className="relative">
                  <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter the 6-digit code"
                    required
                    autoFocus
                    className="pl-10"
                    containerProps={{ className: 'min-w-full' }}
                  />
                </div>
                <Typography variant="small" className="mt-2 text-gray-600">
                  A verification code has been sent to ryderrasik1@gmail.com
                </Typography>
              </div>
            )}
            
            <Button
              type="submit"
              className="flex items-center justify-center gap-2 mt-2"
              color="blue"
              variant="filled"
              disabled={isLoading || isSubmitting}
              fullWidth
            >
              {isLoading || isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  <span>{requiresOTP ? 'Verifying...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <span>{requiresOTP ? 'Verify Code' : 'Admin Sign In'}</span>
                  <FiLogIn />
                </>
              )}
            </Button>
            
            {requiresOTP && (
              <Button
                type="button"
                variant="text"
                color="blue"
                className="mt-2"
                onClick={() => {
                  setRequiresOTP(false);
                  setTempToken(null);
                  localStorage.removeItem(TEMP_TOKEN_KEY);
                }}
              >
                Back to Login
              </Button>
            )}
          </form>
        </CardBody>
        <CardFooter className="pt-0">
          <hr className="my-4" />
          <div className="text-center">
            <Typography variant="small" className="text-gray-600">
              <Link to="/auth/sign-in" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                Switch to User Login
              </Link>
            </Typography>
          </div>
        </CardFooter>
      </Card>
      <ToastContainer />
    </div>
  );
}

export default AdminLogin;
