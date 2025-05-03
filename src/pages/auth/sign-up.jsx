import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Input, Button, Card, CardBody, CardFooter } from '@material-tailwind/react';
import { toast, ToastContainer } from 'react-toastify';
import { api } from '../../services/api';
import { FiMail, FiLock, FiUser, FiSmartphone, FiKey } from 'react-icons/fi';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Registration, 2: OTP Verification
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState(null); // Store user ID temporarily for OTP verification

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/user/verify-otp', { userId: tempUserId, otp });
      if (response.data.success) {
        toast.success('Account verified successfully! Please sign in.');
        setTimeout(() => navigate('/auth/sign-in'), 2000);
      } else {
        setError(response.data.message || 'Invalid OTP');
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Failed to verify OTP');
      toast.error(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    // Phone number validation
    if (formData.phoneNumber.length !== 10 || !/^\d+$/.test(formData.phoneNumber)) {
      setError("Phone number must be 10 digits");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/user/signup', {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      if (response.data.success) {
        setTempUserId(response.data.userId); // Store user ID for OTP verification
        toast.info('Verification code sent to your email. Please verify your account.');
        setStep(2); // Move to OTP verification step
      }
    } catch (err) {
      console.error('Sign up error:', err);

      if (err.code === 'ECONNABORTED') {
        setError('The request took too long. Please try again.');
        toast.error('The request timed out. Please try again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error(err.response.data.message);
      } else {
        setError('Failed to create account. Please try again.');
        toast.error('Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    if (step === 1) {
      return (
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <div>
            <Typography variant="small" className="text-gray-700 font-medium mb-1">Full Name</Typography>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="pl-10"
                containerProps={{ className: 'min-w-full' }}
              />
            </div>
          </div>

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
            <Typography variant="small" className="text-gray-700 font-medium mb-1">Phone Number</Typography>
            <div className="relative">
              <FiSmartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="10-digit phone number"
                required
                pattern="[0-9]{10}"
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
                minLength={6}
                className="pl-10"
                containerProps={{ className: 'min-w-full' }}
              />
            </div>
          </div>

          <div>
            <Typography variant="small" className="text-gray-700 font-medium mb-1">Confirm Password</Typography>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </Button>
        </form>
      );
    } else if (step === 2) {
      return (
        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
          <div>
            <Typography variant="small" className="text-gray-700 font-medium mb-1">Verification Code</Typography>
            <div className="relative">
              <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the 6-digit code"
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
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Account</span>
            )}
          </Button>
        </form>
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardBody className="flex flex-col gap-6 px-6 pt-8">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <Typography color="red" className="text-sm">
                {error}
              </Typography>
            </div>
          )}
          {renderForm()}
        </CardBody>
        <CardFooter className="pt-0">
          <hr className="my-4" />
          <div className="text-center">
            <Typography variant="small" className="text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/sign-in" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                Sign In
              </Link>
            </Typography>
          </div>
        </CardFooter>
      </Card>
      <ToastContainer />
    </div>
  );
}

export default SignUp;