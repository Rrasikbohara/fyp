import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Typography, Input, Button, Card, CardBody, CardFooter } from '@material-tailwind/react';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { FiMail, FiLock, FiUser, FiArrowRight, FiLogIn } from 'react-icons/fi';

export function SignIn() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('user'); // 'user' or 'admin'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const toggleLoginMode = () => {
    if (loginMode === 'user') {
      navigate('/admin/signin');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', formData.email);
      
      const response = await api.post('/user/signin', formData);
      
      console.log('Server response:', response.status, 'OK');
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        loginUser(response.data.token, response.data.user);
        
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error details:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
              <FiUser className="h-8 w-8 text-blue-600" />
            </div>
            <Typography variant="h3" className="mb-2 text-gray-800">Welcome Back</Typography>
            <Typography variant="paragraph" className="text-gray-600">
              Sign in to access your account
            </Typography>
          </div>
          
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <Typography color="red" className="text-sm">
                {error}
              </Typography>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <Typography variant="small" className="text-gray-700 font-medium mb-1">Email</Typography>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="pl-10"
                  containerProps={{ className: 'min-w-full' }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <Typography variant="small" className="text-gray-700 font-medium">Password</Typography>
                <Typography as="a" href="/auth/forgot-password" variant="small" className="text-blue-600 font-medium hover:text-blue-800">
                  Forgot Password?
                </Typography>
              </div>
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
            
            <Button
              type="submit"
              className="flex items-center justify-center gap-2 mt-2"
              color="blue"
              variant="filled"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiLogIn />
                </>
              )}
            </Button>
          </form>
        </CardBody>
        <CardFooter className="pt-0">
          <hr className="my-4" />
          <div className="text-center">
            <Typography variant="small" className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/auth/sign-up" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                Sign Up
              </Link>
            </Typography>
            
            <div className="mt-4">
              <Typography variant="small" className="text-gray-600">
                <Link to="/admin/signin" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                  Switch to Admin Login
                </Link>
              </Typography>
            </div>
          </div>
        </CardFooter>
      </Card>
      <ToastContainer />
    </div>
  );
}

export default SignIn;