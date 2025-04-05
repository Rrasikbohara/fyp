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
  const { adminAuth, adminLogin } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(""); // Make sure error state is defined
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    setError(""); // Clear previous errors
    
    try {
      // Use a direct axios request to avoid token interference
      const response = await api.post('/admin/login', formData);
      
      if (response.data.success) {
        const { token, admin } = response.data;
        
        // Use the adminLogin function to handle admin authentication separately
        adminLogin(admin, token);
        
        toast.success('Admin login successful');
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
        toast.error(response.data.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
