import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { Rating } from '@material-tailwind/react';
import { HiStar } from 'react-icons/hi';

const Feedback = ({ booking, trainerId, onComplete }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // If trainerId is not provided directly, try to get it from the booking
  useEffect(() => {
    if (!trainerId && booking && booking.trainer && booking.trainer._id) {
      trainerId = booking.trainer._id;
    }
  }, [booking, trainerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }
    
    if (!trainerId) {
      setError('Trainer information is missing');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Ensure we're sending the correct trainer ID format
      const feedbackData = {
        trainer: trainerId, // Make sure this is the ID string, not an object
        rating,
        review,
        booking: booking?._id || null
      };
      
      console.log('Submitting feedback with data:', feedbackData);
      
      const response = await api.post('/feedback', feedbackData);
      
      if (response.data.success) {
        toast.success('Thank you for your feedback!');
        setRating(0);
        setReview('');
        
        if (onComplete) {
          onComplete(response.data.feedback);
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.response?.data?.message || 'Failed to submit feedback');
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Rate Your Experience</h3>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Your Rating</label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="focus:outline-none mr-1"
              >
                <HiStar 
                  className={`w-8 h-8 ${
                    value <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="text-sm text-gray-600 ml-2">
              {rating > 0 ? `${rating} out of 5` : 'Select rating'}
            </span>
          </div>
        </div>
        
        <div>
          <label htmlFor="review" className="block text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Share your experience with this trainer..."
          ></textarea>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
      
      <p className="text-sm text-gray-500 mt-4">
        Your feedback helps trainers improve and helps other users make informed decisions.
      </p>
    </div>
  );
};

export default Feedback;
