import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HiCalendar, HiClock, HiCurrencyRupee, HiStar } from 'react-icons/hi';

const BookTrainer = () => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('khalti'); // Default to Khalti
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const navigate = useNavigate();

  // Fetch all trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/trainers');
        setTrainers(response.data);
      } catch (error) {
        setError('Failed to load trainers. Please try again later.');
        toast.error('Error loading trainers');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  // Fetch availability when trainer or date changes
  useEffect(() => {
    if (selectedTrainer) {
      fetchAvailability();
    }
  }, [selectedTrainer, selectedDate, duration]);

  const fetchAvailability = async () => {
    try {
      // Format date for query parameter
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const response = await api.get(
        `/trainers/${selectedTrainer._id}/availability?date=${formattedDate}`
      );
      
      // Process availability data
      const { availability } = response.data;
      
      // Filter slots that have enough consecutive hours available based on duration
      const validTimeSlots = [];
      
      for (let i = 0; i < availability.length; i++) {
        let consecutiveAvailable = 0;
        
        // Check if we have enough consecutive slots
        for (let j = i; j < i + Number(duration) && j < availability.length; j++) {
          if (availability[j].available) {
            consecutiveAvailable++;
          } else {
            break;
          }
        }
        
        if (consecutiveAvailable === Number(duration)) {
          validTimeSlots.push(availability[i].hour);
        }
      }
      
      setAvailableTimeSlots(validTimeSlots);
      
      // Reset selected time if it's no longer available
      if (selectedTime !== null && !validTimeSlots.includes(selectedTime)) {
        setSelectedTime(null);
      }
    } catch (error) {
      console.error('Error fetching trainer availability:', error);
      toast.error('Could not check trainer availability');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedTrainer) {
      toast.error('Please select a trainer');
      return;
    }
    
    if (selectedTime === null) {
      toast.error('Please select an available time slot');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Calculate the total amount based on trainer rate and duration
    const amount = selectedTrainer.rate * duration;

    // Create booking data
    const bookingData = {
      trainerId: selectedTrainer._id,
      sessionDate: selectedDate,
      duration: Number(duration),
      startHour: selectedTime,
      amount,
      paymentMethod
    };

    // For Khalti payments, navigate to payment page
    if (paymentMethod === 'khalti' || paymentMethod === 'credit_card') {
      navigate('/dashboard/payment', {
        state: { bookingData, trainer: selectedTrainer }
      });
    } else {
      // For cash payments, process booking directly
      handleCashPayment(bookingData);
    }
  };

  const handleCashPayment = async (bookingData) => {
    try {
      setLoading(true);
      const response = await api.post(`/trainers/${selectedTrainer._id}/book`, {
        ...bookingData,
        paymentMethod: 'cash',
        paymentStatus: 'pending'
      });
      
      toast.success('Booking successful! Please pay in cash at the gym.');
      setTimeout(() => {
        navigate('/dashboard/profile');
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Add these functions to handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await api.patch(`/trainers/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      // Refresh bookings list
      fetchAvailability();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
      toast.error(errorMessage);
    }
  };

  // Add a function to display booking status and cancellation button
  const renderBookingControl = (booking) => {
    if (booking.status === 'pending') {
      return (
        <div className="flex justify-between items-center mt-2">
          <span className="text-yellow-600 text-sm font-medium">Pending approval</span>
          <button 
            onClick={() => handleCancelBooking(booking._id)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Cancel
          </button>
        </div>
      );
    } else if (booking.status === 'confirmed') {
      return (
        <div className="flex justify-between items-center mt-2">
          <span className="text-green-600 text-sm font-medium">Confirmed</span>
          <span className="text-gray-600 text-sm">Cannot cancel confirmed bookings</span>
        </div>
      );
    } else if (booking.status === 'cancelled') {
      return (
        <div className="mt-2">
          <span className="text-red-600 text-sm font-medium">Cancelled</span>
        </div>
      );
    } else if (booking.status === 'completed') {
      return (
        <div className="mt-2">
          <span className="text-blue-600 text-sm font-medium">Completed</span>
        </div>
      );
    }
    
    return null;
  };

  // Generate time slot options
  const renderTimeOptions = () => {
    if (!selectedTrainer || availableTimeSlots.length === 0) {
      return <p className="text-red-500">No available time slots for the selected date and duration</p>;
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
        {availableTimeSlots.map(hour => (
          <div
            key={hour}
            onClick={() => setSelectedTime(hour)}
            className={`p-2 border rounded-md cursor-pointer text-center flex items-center justify-center gap-1 transition-all ${
              selectedTime === hour
                ? 'bg-blue-600 text-white border-blue-700 shadow-md transform scale-105'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
            }`}
          >
            <HiClock className={selectedTime === hour ? 'text-white' : 'text-blue-500'} />
            {`${hour}:00 - ${hour + Number(duration)}:00`}
          </div>
        ))}
      </div>
    );
  };

  if (loading && !trainers.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-solid border-blue-600 border-t-transparent shadow-md"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer />
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-t-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Book a Personal Trainer</h1>
        <p className="text-blue-100">Select a trainer and time slot that works for you</p>
      </div>
      
      <div className="bg-white shadow-lg rounded-b-lg p-6 mb-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 text-lg">Select a Trainer</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainers.map(trainer => (
                <div
                  key={trainer._id}
                  onClick={() => setSelectedTrainer(trainer)}
                  className={`border p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedTrainer?._id === trainer._id
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg mb-1 text-gray-800">{trainer.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{trainer.specialization}</div>
                    </div>
                    <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                      {trainer.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <HiStar className="text-yellow-500" />
                          <span>{trainer.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span>New</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Experience: {trainer.experience} years</div>
                  <div className="font-semibold text-blue-600 flex items-center gap-1">
                    <HiCurrencyRupee />
                    {trainer.rate}/hour
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedTrainer && (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-lg flex items-center gap-2">
                  <HiCalendar className="text-blue-600" />
                  Select Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date)}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  wrapperClassName="w-full"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-lg flex items-center gap-2">
                  <HiClock className="text-blue-600" />
                  Session Duration
                </label>
                <select
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-lg">Available Time Slots</label>
                {renderTimeOptions()}
              </div>
              
              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 text-lg flex items-center gap-2">
                  <HiCurrencyRupee className="text-blue-600" />
                  Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setPaymentMethod('khalti')}
                    className={`p-3 border rounded-lg cursor-pointer flex items-center transition-all ${
                      paymentMethod === 'khalti'
                        ? 'border-purple-500 bg-purple-50 shadow'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'khalti'}
                      onChange={() => setPaymentMethod('khalti')}
                      className="mr-2"
                    />
                    <span className="font-medium">Khalti</span>
                  </div>
                  
                  <div
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 border rounded-lg cursor-pointer flex items-center transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-blue-500 bg-blue-50 shadow'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="mr-2"
                    />
                    <span className="font-medium">Credit Card</span>
                  </div>
                  
                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 border rounded-lg cursor-pointer flex items-center transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-green-500 bg-green-50 shadow'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="mr-2"
                    />
                    <span className="font-medium">Cash (Pay at Gym)</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                  <div className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Booking Summary</div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Trainer:</span>
                        <span className="font-medium">{selectedTrainer.name}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                      </div>
                      {selectedTime !== null && (
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{`${selectedTime}:00 - ${selectedTime + Number(duration)}:00`}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{duration} hour(s)</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Rate/Hour:</span>
                        <span className="font-medium">₹{selectedTrainer.rate}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-blue-700">₹{selectedTrainer.rate * duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={selectedTime === null || loading}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2
                  ${selectedTime !== null && !loading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                `}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  `Book Now - ${paymentMethod === 'cash' ? 'Pay at Gym' : 'Proceed to Payment'}`
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookTrainer;