import React, { useState, useEffect, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Input, Button, Typography } from "@material-tailwind/react";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      navigate('/dashboard'); // Redirect if already logged in
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.name || !formData.phoneNumber) {
      setError("Please fill all required fields");
      toast.error("Please fill all required fields", { position: "top-top" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error("Passwords do not match", { position: "top-top" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/user/signup', {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });

      toast.success('Registration successful! Redirecting to login...', {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate('/auth/sign-in');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-top" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <section className="min-h-screen flex items-center justify-center p-4 bg-teal-500">
        <ToastContainer />
        <div className="w-full lg:w-3/5 flex flex-col items-center justify-center border shadow-2xl shadow-black rounded-xl bg-gray-100 py-4">
          <div className="text-center">
            <Typography variant="h2" className="font-bold mb-4">Become our Member</Typography>
            <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Please fill in your details to register.</Typography>
            {error && <Typography variant="small" color="red" className="mt-2">{error}</Typography>}
          </div>
          <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
            <div className="mb-1 flex flex-col gap-6">
              <Input
                size="lg"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                size="lg"
                type="email"
                name="email"
                placeholder="name@mail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                name="phoneNumber"
                size="lg"
                placeholder="1234567890"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              <Input
                type="password"
                name="password"
                size="lg"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Input
                type="password"
                name="confirmPassword"
                size="lg"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="mt-6" fullWidth disabled={isLoading}>
              {isLoading ? "Registering..." : "Register Now"}
            </Button>
            <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
              Already have an account?
              <Link to="/auth/sign-in" className="text-gray-900 ml-1">Sign in</Link>
            </Typography>
          </form>
        </div>
      </section>
    </Suspense>
  );
};

export default SignUp;