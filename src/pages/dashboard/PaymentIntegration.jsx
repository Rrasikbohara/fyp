import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Loader from '../../components/Loader';
import { HiCheckCircle, HiCurrencyDollar, HiCalendar, HiUserCircle, HiClock } from 'react-icons/hi';

const PaymentIntegration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [error, setError] = useState(null);
  const [successfulPayment, setSuccessfulPayment] = useState(false);
  
  // Extract and validate state data
  const { bookingData, trainer } = location.state || {};
  
  useEffect(() => {
    // Validate the state data when component mounts
    if (!bookingData || !trainer) {
      toast.error('Invalid booking information');
      setTimeout(() => navigate('/dashboard/book-trainer'), 2000);
      return;
    }
    
    // Setup payment details
    setPaymentDetails({
      amount: bookingData.amount,
      trainerName: trainer.name,
      duration: bookingData.duration,
      sessionDate: new Date(bookingData.sessionDate).toLocaleString()
    });

    // If cash payment, process the booking directly
    if (bookingData.paymentMethod === 'cash') {
      handleCashPayment();
    }
  }, [bookingData, trainer, navigate]);

  const handleCashPayment = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      const paymentData = {
        ...bookingData,
        paymentMethod: 'cash',
        paymentStatus: 'pending'
      };
      
      const response = await api.post(`/trainers/${trainer._id}/book`, paymentData);
      
      toast.success('Booking successful! Please pay in cash at the gym.');
      setSuccessfulPayment(true);
      
      // Delay navigation to show success message
      setTimeout(() => {
        navigate('/dashboard/profile');
      }, 3000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.message || 'Failed to create booking');
      toast.error('Failed to create booking');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingData || !trainer) {
      toast.error('Missing booking information');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      console.log('Processing Khalti payment...');
      console.log('Payment data:', bookingData);
      console.log('Trainer ID:', trainer._id);
      
      // Simulate Khalti payment process
      toast.info('Processing payment...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create booking data with completed payment status
      const paymentData = {
        duration: Number(bookingData.duration),
        sessionDate: bookingData.sessionDate,
        startHour: bookingData.startHour,
        paymentMethod: bookingData.paymentMethod,
        paymentStatus: 'completed',
        amount: bookingData.amount,
        transactionId: `${bookingData.paymentMethod.toUpperCase()}-${Math.random().toString(36).substring(2, 15)}`
      };
      
      console.log('Payment data to send:', paymentData);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Using auth token:', token ? 'Yes (hidden)' : 'No token found');
      
      // Use fetch API for direct and reliable API call
      const apiUrl = `http://localhost:3000/api/trainers/${trainer._id}/book`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(paymentData),
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
      }
      
      setSuccessfulPayment(true);
      toast.success('Payment successful and booking confirmed!');
      
      // Delay redirect to show success message
      setTimeout(() => navigate('/dashboard/profile'), 2000);
    } catch (error) {
      console.error('Payment/booking error:', error);
      setError(error.message || 'Payment failed');
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!bookingData || !trainer) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-xl font-medium mb-4">Invalid booking information</h2>
        <p className="text-gray-600 mb-4">Redirecting to trainer booking page...</p>
        <div className="flex justify-center">
          <Loader size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl overflow-hidden">
      <ToastContainer />
      
      <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <HiCurrencyDollar className="h-7 w-7" />
          {bookingData.paymentMethod === 'cash' ? 'Cash Payment' : 'Online Payment'}
        </h2>
        <p className="opacity-80">Complete your booking for a personal training session</p>
      </div>
      
      <div className="p-6">
        {successfulPayment ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <HiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-700 mb-2">Booking Successful!</h3>
            <p className="text-gray-600 mb-4">
              {bookingData.paymentMethod === 'cash' 
                ? 'Your booking has been confirmed. Please pay in cash at the gym.'
                : 'Your payment was successful and your booking has been confirmed.'}
            </p>
            <p className="text-sm text-gray-500">Redirecting to your profile...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-4">
              <h3 className="font-bold text-lg text-gray-800">Booking Details</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <HiUserCircle className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Trainer</p>
                    <p className="font-semibold">{trainer.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <HiCalendar className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Session Date</p>
                    <p className="font-semibold">{new Date(bookingData.sessionDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <HiClock className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Time & Duration</p>
                    <p className="font-semibold">
                      {`${bookingData.startHour}:00 - ${bookingData.startHour + Number(bookingData.duration)}:00`} ({bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <HiCurrencyDollar className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-bold text-lg">₹{bookingData.amount}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            {bookingData.paymentMethod === 'cash' ? (
              <div className="flex justify-center">
                <Loader size="md" />
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                  <h4 className="font-medium text-blue-800 mb-2">Payment Method</h4>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      bookingData.paymentMethod === 'khalti' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <HiCurrencyDollar className={`w-5 h-5 ${
                        bookingData.paymentMethod === 'khalti' ? 'text-purple-700' : 'text-blue-700'
                      }`} />
                    </div>
                    <div className="font-medium">
                      {bookingData.paymentMethod === 'khalti' ? 'Khalti' : 'Credit Card'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className={`w-full ${
                    bookingData.paymentMethod === 'khalti' 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white p-4 rounded-lg transition-colors flex items-center justify-center space-x-3 font-medium disabled:opacity-70`}
                >
                  {processing ? (
                    <>
                      <Loader size="sm" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                      </svg>
                      <span>Pay Now - ₹{bookingData.amount}</span>
                    </>
                  )}
                </button>
              </>
            )}
            
            <button
              onClick={() => navigate('/dashboard/book-trainer')}
              disabled={processing}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 p-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel and Return
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentIntegration;
