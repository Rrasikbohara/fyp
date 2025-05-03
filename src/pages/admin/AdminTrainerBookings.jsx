import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  HiRefresh, HiSearch, HiCheck, HiX, HiClock, 
  HiCalendar, HiUserCircle, HiCurrencyDollar, 
  HiChevronDown, HiChevronUp, HiFilter, HiTrash,
  HiExclamationCircle
} from 'react-icons/hi';

const AdminTrainerBookings = () => {
  const navigate = useNavigate();
  const { adminAuth, logoutAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('sessionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Check auth status when component mounts
  useEffect(() => {
    console.log('AdminTrainerBookings: Admin auth state:', adminAuth);
    
    // If admin auth is loaded and not authenticated, redirect to login
    if (!adminAuth.loading && !adminAuth.isAuthenticated) {
      console.error('Admin not authenticated, redirecting to login');
      toast.error('Please sign in as admin to access this page');
      navigate('/admin/sign-in');
    }
  }, [adminAuth, navigate]);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check admin auth state first
      if (!adminAuth || !adminAuth.isAuthenticated) {
        console.error('Admin not authenticated');
        setError('Admin authentication required. Please log in again.');
        toast.error('Authentication required');
        return;
      }
      
      // Get admin token for auth - ensure it's retrieving the token correctly
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.error('No admin token found');
        setError('Admin token not found. Please log in again.');
        toast.error('Authentication token missing');
        
        // Force logout and redirect
        logoutAdmin();
        return;
      }
      
      console.log('Using admin token of length:', adminToken.length);
      
      // Using the correct endpoint with explicit token
      const response = await api.get('/trainers/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      console.log('Fetched trainer bookings:', response.data.length || 0);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching trainer bookings:', error);
      
      if (error.response?.status === 403) {
        // Handle 403 error specifically
        console.error('Admin access denied. Current auth state:', adminAuth);
        setError('Access denied. Admin privileges required. Please login again with an admin account.');
        toast.error('Access denied. Admin privileges required.');
        
        // Clear invalid admin token and redirect
        logoutAdmin();
      } else {
        setError('Failed to load bookings. Please try again.');
        toast.error('Failed to load trainer bookings');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFeedbacks = async () => {
    try {
      const response = await api.get('/feedback');
      setFeedbacks(response.data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to fetch feedback');
    }
  };

  useEffect(() => {
    if (adminAuth.isAuthenticated) {
      fetchBookings();
      fetchFeedbacks();
    }
  }, [adminAuth.isAuthenticated]);
  
  // Add delete booking function
  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }
    
    try {
      setStatusUpdating(id);
      
      // Ensure admin is authenticated
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Admin authentication required');
        return;
      }
      
      await api.delete(`/trainers/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      // Remove booking from the list
      setBookings(bookings.filter(booking => booking._id !== id));
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    } finally {
      setStatusUpdating(null);
    }
  };
  
  // Add bulk delete function for cancelled bookings
  const handleDeleteAllCancelled = async () => {
    if (!window.confirm('Are you sure you want to delete ALL cancelled bookings?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Ensure admin is authenticated
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Admin authentication required');
        return;
      }
      
      const response = await api.delete('/trainers/bookings/cancelled/all', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      // Refresh the bookings list
      await fetchBookings();
      toast.success(`${response.data.deletedCount || 'All'} cancelled bookings deleted`);
    } catch (error) {
      console.error('Error deleting cancelled bookings:', error);
      toast.error('Failed to delete cancelled bookings');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search, status, etc.
  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false;
    }
    
    // Search filter (case insensitive)
    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !(
      booking.user?.name?.toLowerCase().includes(searchLower) ||
      booking.trainer?.name?.toLowerCase().includes(searchLower) ||
      booking.sessionType?.toLowerCase().includes(searchLower)
    )) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort logic
    let valA = a[sortBy];
    let valB = b[sortBy];
    
    // Handle nested fields
    if (sortBy === 'user.name') {
      valA = a.user?.name;
      valB = b.user?.name;
    } else if (sortBy === 'trainer.name') {
      valA = a.trainer?.name;
      valB = b.trainer?.name;
    } else if (sortBy === 'amount') {
      valA = a.amount;
      valB = b.amount;
    }
    
    // Default sort for undefined values
    if (valA === undefined) return sortOrder === 'asc' ? -1 : 1;
    if (valB === undefined) return sortOrder === 'asc' ? 1 : -1;
    
    // Dates need special comparison
    if (sortBy === 'sessionDate' || sortBy === 'createdAt') {
      return sortOrder === 'asc' 
        ? new Date(valA) - new Date(valB)
        : new Date(valB) - new Date(valA);
    }
    
    // String comparison
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    
    // Number comparison
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });
  
  const handleStatusChange = async (id, status) => {
    try {
      setStatusUpdating(id);
      
      // Explicitly use API with your fixed interceptors
      await api.patch(`/trainers/bookings/${id}/status`, { status });
      
      // Update booking in local state
      setBookings(bookings.map(booking => 
        booking._id === id ? { 
          ...booking, 
          status, 
          // If status is completed, also update payment status
          paymentStatus: status === 'completed' ? 'completed' : booking.paymentStatus
        } : booking
      ));
      
      toast.success(`Booking status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setStatusUpdating(null);
    }
  };
  
  const handlePaymentStatusChange = async (id, paymentStatus) => {
    try {
      setStatusUpdating(id);
      
      console.log(`Updating payment status to: ${paymentStatus} for booking ID: ${id}`);
      
      // Make sure we're sending the correct property name
      const response = await api.patch(`/trainers/bookings/${id}/payment`, { 
        paymentStatus: paymentStatus // Ensure property name matches what the backend expects
      });
      
      console.log('Payment status update response:', response.status);
      
      if (response.data && response.data.success) {
        // Update booking in local state
        setBookings(bookings.map(booking => 
          booking._id === id ? { 
            ...booking, 
            paymentStatus,
            // If payment is completed and booking was pending, update status too
            status: paymentStatus === 'completed' && booking.status === 'pending' ? 'confirmed' : booking.status
          } : booking
        ));
        
        toast.success(`Payment status updated to ${paymentStatus}`);
      } else {
        throw new Error(response.data?.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    } finally {
      setStatusUpdating(null);
    }
  };
  
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = '';
    let textColor = '';
    let icon = null;
    
    switch (status) {
      case 'confirmed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <HiCheck className="w-4 h-4" />;
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        icon = <HiX className="w-4 h-4" />;
        break;
      case 'completed':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        icon = <HiCheck className="w-4 h-4" />;
        break;
      default:
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = <HiClock className="w-4 h-4" />;
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Payment status badge
  const PaymentBadge = ({ status }) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'failed':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // If not authenticated, show appropriate message
  if (!adminAuth.isAuthenticated && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg shadow-sm mb-4">
          <HiExclamationCircle className="text-red-500 text-4xl mx-auto mb-2" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p>You must be logged in as an admin to view this page.</p>
          <button 
            onClick={() => navigate('/admin/sign-in')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  if (loading && !bookings.length) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Trainer Bookings</h1>
          <p className="text-gray-600">Manage and monitor all personal trainer sessions</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            <HiRefresh className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          
          <button 
            onClick={handleDeleteAllCancelled}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
          >
            <HiTrash className="mr-1" />
            Delete All Cancelled
          </button>
        </div>
      </div>
      
      {/* Filtering and Search */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by user, trainer or session type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <HiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <HiFilter className="text-gray-500 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Bookings table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No trainer bookings found</p>
            <p className="text-gray-400 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('user.name')}>
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('trainer.name')}>
                    Trainer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('sessionDate')}>
                    Session Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('amount')}>
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map(booking => (
                  <React.Fragment key={booking._id}>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(booking._id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <HiUserCircle className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{booking.user?.name || 'Unknown User'}</div>
                            <div className="text-sm text-gray-500">{booking.user?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.trainer?.name || 'Unknown Trainer'}</div>
                        <div className="text-sm text-gray-500">{booking.trainer?.specialization || 'No specialization'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <HiCalendar className="text-gray-500 mr-2" />
                          {formatDate(booking.sessionDate)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {booking.time || 'No time specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">₹{booking.amount || 0}</div>
                        <PaymentBadge status={booking.paymentStatus || 'pending'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(booking._id);
                          }}
                        >
                          {expandedId === booking._id ? (
                            <HiChevronUp className="h-5 w-5" />
                          ) : (
                            <HiChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded details row */}
                    {expandedId === booking._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Session Details</h4>
                              <div className="space-y-2">
                                <p><span className="text-gray-500">Booking ID:</span> {booking._id}</p>
                                <p><span className="text-gray-500">Session Type:</span> {booking.sessionType || 'Personal Training'}</p>
                                <p><span className="text-gray-500">Duration:</span> {booking.duration || 1} hour(s)</p>
                                <p><span className="text-gray-500">Notes:</span> {booking.notes || 'No notes'}</p>
                                <p><span className="text-gray-500">Created:</span> {formatDate(booking.createdAt)}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">User Details</h4>
                              <div className="space-y-2">
                                <p><span className="text-gray-500">Name:</span> {booking.user?.name || 'Unknown'}</p>
                                <p><span className="text-gray-500">Email:</span> {booking.user?.email || 'No email'}</p>
                                <p><span className="text-gray-500">Phone:</span> {booking.user?.phoneNumber || 'No phone'}</p>
                              </div>
                              
                              {booking.reviewed && (
                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-700 mb-2">User Feedback</h4>
                                  <div className="bg-blue-50 p-3 rounded">
                                    <div className="flex items-center mb-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <HiStar 
                                          key={star} 
                                          className={star <= (booking.rating || 0) ? "text-yellow-500" : "text-gray-300"} 
                                        />
                                      ))}
                                      <span className="ml-2 text-sm font-medium">{booking.rating || 0}/5</span>
                                    </div>
                                    <p className="text-sm italic">{booking.review || 'No written review'}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-gray-200">
                            {/* Status update buttons */}
                            {(booking.status !== 'cancelled') && (
                              <>
                                {booking.status !== 'confirmed' && (
                                  <button
                                    onClick={() => handleStatusChange(booking._id, 'confirmed')}
                                    disabled={statusUpdating === booking._id}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50"
                                  >
                                    {statusUpdating === booking._id ? 'Updating...' : 'Confirm'}
                                  </button>
                                )}
                                
                                {booking.status !== 'completed' && (
                                  <button
                                    onClick={() => handleStatusChange(booking._id, 'completed')}
                                    disabled={statusUpdating === booking._id}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 disabled:opacity-50"
                                  >
                                    {statusUpdating === booking._id ? 'Updating...' : 'Mark Complete'}
                                  </button>
                                )}
                                
                                {booking.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleStatusChange(booking._id, 'cancelled')}
                                    disabled={statusUpdating === booking._id}
                                    className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50"
                                  >
                                    {statusUpdating === booking._id ? 'Updating...' : 'Cancel'}
                                  </button>
                                )}
                              </>
                            )}
                            
                            {/* Payment update button */}
                            {booking.paymentStatus !== 'completed' && (
                              <button
                                onClick={() => handlePaymentStatusChange(booking._id, 'completed')}
                                disabled={statusUpdating === booking._id}
                                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 disabled:opacity-50"
                              >
                                {statusUpdating === booking._id ? 'Updating...' : 'Mark Paid'}
                              </button>
                            )}
                            
                            {/* Delete button - always available for admin */}
                            <button
                              onClick={() => handleDeleteBooking(booking._id)}
                              disabled={statusUpdating === booking._id}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50"
                            >
                              {statusUpdating === booking._id ? 'Processing...' : 'Delete Booking'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Showing count of bookings */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredBookings.length} of {bookings.length} trainer bookings
      </div>

      {/* Feedback section */}
      <div className="feedback-section mt-8">
        <h2 className="text-xl font-bold mb-4">Trainer Feedback</h2>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500">No feedback available</p>
        ) : (
          <ul className="space-y-4">
            {feedbacks.map((feedback) => (
              <li key={feedback._id} className="p-4 border rounded-md shadow-sm">
                <p className="text-sm text-gray-700">
                  <strong>Trainer:</strong> {feedback.trainer?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>User:</strong> {feedback.user?.name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Rating:</strong> {feedback.rating}/5
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Review:</strong> {feedback.review || 'No review provided'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminTrainerBookings;
