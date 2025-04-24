import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  HiUserCircle, HiOutlineMail, HiOutlinePhone, HiOutlineCalendar,
  HiOutlineTrash, HiOutlineStar, HiOutlineX, HiChevronDown,
  HiOutlineCheck, HiOutlineClock, HiFilter, HiCreditCard,
  HiExclamation
} from 'react-icons/hi';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [trainerBookings, setTrainerBookings] = useState([]);
  const [bookingTab, setBookingTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedTrainerBooking, setSelectedTrainerBooking] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    review: ''
  });
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user data
        const userResponse = await api.get('/user/profile');
        setUserData(userResponse.data);
        
        // Get all bookings in one request if possible
        try {
          const bookingsResponse = await api.get('/user/profile/bookings');
          if (bookingsResponse.data.success) {
            setBookings(bookingsResponse.data.gymBookings || []);
            setTrainerBookings(bookingsResponse.data.trainerBookings || []);
          } else {
            // Fallback to separate requests if combined endpoint fails
            await fetchBookingsSeparately();
          }
        } catch (bookingsError) {
          console.error('Error fetching combined bookings:', bookingsError);
          // Fallback to separate requests
          await fetchBookingsSeparately();
        }
        
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchBookingsSeparately = async () => {
      try {
        // Get gym bookings
        const bookingsResponse = await api.get('/bookings/user');
        setBookings(bookingsResponse.data);
        
        // Get trainer bookings
        const trainerBookingsResponse = await api.get('/trainers/bookings');
        setTrainerBookings(trainerBookingsResponse.data);
      } catch (error) {
        console.error('Error fetching separate bookings:', error);
        toast.error('Failed to load some booking data');
      }
    };
    
    fetchData();
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    try {
      await api.post('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  // Add this function to handle automatic payment status updates when booking status changes
  const syncPaymentStatus = (booking) => {
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      const paymentStatus = booking.payment?.status || booking.paymentStatus;
      return paymentStatus === 'completed' ? paymentStatus : 'completed';
    }
    return booking.payment?.status || booking.paymentStatus || 'pending';
  };

  // Update the booking cancellation handler to include payment status synchronization
  const handleBookingCancellation = async (bookingId, bookingType) => {
    try {
      setCancellingBookingId(bookingId);
      
      // Check if the booking is confirmed - if so, don't allow cancellation
      const booking = bookingType === 'gym' 
        ? bookings.find(b => b._id === bookingId)
        : trainerBookings.find(b => b._id === bookingId);
        
      if (booking && (booking.status === 'confirmed' || booking.status === 'completed')) {
        toast.error('Confirmed or completed bookings cannot be cancelled');
        setCancellingBookingId(null);
        return;
      }
      
      if (bookingType === 'gym') {
        await api.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' });
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
        ));
      } else if (bookingType === 'trainer') {
        await api.patch(`/trainers/bookings/${bookingId}/status`, { status: 'cancelled' });
        setTrainerBookings(trainerBookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
        ));
      }
      
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Add a new handler for deleting completed bookings
  const handleBookingDeletion = async (bookingId, bookingType) => {
    if (!window.confirm('Are you sure you want to delete this booking from your history?')) {
      return;
    }
    
    try {
      setCancellingBookingId(bookingId);
      
      if (bookingType === 'gym') {
        await api.delete(`/bookings/${bookingId}`);
        setBookings(bookings.filter(booking => booking._id !== bookingId));
      } else if (bookingType === 'trainer') {
        await api.delete(`/trainers/bookings/${bookingId}`);
        setTrainerBookings(trainerBookings.filter(booking => booking._id !== bookingId));
      }
      
      toast.success('Booking deleted from history');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const openFeedbackModal = (booking) => {
    // Only allow feedback for completed bookings
    if (booking.status !== 'completed') {
      toast.info('You can only review completed sessions');
      return;
    }
    
    setSelectedTrainerBooking(booking);
    setShowFeedbackModal(true);
  };

  const handleFeedbackChange = (e) => {
    setFeedbackData({
      ...feedbackData,
      [e.target.name]: e.target.value
    });
  };

  const handleRatingChange = (rating) => {
    setFeedbackData({
      ...feedbackData,
      rating
    });
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (feedbackData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      await api.post('/feedback', {
        trainerId: selectedTrainerBooking.trainer._id,
        bookingId: selectedTrainerBooking._id,
        rating: feedbackData.rating,
        review: feedbackData.review
      });
      
      // Mark booking as reviewed
      const updatedBookings = trainerBookings.map(booking => 
        booking._id === selectedTrainerBooking._id ? { ...booking, reviewed: true } : booking
      );
      setTrainerBookings(updatedBookings);
      
      toast.success('Feedback submitted successfully');
      setShowFeedbackModal(false);
      setFeedbackData({ rating: 0, review: '' });
      setSelectedTrainerBooking(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const filterBookings = (bookingType, status) => {
    let filtered = [];
    
    if (bookingType === 'gym') {
      filtered = bookings;
    } else if (bookingType === 'trainer') {
      filtered = trainerBookings;
    } else {
      filtered = [...bookings, ...trainerBookings];
    }
    
    if (status !== 'all') {
      filtered = filtered.filter(booking => booking.status === status);
    }
    
    // Sort by date (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.bookingDate || a.sessionDate);
      const dateB = new Date(b.bookingDate || b.sessionDate);
      return dateB - dateA;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBookingStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    
    const statusIcon = {
      pending: <HiOutlineClock className="mr-1" />,
      confirmed: <HiOutlineCheck className="mr-1" />,
      cancelled: <HiOutlineX className="mr-1" />,
      completed: <HiOutlineCheck className="mr-1" />
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusIcon[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredBookings = filterBookings(bookingTab, statusFilter);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer />
      
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg text-white p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-4xl shadow-md">
            <HiUserCircle />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl font-bold">{userData?.name || user?.name}</h1>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 text-blue-100">
              <div className="flex items-center justify-center md:justify-start">
                <HiOutlineMail className="mr-2" />
                {userData?.email || user?.email}
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <HiOutlinePhone className="mr-2" />
                {userData?.phoneNumber || user?.phoneNumber}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => setIsChangingPassword(true)} 
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Change Password
            </button>
            <button 
              onClick={() => {
                logout();
                navigate('/');
              }} 
              className="px-4 py-2 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Bookings Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-6 overflow-x-auto">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                bookingTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setBookingTab('all')}
            >
              All Bookings
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                bookingTab === 'gym'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setBookingTab('gym')}
            >
              Gym Sessions
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                bookingTab === 'trainer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setBookingTab('trainer')}
            >
              Trainer Sessions
            </button>
          </nav>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center">
          <HiFilter className="text-gray-500 mr-2" />
          <span className="text-sm text-gray-600 mr-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-500">
          {filteredBookings.length} bookings found
        </div>
      </div>
      
      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <HiOutlineCalendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
          <p className="text-gray-500 mb-6">
            {bookingTab === 'all' && statusFilter === 'all' 
              ? "You haven't made any bookings yet."
              : "No bookings match your current filters."
            }
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/dashboard/book-gym" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Book Gym Session
            </Link>
            <Link to="/dashboard/book-trainer" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
              Book Trainer
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden divide-y divide-gray-200">
          {filteredBookings.map((booking) => {
            const isGymBooking = booking.workoutType !== undefined;
            const bookingType = isGymBooking ? 'gym' : 'trainer';
            const bookingDate = isGymBooking ? booking.bookingDate : booking.sessionDate;
            const isExpanded = expandedBookingId === booking._id;
            const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
            const canReview = bookingType === 'trainer' && booking.status === 'completed' && !booking.reviewed;
            
            return (
              <div key={booking._id} className="hover:bg-gray-50 transition-colors">
                {/* Booking Summary Row */}
                <div 
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedBookingId(isExpanded ? null : booking._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isGymBooking ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                      {isGymBooking ? (
                        <span role="img" aria-label="gym" className="text-2xl">🏋️</span>
                      ) : (
                        <span role="img" aria-label="trainer" className="text-2xl">👨‍🏫</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {isGymBooking 
                          ? `${booking.workoutType} Session`
                          : `Session with ${booking.trainer?.name || 'Trainer'}`
                        }
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <HiOutlineCalendar className="mr-1.5 h-4 w-4 flex-shrink-0" />
                        {formatDate(bookingDate)}
                        {isGymBooking && (
                          <span className="ml-4">
                            {booking.startTime} - {booking.endTime}
                          </span>
                        )}
                        {!isGymBooking && (
                          <span className="ml-4">
                            {booking.time || 'Scheduled time'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-16 sm:ml-0">
                    {getBookingStatusBadge(booking.status)}
                    <button className="text-gray-500">
                      <HiChevronDown className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-6 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
                        <dl className="grid grid-cols-1 gap-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Booking ID:</dt>
                            <dd className="text-sm text-gray-900">{booking._id}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Date:</dt>
                            <dd className="text-sm text-gray-900">{formatDate(bookingDate)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Time:</dt>
                            <dd className="text-sm text-gray-900">
                              {isGymBooking 
                                ? `${booking.startTime} - ${booking.endTime}`
                                : booking.time || 'Scheduled time'
                              }
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Status:</dt>
                            <dd className="text-sm text-gray-900">{getBookingStatusBadge(booking.status)}</dd>
                          </div>
                          {isGymBooking && (
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-500">Workout Type:</dt>
                              <dd className="text-sm text-gray-900">{booking.workoutType}</dd>
                            </div>
                          )}
                          {!isGymBooking && (
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-500">Trainer:</dt>
                              <dd className="text-sm text-gray-900">{booking.trainer?.name || 'Unknown'}</dd>
                            </div>
                          )}
                          {!isGymBooking && booking.trainer?.specialization && (
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-500">Specialization:</dt>
                              <dd className="text-sm text-gray-900">{booking.trainer.specialization}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Payment Details</h4>
                        <dl className="grid grid-cols-1 gap-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Amount:</dt>
                            <dd className="text-sm text-gray-900">
                              ₹{isGymBooking ? (booking.payment?.amount || 0) : (booking.amount || 0)}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Payment Method:</dt>
                            <dd className="text-sm text-gray-900">
                              {isGymBooking 
                                ? (booking.payment?.method?.charAt(0).toUpperCase() + booking.payment?.method?.slice(1) || 'Cash')
                                : (booking.paymentMethod?.charAt(0).toUpperCase() + booking.paymentMethod?.slice(1) || 'Cash')
                              }
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Payment Status:</dt>
                            <dd className="text-sm text-gray-900">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' || booking.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : (isGymBooking && booking.payment?.status === 'completed' || booking.paymentStatus === 'completed')
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                <HiCreditCard className="mr-1" />
                                {booking.status === 'confirmed' || booking.status === 'completed'
                                  ? 'Completed' 
                                  : (isGymBooking 
                                    ? (booking.payment?.status?.charAt(0).toUpperCase() + booking.payment?.status?.slice(1) || 'Pending')
                                    : (booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1) || 'Pending')
                                  )
                                }
                              </span>
                            </dd>
                          </div>
                        </dl>
                        
                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-3">
                          {/* Show Review button for completed trainer sessions that haven't been reviewed */}
                          {!isGymBooking && booking.status === 'completed' && !booking.reviewed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openFeedbackModal(booking);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              <HiOutlineStar className="mr-1" /> Leave Review
                            </button>
                          )}
                          
                          {/* Only show cancel button for pending bookings, not for confirmed or completed */}
                          {booking.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookingCancellation(booking._id, bookingType);
                              }}
                              disabled={cancellingBookingId === booking._id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                              {cancellingBookingId === booking._id ? (
                                <>Cancelling...</>
                              ) : (
                                <>
                                  <HiOutlineTrash className="mr-1" /> Cancel Booking
                                </>
                              )}
                            </button>
                          )}
                          
                          {/* Show delete button for completed bookings */}
                          {(booking.status === 'completed' || booking.status === 'cancelled') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookingDeletion(booking._id, bookingType);
                              }}
                              disabled={cancellingBookingId === booking._id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
                            >
                              {cancellingBookingId === booking._id ? (
                                <>Processing...</>
                              ) : (
                                <>
                                  <HiOutlineTrash className="mr-1" /> Remove from History
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Password Change Modal */}
      {isChangingPassword && (
        <>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                  <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPasswordChange}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Feedback Modal */}
      {showFeedbackModal && selectedTrainerBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-semibold mb-2">Rate Your Experience</h3>
            <p className="text-gray-600 mb-4">
              How was your session with {selectedTrainerBooking.trainer?.name}?
            </p>
            
            <form onSubmit={handleSubmitFeedback}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none"
                    >
                      {star <= feedbackData.rating ? (
                        <HiOutlineStar className="w-8 h-8 text-yellow-500 fill-current" />
                      ) : (
                        <HiOutlineStar className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review (Optional)</label>
                <textarea
                  name="review"
                  value={feedbackData.review}
                  onChange={handleFeedbackChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder="Share your experience with this trainer..."
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackData({ rating: 0, review: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackData.rating === 0}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;