import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import { 
  HiCalendar, HiClock, HiCurrencyDollar, HiUser,
  HiOutlineCheckCircle, HiInformationCircle
} from 'react-icons/hi';

const BookGym = () => {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [workoutType, setWorkoutType] = useState('General');
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Add rates mapping
  const workoutRates = {
    'General': 100,
    'Cardio': 150,
    'Strength': 130,
    'Yoga': 120,
    'HIIT': 180,
    'CrossFit': 180
  };
  
  // Add capacity mapping
  const workoutCapacity = {
    'General': 15,
    'Cardio': 5,
    'Strength': 8,
    'Yoga': 12,
    'HIIT': 6,
    'CrossFit': 6
  };
  
  // Calculate duration between start and end time
  const calculateDuration = () => {
    if (!startTime || !endTime) return 1;
    
    const start = startTime.split(':').map(Number);
    const end = endTime.split(':').map(Number);
    
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    
    // Handle case where end time is on next day
    const durationMinutes = endMinutes >= startMinutes ? 
      endMinutes - startMinutes : 
      (24 * 60 - startMinutes) + endMinutes;
    
    return Math.max(1, Math.round(durationMinutes / 60));
  };
  
  // Calculate booking price based on duration and workout type
  const calculatePrice = () => {
    const basePrice = workoutRates[workoutType] || 100; // Get rate based on workout type
    const duration = calculateDuration();
    return basePrice * duration;
  };
  
  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
    
    // Automatically set end time to be 1 hour after start time
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const endHours = (hours + 1) % 24;
    const formattedEndHours = endHours.toString().padStart(2, '0');
    const formattedEndMinutes = minutes.toString().padStart(2, '0');
    
    setEndTime(`${formattedEndHours}:${formattedEndMinutes}`);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create the booking data
      const bookingData = {
        bookingDate: date,
        startTime,
        endTime,
        duration: calculateDuration(),
        workoutType,
        payment: {
          amount: calculatePrice(),
          method: 'cash', // Default to cash payment
          status: 'pending'
        }
      };
      
      console.log('Submitting booking:', bookingData);
      
      const response = await api.post('/bookings/gym', bookingData);
      
      console.log('Booking response:', response.data);
      
      toast.success('Gym booked successfully!');
      setBookingSuccess(true);
      
      // Redirect to profile after a short delay
      setTimeout(() => {
        navigate('/dashboard/profile');
      }, 2000);
    } catch (error) {
      console.error('Error booking gym:', error);
      toast.error(error.response?.data?.message || 'Failed to book gym. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Available workout types
  const workoutTypes = ['General', 'Cardio', 'Strength', 'Yoga', 'HIIT', 'CrossFit'];
  
  // Generate available time slots
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinute}`;
        options.push(
          <option key={time} value={time}>
            {time}
          </option>
        );
      }
    }
    return options;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer />
      
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-t-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Book Gym Session</h1>
        <p className="text-blue-100">Schedule your workout session at our facility</p>
      </div>
      
      {bookingSuccess ? (
        <div className="bg-white shadow-lg rounded-b-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <HiOutlineCheckCircle className="text-green-600 w-16 h-16" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Booking Successful!</h2>
            <p className="text-gray-600 mb-4">Your {workoutType} session has been booked successfully.</p>
            <p className="text-gray-500">Redirecting to your profile...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-b-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
                <HiCalendar className="text-blue-600 mr-2" />
                Select Date
              </label>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                minDate={new Date()}
                dateFormat="MMMM d, yyyy"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                wrapperClassName="w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
                  <HiClock className="text-blue-600 mr-2" />
                  Start Time
                </label>
                <select
                  value={startTime}
                  onChange={handleStartTimeChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {generateTimeOptions()}
                </select>
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
                  <HiClock className="text-blue-600 mr-2" />
                  End Time
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {generateTimeOptions()}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
                <HiUser className="text-blue-600 mr-2" />
                Workout Type
              </label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {workoutTypes.map((type) => (
                  <option key={type} value={type}>
                    {type} (₹{workoutRates[type]}/hr) - Max {workoutCapacity[type]} people
                  </option>
                ))}
              </select>
            </div>
            
            {/* Add info box for workout types */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <HiInformationCircle className="text-blue-600 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">About {workoutType}</p>
                  <p className="mt-1 text-sm text-blue-700">
                    {workoutType === 'Cardio' && 'Access to treadmills, ellipticals, and stationary bikes. Limited to 5 people per session.'}
                    {workoutType === 'Strength' && 'Access to free weights, barbells, and machine weights. Limited to 8 people per session.'}
                    {workoutType === 'Yoga' && 'Guided yoga sessions in our dedicated yoga studio. Limited to 12 people per session.'}
                    {workoutType === 'HIIT' && 'High-intensity interval training equipment. Premium rate due to specialized equipment. Limited to 6 people per session.'}
                    {workoutType === 'CrossFit' && 'Access to CrossFit equipment and WOD space. Premium rate due to specialized equipment. Limited to 6 people per session.'}
                    {workoutType === 'General' && 'General access to the main gym floor with basic equipment. Limited to 15 people per session.'}
                  </p>
                  <p className="mt-2 text-sm text-blue-800 font-medium">
                    Capacity: {workoutCapacity[workoutType]} people per session
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">Duration:</div>
                <div className="font-medium">{calculateDuration()} hour(s)</div>
                
                <div className="text-gray-600">Date:</div>
                <div className="font-medium">{date.toLocaleDateString()}</div>
                
                <div className="text-gray-600">Time:</div>
                <div className="font-medium">{startTime} - {endTime}</div>
                
                <div className="text-gray-600">Workout:</div>
                <div className="font-medium">{workoutType}</div>
                
                <div className="text-gray-600">Rate:</div>
                <div className="font-medium">₹{workoutRates[workoutType]}/hour</div>
                
                <div className="text-gray-800 font-semibold text-lg pt-2 border-t mt-2">
                  Total Price:
                </div>
                <div className="text-blue-700 font-bold text-lg pt-2 border-t mt-2 flex items-center">
                  <HiCurrencyDollar className="inline" />
                  {calculatePrice()}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  'Book Now'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookGym;