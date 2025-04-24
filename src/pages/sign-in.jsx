import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Input, Button } from '@material-tailwind/react';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function SignIn() {
  const navigate = useNavigate();
  const { loginUser } = useAuth(); // Ensure we're using loginUser from context
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', formData.email);
      
      const response = await api.post('/user/signin', formData);
      
      console.log('Server response:', response.status, 'OK');
      
      if (response.data.success) {
        // Store user data and token
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // THIS IS THE FIX: Use loginUser instead of login
        loginUser(response.data.token, response.data.user);
        
        // Redirect to user dashboard
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
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Typography variant="h3" className="mb-4">Sign In</Typography>
      {error && <Typography color="red">{error}</Typography>}
      <form onSubmit={handleLogin} className="w-96 space-y-4">
        <Input label="Email" name="email" value={formData.email} onChange={handleChange} required />
        <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default SignIn;