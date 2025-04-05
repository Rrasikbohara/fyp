import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import { 
  HiStar, HiTrash, HiUser, HiRefresh, HiSearch, HiCheck, HiX
} from 'react-icons/hi';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/feedback');
      console.log('Fetched feedback:', response.data);
      
      setFeedback(response.data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to load feedback data');
      toast.error('Error fetching feedback data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFeedback();
  }, []);
  
  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/feedback/${id}/status`, { status });
      
      // Update local state
      setFeedback(feedback.map(item => 
        item._id === id ? { ...item, status } : item
      ));
      
      toast.success(`Feedback status updated to ${status}`);
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast.error('Failed to update feedback status');
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }
    
    try {
      await api.delete(`/feedback/${id}`);
      
      // Update local state
      setFeedback(feedback.filter(item => item._id !== id));
      
      toast.success('Feedback deleted successfully');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };
  
  // Filter feedback based on search query and filters
  const filteredFeedback = feedback.filter(item => {
    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }
    
    // Rating filter
    if (ratingFilter !== 'all' && item.rating !== parseInt(ratingFilter)) {
      return false;
    }
    
    // Search filter
    if (searchQuery && !(
      item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.trainer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.review?.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    return true;
  });
  
  // Star rating display
  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <HiStar 
            key={star} 
            className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
          />
        ))}
        <span className="ml-1 text-gray-600">({rating})</span>
      </div>
    );
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <HiCheck className="mr-1" /> Published
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <HiClock className="mr-1" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <HiX className="mr-1" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };
  
  if (loading && !feedback.length) {
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
          <h1 className="text-2xl font-bold mb-1">Trainer Feedback</h1>
          <p className="text-gray-600">Manage and moderate user feedback for trainers</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchFeedback}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            <HiRefresh className={loading ? "animate-spin" : ""} />
            Refresh
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
                placeholder="Search feedback by user, trainer or review content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <HiSearch className="absolute left-3 top-3 text-gray-400" />
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
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-500 mr-2 text-sm">Rating:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
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
      
      {/* Feedback list */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filteredFeedback.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No feedback found</p>
            <p className="text-gray-400 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredFeedback.map(item => (
              <li key={item._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <HiUser className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.user?.name || 'Anonymous User'} 
                          <span className="text-gray-500 text-sm ml-2">reviewed</span> 
                          <span className="font-medium ml-1">{item.trainer?.name || 'Trainer'}</span>
                        </p>
                        <StarRating rating={item.rating} />
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {item.review && (
                      <div className="mt-3 text-gray-700 ml-13">
                        "{item.review}"
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    
                    <div className="flex gap-1">
                      {/* Status actions */}
                      <div className="dropdown relative">
                        <button className="text-gray-500 hover:text-gray-700 p-1">
                          ⋮
                        </button>
                        <div className="dropdown-menu absolute right-0 hidden bg-white shadow-lg rounded-md p-1 border border-gray-200 z-10">
                          <button 
                            onClick={() => handleStatusChange(item._id, 'published')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            Publish
                          </button>
                          <button 
                            onClick={() => handleStatusChange(item._id, 'pending')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            Mark Pending
                          </button>
                          <button 
                            onClick={() => handleStatusChange(item._id, 'rejected')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            Reject
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional booking info */}
                {item.booking && (
                  <div className="mt-2 ml-13 text-sm text-gray-500">
                    From session on {new Date(item.booking.sessionDate).toLocaleDateString()}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminFeedback;
