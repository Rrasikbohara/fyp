import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import { HiMail, HiArrowNarrowLeft, HiInformationCircle } from 'react-icons/hi';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const isDevelopment = process.env.NODE_ENV === 'development' || import.meta.env.MODE === 'development';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setDebugInfo(null);
    
    try {
      const response = await api.post('/password-reset/request-reset', { email });
      
      // In development mode, check for debug info
      if (isDevelopment && response.data.debug) {
        setDebugInfo(response.data.debug);
        console.log('Debug token for development:', response.data.debug);
      }
      
      setSubmitted(true);
      toast.success('If your email exists in our system, you will receive a password reset link');
    } catch (error) {
      console.error('Password reset request error:', error);
      
      // Check for specific error types
      if (error.response?.status === 500) {
        toast.error('Server error. Our team has been notified.');
        setError('Could not process your request due to a server error.');
      } else {
        setError(error.response?.data?.message || 'Failed to process your request');
        toast.error(error.response?.data?.message || 'Failed to process your request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <ToastContainer position="top-center" />
      
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {submitted ? (
          <div className="text-center">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
              <HiMail className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <span className="font-medium">{email}</span>. 
              Please check your inbox and follow the instructions.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or request another reset.
            </p>
            
            {/* Development mode direct link */}
            {isDevelopment && debugInfo && (
              <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 text-left rounded-lg">
                <p className="flex items-center text-yellow-700 font-medium mb-2">
                  <HiInformationCircle className="mr-2" /> Development Mode
                </p>
                <p className="text-sm text-yellow-800">
                  Since email sending is disabled, use this link to reset your password:
                </p>
                <a 
                  href={debugInfo.link} 
                  className="block mt-2 text-sm text-blue-600 hover:underline overflow-ellipsis overflow-hidden"
                >
                  {debugInfo.link}
                </a>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => setSubmitted(false)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <Link to="/auth/sign-in" className="text-blue-600 hover:underline flex items-center justify-center gap-1">
                <HiArrowNarrowLeft /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center">Forgot Password?</h2>
            <p className="text-gray-600 mb-6 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <Link to="/auth/sign-in" className="text-blue-600 hover:underline text-sm">
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
