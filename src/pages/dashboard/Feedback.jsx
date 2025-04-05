import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HiStar, HiOutlineStar, HiUser } from 'react-icons/hi';

const Feedback = () => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previousBookings, setPreviousBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch trainers and user's previous bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all trainers
        const trainersResponse = await api.get('/trainers');
        setTrainers(trainersResponse.data);
        
        // Fetch user's trainer bookings
        const bookingsResponse = await api.get('/trainers/bookings');
        
        // Filter completed bookings without reviews
        const completedBookings = bookingsResponse.data.filter(
          booking => booking.status === 'completed' && !booking.reviewed
        );
        
        setPreviousBookings(completedBookings);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load trainers or booking history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTrainerSelect = (trainer) => {
    setSelectedTrainer(trainer);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTrainer) {
      toast.error('Please select a trainer');
      return;
    }
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Find if user has a booking with this trainer
      const booking = previousBookings.find(b => b.trainer._id === selectedTrainer._id);
      
      const feedbackData = {
        trainerId: selectedTrainer._id,
        rating,
        review: review.trim(),
        bookingId: booking ? booking._id : undefined
      };
      
      await api.post('/feedback', feedbackData);
      
      toast.success('Feedback submitted successfully!');
      
      // Reset form
      setSelectedTrainer(null);
      setRating(0);
      setReview('');
      
      // If this was a booking-related feedback, remove it from the previous bookings list
      if (booking) {
        setPreviousBookings(prev => prev.filter(b => b._id !== booking._id));
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard/profile');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer />
      
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Trainer Feedback</h1>
        <p className="opacity-80">Share your experience with our trainers</p>
      </div>
      
      <div className="bg-white shadow-lg rounded-b-lg p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {previousBookings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Rate Your Recent Sessions</h2>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                  <p className="text-blue-800">
                    You have {previousBookings.length} completed session(s) that you can review. 
                    Your feedback helps us improve our services!
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {previousBookings.map(booking => (
                    <div 
                      key={booking._id}
                      className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      onClick={() => handleTrainerSelect(booking.trainer)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <HiUser className="text-blue-600 h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.trainer.name}</p>
                          <p className="text-sm text-gray-600">
                            Session on {new Date(booking.sessionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Select Trainer
                </label>
                {trainers.length === 0 ? (
                  <p className="text-red-500">No trainers available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trainers.map(trainer => (
                      <div
                        key={trainer._id}
                        onClick={() => handleTrainerSelect(trainer)}
                        className={`border p-4 rounded-lg cursor-pointer transition-all ${
                          selectedTrainer?._id === trainer._id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <p className="font-medium">{trainer.name}</p>
                        <p className="text-sm text-gray-600">{trainer.specialization}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedTrainer && (
                <>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Your Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transform transition-transform hover:scale-110"
                        >
                          {star <= (hoverRating || rating) ? (
                            <HiStar className="h-8 w-8 text-yellow-500" />
                          ) : (
                            <HiOutlineStar className="h-8 w-8 text-gray-400" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {rating ? (
                        <>
                          <span className="font-medium text-yellow-700">{rating}/5</span> - {
                            rating === 1 ? 'Poor' : 
                            rating === 2 ? 'Fair' : 
                            rating === 3 ? 'Good' : 
                            rating === 4 ? 'Very Good' : 
                            'Excellent'
                          }
                        </>
                      ) : 'Select your rating'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Your Review (Optional)
                    </label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows="4"
                      placeholder="Share your experience with this trainer..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={!selectedTrainer || rating === 0 || submitting}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
