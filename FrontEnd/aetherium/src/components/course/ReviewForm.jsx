import { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';

const ReviewForm = ({ courseId, onCreate,onUpdate, onCancel, existingReview }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when existingReview changes
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setReviewText(existingReview.review_text || '');
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        // Updating
        await onUpdate({ rating, review_text: reviewText });
      } else {
        // Creating
        await onCreate({ rating, review_text: reviewText });
        setRating(0);
        setReviewText('');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  return (
    <div className="bg-white rounded-lg border p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
                className="focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
            Review (Optional)
          </label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your thoughts about this course..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
