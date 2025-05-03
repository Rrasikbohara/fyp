import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  HiRefresh, HiSearch, HiAdjustments, HiCheck, HiX, 
  HiClock, HiCalendar, HiUserCircle, HiCurrencyDollar, HiOutlineBookOpen,
  HiBriefcase, HiDotsVertical, HiChevronDown, HiChevronUp, HiTrash, HiExclamationCircle,
} from 'react-icons/hi';

const AdminBooking = () => {
  const navigate = useNavigate();
  const { user, adminAuth, logoutAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  // Filtering
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Check auth status when component mounts
  useEffect(() => {
    console.log('AdminBooking: Admin auth state:', adminAuth);

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

      if (!adminAuth || !adminAuth.isAuthenticated) {
        console.error('Admin not authenticated');
        setError('Admin authentication required. Please log in again.');
        toast.error('Authentication required');
        return;
      }

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.error('No admin token found in localStorage');
        setError('Admin token not found. Please log in again.');
        toast.error('Authentication token missing');
        logoutAdmin();
        return;
      }

      console.log('Admin token found, length:', adminToken.length);

      const response = await api.get('/bookings/admin', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('Fetched gym bookings:', response.data.length || 0, 'bookings');

      const processedBookings = response.data.map(booking => {
        const userName = booking.user?.name || booking.user?.username || 'Unknown User';
        const userEmail = booking.user?.email || 'No email';
        const userPhone = booking.user?.phoneNumber || booking.user?.phone || 'No phone';

        return {
          ...booking,
          user: {
            ...booking.user,
            name: userName,
            email: userEmail,
            phoneNumber: userPhone
          }
        };
      });

      setBookings(processedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);

      if (error.response?.status === 403) {
        console.error('Admin access denied. Current auth state:', adminAuth);
        setError('Access denied. Admin privileges required. Please login again with an admin account.');
        toast.error('Access denied. Admin privileges required.');

        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        logoutAdmin();
      } else {
        setError('Failed to load bookings. Please try again.');
        toast.error('Error fetching bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminAuth.isAuthenticated) {
      fetchBookings();
    }
  }, [adminAuth.isAuthenticated]);

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false;
    }

    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !(
      booking.user?.name?.toLowerCase().includes(searchLower) ||
      booking.user?.email?.toLowerCase().includes(searchLower) ||
      booking.workoutType?.toLowerCase().includes(searchLower) ||
      booking._id?.toLowerCase().includes(searchLower)
    )) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'user.name') {
      valA = a.user?.name;
      valB = b.user?.name;
    } else if (sortBy === 'payment.amount') {
      valA = a.payment?.amount;
      valB = b.payment?.amount;
    } else if (sortBy === 'payment.status') {
      valA = a.payment?.status;
      valB = b.payment?.status;
    }

    if (valA === undefined) return sortOrder === 'asc' ? -1 : 1;
    if (valB === undefined) return sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'createdAt' || sortBy === 'bookingDate') {
      return sortOrder === 'asc' 
        ? new Date(valA) - new Date(valB)
        : new Date(valB) - new Date(valA);
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const handleStatusChange = async (id, status) => {
    try {
      setStatusUpdating(id);

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.warn('No admin token found when trying to update booking status');
        toast.error('Admin authentication required');
        return;
      }

      const response = await api.patch(`/bookings/${id}/status`, 
        { status },
        { 
          headers: { 
            'Authorization': `Bearer ${adminToken}` 
          } 
        }
      );

      if (response.data.success) {
        setBookings(bookings.map(booking => 
          booking._id === id ? { ...booking, status } : booking
        ));

        toast.success(`Booking status updated to ${status}`);
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handlePaymentStatusChange = async (id, status) => {
    try {
      setStatusUpdating(id);
      await api.patch(`/bookings/${id}/payment`, { status });

      setBookings(bookings.map(booking => 
        booking._id === id ? { 
          ...booking, 
          payment: { ...booking.payment, status },
          status: status === 'completed' ? 'confirmed' : booking.status
        } : booking
      ));

      toast.success(`Payment status updated to ${status}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      setStatusUpdating(id);

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Admin authentication required');
        return;
      }

      await api.delete(`/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      setBookings(bookings.filter(booking => booking._id !== id));
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDeleteAllCancelled = async () => {
    if (!window.confirm('Are you sure you want to delete ALL cancelled bookings?')) {
      return;
    }

    try {
      setLoading(true);

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Admin authentication required');
        return;
      }

      const response = await api.delete('/bookings/cancelled/all', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      await fetchBookings();
      toast.success(`${response.data.deletedCount || 'All'} cancelled bookings deleted`);
    } catch (error) {
      console.error('Error deleting cancelled bookings:', error);
      toast.error('Failed to delete cancelled bookings');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

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

  const PaymentBadge = ({ status, method }) => {
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
      <div className="flex flex-col">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <span className="text-xs text-gray-500 mt-1">
          via {method === 'credit_card' ? 'Credit Card' : method.charAt(0).toUpperCase() + method.slice(1)}
        </span>
      </div>
    );
  };

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
          <h1 className="text-2xl font-bold mb-1">Gym Bookings</h1>
          <p className="text-gray-600">Manage and monitor all gym bookings</p>
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
      
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings by user or workout type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <HiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <span className="text-gray-500 mr-2 text-sm">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-500 mr-2 text-sm">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setSortOrder('desc');
                }}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="createdAt">Date Booked</option>
                <option value="bookingDate">Session Date</option>
                <option value="user.name">User Name</option>
                <option value="workoutType">Workout Type</option>
                <option value="payment.amount">Amount</option>
                <option value="status">Status</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 ml-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                {sortOrder === 'asc' ? 
                  <HiChevronUp className="w-5 h-5" /> : 
                  <HiChevronDown className="w-5 h-5" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No bookings found</p>
            <p className="text-gray-400 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 admin-table-responsive">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('user.name')}>
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('workoutType')}>
                    Workout Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('bookingDate')}>
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('payment.amount')}>
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
                        <div className="flex items-center">
                          <HiBriefcase className="text-gray-500 mr-2" />
                          <span className="text-sm text-gray-900">{booking.workoutType || 'General'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <HiCalendar className="text-gray-500 mr-2" />
                          {formatDate(booking.bookingDate)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">₹{booking.payment?.amount || 0}</div>
                        <PaymentBadge 
                          status={booking.payment?.status || 'pending'} 
                          method={booking.payment?.method || 'cash'} 
                        />
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
                    
                    {expandedId === booking._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Booking Details</h4>
                              <div className="space-y-2">
                                <p><span className="text-gray-500">Booking ID:</span> {booking._id}</p>
                                <p><span className="text-gray-500">Duration:</span> {booking.duration} hour(s)</p>
                                <p><span className="text-gray-500">Created:</span> {formatDate(booking.createdAt)}</p>
                                <p><span className="text-gray-500">Notes:</span> {booking.notes || 'No notes'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">User Details</h4>
                              <div className="space-y-2">
                                <p><span className="text-gray-500">Name:</span> {booking.user?.name || 'Unknown'}</p>
                                <p><span className="text-gray-500">Email:</span> {booking.user?.email || 'No email'}</p>
                                <p><span className="text-gray-500">Phone:</span> {booking.user?.phoneNumber || booking.user?.phone || 'No phone'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-gray-200">
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
                            
                            {booking.payment?.status === 'pending' && (
                              <button
                                onClick={() => handlePaymentStatusChange(booking._id, 'completed')}
                                disabled={statusUpdating === booking._id}
                                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 disabled:opacity-50"
                              >
                                {statusUpdating === booking._id ? 'Updating...' : 'Mark Paid'}
                              </button>
                            )}
                            
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
      
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminBooking;
