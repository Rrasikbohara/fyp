import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HiSearch, HiFilter, HiRefresh, HiOutlineCalendar, 
  HiOutlineX, HiOutlineCheck, HiOutlineClock, HiDownload,
  HiOutlineUser, HiOutlineUsers, HiOutlineCurrencyDollar,
  HiAdjustments
} from 'react-icons/hi';
import 'react-toastify/dist/ReactToastify.css';

const AdminTrainerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();
  const { adminAuth } = useAuth();
  
  // Filtering and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('sessionDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Responsive control
  const [showFilters, setShowFilters] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check authentication first
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Authentication required. Please log in.');
        setTimeout(() => navigate('/admin/signin'), 1500);
        return;
      }
      
      const res = await api.get('/admin/trainer-bookings');
      console.log('Received bookings data:', res.data);
      
      // Process bookings to handle possible null values and format data
      const processedBookings = res.data.map(booking => ({
        ...booking,
        user: booking.user || { name: 'Unknown User', email: 'N/A' },
        trainer: booking.trainer || { name: 'Unknown Trainer', specialization: 'N/A', availability: 'unknown' },
        sessionDate: booking.sessionDate ? new Date(booking.sessionDate) : new Date(),
        amount: booking.amount || 0,
        duration: booking.duration || 0,
        status: booking.status || 'pending',
        paymentStatus: booking.paymentStatus || 'pending'
      }));
      
      setBookings(processedBookings);
      applyFilters(processedBookings, searchQuery, statusFilter, sortField, sortDirection);
      
      toast.success(`Loaded ${processedBookings.length} bookings`);
    } catch (error) {
      console.error('Error fetching trainer bookings:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
        toast.error('Session expired. Please log in again.');
        setTimeout(() => navigate('/admin/signin'), 1500);
        return;
      }
      
      setError('Failed to load trainer bookings. Please try again later.');
      toast.error(`Failed to load trainer bookings: ${error.response?.status === 404 ? 'Endpoint not found (404)' : error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting to bookings
  const applyFilters = (bookingsData, query, status, field, direction) => {
    let filtered = [...bookingsData];
    
    // Apply search query
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.user?.name?.toLowerCase().includes(searchLower) ||
        booking.user?.email?.toLowerCase().includes(searchLower) ||
        booking.trainer?.name?.toLowerCase().includes(searchLower) ||
        booking._id?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(booking => booking.status === status);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch(field) {
        case 'sessionDate':
          valueA = new Date(a.sessionDate).getTime();
          valueB = new Date(b.sessionDate).getTime();
          break;
        case 'amount':
          valueA = a.amount;
          valueB = b.amount;
          break;
        case 'duration':
          valueA = a.duration;
          valueB = b.duration;
          break;
        case 'userName':
          valueA = a.user?.name || '';
          valueB = b.user?.name || '';
          break;
        default:
          valueA = a[field];
          valueB = b[field];
      }
      
      if (direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredBookings(filtered);
  };

  useEffect(() => {
    applyFilters(bookings, searchQuery, statusFilter, sortField, sortDirection);
  }, [searchQuery, statusFilter, sortField, sortDirection]);

  useEffect(() => {
    // Check if user is authenticated as admin
    if (!localStorage.getItem('adminToken') && !localStorage.getItem('token')) {
      toast.error('Authentication required');
      navigate('/admin/signin');
      return;
    }
    
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/admin/booking/trainer/${id}`, { status: newStatus });
      toast.success("Trainer booking status updated successfully");

      // Update local state
      const updatedBookings = bookings.map(booking => 
        booking._id === id ? { ...booking, status: newStatus } : booking
      );
      setBookings(updatedBookings);
      applyFilters(updatedBookings, searchQuery, statusFilter, sortField, sortDirection);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trainer booking?")) return;
    try {
      await api.delete(`/admin/booking/trainer/${id}`);
      toast.success("Trainer booking deleted successfully");
      
      const updatedBookings = bookings.filter(b => b._id !== id);
      setBookings(updatedBookings);
      applyFilters(updatedBookings, searchQuery, statusFilter, sortField, sortDirection);
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error("Delete failed");
    }
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const exportToCSV = () => {
    const headers = ['Booking ID', 'User', 'Email', 'Trainer', 'Duration', 'Session Date', 'Amount', 'Payment Status', 'Status'];
    
    const csvData = filteredBookings.map(booking => [
      booking._id,
      booking.user?.name || 'Unknown',
      booking.user?.email || 'N/A',
      booking.trainer?.name || 'Unknown',
      `${booking.duration}h`,
      new Date(booking.sessionDate).toLocaleString(),
      `₹${booking.amount}`,
      booking.paymentStatus,
      booking.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trainer_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const viewDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetail(true);
  };

  // Loading state UI
  if (loading && !bookings.length) {
    return (
      <div className="p-6 flex justify-center items-center h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-700 font-medium">Loading trainer bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg font-medium">
          {error}
        </div>
        <button 
          onClick={fetchBookings} 
          className="mt-4 px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Status badge component with enhanced colors
  const StatusBadge = ({ status }) => {
    const getStatusClasses = () => {
      switch(status) {
        case 'confirmed':
          return 'bg-green-100 text-green-900 border-green-300 font-semibold';
        case 'cancelled':
          return 'bg-red-100 text-red-900 border-red-300 font-semibold';
        default:
          return 'bg-yellow-100 text-yellow-900 border-yellow-300 font-semibold';
      }
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusClasses()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Payment status badge component with enhanced colors
  const PaymentBadge = ({ status, method }) => {
    const getStatusClasses = () => {
      switch(status) {
        case 'completed':
          return 'bg-green-100 text-green-900 border-green-300 font-semibold';
        case 'failed':
          return 'bg-red-100 text-red-900 border-red-300 font-semibold';
        default:
          return 'bg-yellow-100 text-yellow-900 border-yellow-300 font-semibold';
      }
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusClasses()}`}>
        {method} - {status}
      </span>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <HiOutlineUsers className="text-indigo-700" />
                Trainer Bookings Management
              </h1>
              <p className="text-gray-700 text-sm mt-1 font-medium">Manage and process trainer booking requests</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={fetchBookings}
                className="px-3 py-2 bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200 flex items-center justify-center gap-1 text-sm font-medium"
                disabled={loading}
              >
                <HiRefresh className={loading ? "animate-spin" : ""} />
                <span>{loading ? "Loading..." : "Refresh"}</span>
              </button>
              <button
                onClick={exportToCSV}
                className="px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 flex items-center justify-center gap-1 text-sm font-medium"
              >
                <HiDownload />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 flex items-center justify-center gap-1 text-sm font-medium md:hidden"
              >
                <HiAdjustments />
                <span>{showFilters ? "Hide Filters" : "Filters"}</span>
              </button>
            </div>
          </div>
          
          {/* Filters & Search - Always visible on desktop, toggleable on mobile */}
          <div className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <HiSearch className="absolute left-3 top-2.5 text-gray-500" />
            </div>
            
            <div className="flex items-center gap-2">
              <HiFilter className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <HiOutlineCalendar className="text-gray-500" />
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 font-medium"
              >
                <option value="sessionDate">Session Date</option>
                <option value="amount">Amount</option>
                <option value="duration">Duration</option>
                <option value="userName">User Name</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-md bg-white text-gray-800"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Booking count summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 md:p-6 bg-gray-100">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <HiOutlineCalendar className="text-blue-700 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Total Bookings</p>
              <p className="text-xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <HiOutlineCheck className="text-green-700 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Confirmed</p>
              <p className="text-xl font-bold text-gray-900">{bookings.filter(b => b.status === 'confirmed').length}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <HiOutlineClock className="text-yellow-700 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Pending</p>
              <p className="text-xl font-bold text-gray-900">{bookings.filter(b => b.status === 'pending').length}</p>
            </div>
          </div>
        </div>
        
        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="p-6 text-center">
            <div className="bg-gray-50 p-6 rounded-lg inline-block">
              <HiOutlineX className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-700">
                {searchQuery || statusFilter !== 'all' ? 
                  'Try adjusting your filters to see more results.' : 
                  'There are no trainer bookings in the system.'}
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <button 
                  className="mt-3 text-sm text-indigo-700 hover:text-indigo-900 font-medium"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer whitespace-nowrap" onClick={() => handleSort('userName')}>
                    User {sortField === 'userName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                    Trainer
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hidden md:table-cell" onClick={() => handleSort('duration')}>
                    Duration {sortField === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer whitespace-nowrap hidden md:table-cell" onClick={() => handleSort('sessionDate')}>
                    Date {sortField === 'sessionDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('amount')}>
                    Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                    Payment
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors" onClick={() => viewDetail(booking)}>
                    <td className="px-4 py-3 whitespace-nowrap cursor-pointer">
                      {booking.user ? (
                        <div>
                          <div className="font-semibold text-gray-900">{booking.user.name || 'N/A'}</div>
                          <div className="text-xs text-gray-600">{booking.user.email || 'N/A'}</div>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap cursor-pointer hidden sm:table-cell">
                      {booking.trainer ? (
                        <div>
                          <div className="font-semibold text-gray-900">{booking.trainer.name || 'N/A'}</div>
                          <div className="text-xs text-gray-600">{booking.trainer.specialization || 'N/A'}</div>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 cursor-pointer hidden md:table-cell">
                      {booking.duration || 0}h
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 cursor-pointer hidden md:table-cell">
                      {formatDate(booking.sessionDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 cursor-pointer">
                      ₹{booking.amount || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap cursor-pointer hidden lg:table-cell">
                      <PaymentBadge status={booking.paymentStatus} method={booking.paymentMethod} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap cursor-pointer">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="inline-flex rounded-md shadow-sm" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={booking.status || 'pending'}
                          onChange={e => handleStatusChange(booking._id, e.target.value)}
                          disabled={updatingId === booking._id}
                          className={`px-2 py-1 text-sm border rounded font-semibold ${
                            booking.status === 'confirmed' ? 'text-green-800 border-green-300 bg-green-50' : 
                            booking.status === 'pending' ? 'text-yellow-800 border-yellow-300 bg-yellow-50' : 
                            'text-red-800 border-red-300 bg-red-50'
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="ml-1 inline-flex items-center px-2 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 whitespace-nowrap"
                          disabled={updatingId === booking._id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700 font-medium">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Detail Modal */}
      {showDetail && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Booking Details</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowDetail(false)}
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Booking ID */}
              <div className="flex justify-between items-center pb-4 border-b">
                <div className="font-semibold text-gray-800">Booking ID:</div>
                <div className="text-sm bg-gray-100 px-3 py-1 rounded-md font-mono">{selectedBooking._id}</div>
              </div>
              
              {/* User Info */}
              <div className="flex items-start space-x-4 pb-4 border-b">
                <div className="bg-blue-100 p-3 rounded-full">
                  <HiOutlineUser className="text-blue-700" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900">User Information</h4>
                  <div className="text-sm space-y-1 mt-1 text-gray-700">
                    <p><span className="text-gray-600 font-medium">Name:</span> {selectedBooking.user.name || 'N/A'}</p>
                    <p><span className="text-gray-600 font-medium">Email:</span> {selectedBooking.user.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Trainer Info */}
              <div className="flex items-start space-x-4 pb-4 border-b">
                <div className="bg-purple-100 p-3 rounded-full">
                  <HiOutlineUsers className="text-purple-700" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900">Trainer Information</h4>
                  <div className="text-sm space-y-1 mt-1 text-gray-700">
                    <p><span className="text-gray-600 font-medium">Name:</span> {selectedBooking.trainer.name || 'N/A'}</p>
                    <p><span className="text-gray-600 font-medium">Specialization:</span> {selectedBooking.trainer.specialization || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Session Info */}
              <div className="flex items-start space-x-4 pb-4 border-b">
                <div className="bg-green-100 p-3 rounded-full">
                  <HiOutlineCalendar className="text-green-700" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900">Session Details</h4>
                  <div className="text-sm space-y-1 mt-1 text-gray-700">
                    <p><span className="text-gray-600 font-medium">Date:</span> {formatDate(selectedBooking.sessionDate)}</p>
                    <p><span className="text-gray-600 font-medium">Duration:</span> {selectedBooking.duration}h</p>
                    <p><span className="text-gray-600 font-medium">Status:</span> <StatusBadge status={selectedBooking.status} /></p>
                  </div>
                </div>
              </div>
              
              {/* Payment Info */}
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <HiOutlineCurrencyDollar className="text-yellow-700" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900">Payment Details</h4>
                  <div className="text-sm space-y-1 mt-1 text-gray-700">
                    <p><span className="text-gray-600 font-medium">Amount:</span> ₹{selectedBooking.amount}</p>
                    <p><span className="text-gray-600 font-medium">Method:</span> {selectedBooking.paymentMethod}</p>
                    <p><span className="text-gray-600 font-medium">Status:</span> <PaymentBadge status={selectedBooking.paymentStatus} method={selectedBooking.paymentMethod} /></p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-wrap justify-end gap-3">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                onClick={() => setShowDetail(false)}
              >
                Close
              </button>
              <select
                value={selectedBooking.status}
                onChange={(e) => {
                  handleStatusChange(selectedBooking._id, e.target.value);
                  setSelectedBooking({...selectedBooking, status: e.target.value});
                }}
                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 font-semibold ${
                  selectedBooking.status === 'confirmed' ? 'text-green-900 border-green-300 bg-green-50' : 
                  selectedBooking.status === 'pending' ? 'text-yellow-900 border-yellow-300 bg-yellow-50' : 
                  'text-red-900 border-red-300 bg-red-50'
                }`}
              >
                <option value="pending">Set as Pending</option>
                <option value="confirmed">Set as Confirmed</option>
                <option value="cancelled">Set as Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminTrainerBookings;
