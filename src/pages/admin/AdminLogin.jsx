import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Input, Button } from '@material-tailwind/react';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

// Keep token keys consistent
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_DATA_KEY = 'adminData';

export function AdminLogin() {
  const navigate = useNavigate();
  const { adminAuth, loginAdmin } = useAuth(); // Change from adminLogin to loginAdmin
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(""); // Make sure error state is defined
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setIsSubmitting(true);
    
    try {
      // Add debug logging
      console.log('Submitting admin login for:', formData.username);
      
      const response = await api.post('/admin/signin', formData);
      
      console.log('Admin login response status:', response.status);
      
      if (response.data.success) {
        // Store admin token with consistent naming
        localStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
        
        // Store admin data
        localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(response.data.admin));
        
        // Log keys in localStorage for debugging
        console.log('localStorage keys after admin login:', Object.keys(localStorage));
        
        // Set admin in context - FIX: use loginAdmin instead of adminLogin
        loginAdmin(response.data.token, response.data.admin);
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Typography variant="h3" className="mb-4">Admin Sign In</Typography>
      {error && <Typography color="red">{error}</Typography>}
      <form onSubmit={handleSubmit} className="w-96 space-y-4">
        <Input label="Username" name="username" value={formData.username} onChange={handleChange} required />
        <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default AdminLogin;
