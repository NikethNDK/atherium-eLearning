import { Star } from 'lucide-react';
import { getImageUrl } from '../common/ImageURL';

const ReviewList = ({ reviews, averageRating, totalReviews }) => {
  console.log('ReviewList rendered with props:', { reviews, averageRating, totalReviews });
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review this course!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Review Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{averageRating}</div>
              <div className="flex items-center justify-center mt-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {totalReviews > 0 && (
                <>
                  <div className="mb-2">
                    <span className="font-medium">5 stars:</span> {Math.round((reviews.filter(r => r.rating === 5).length / totalReviews) * 100)}%
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">4 stars:</span> {Math.round((reviews.filter(r => r.rating === 4).length / totalReviews) * 100)}%
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">3 stars:</span> {Math.round((reviews.filter(r => r.rating === 3).length / totalReviews) * 100)}%
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">2 stars:</span> {Math.round((reviews.filter(r => r.rating === 2).length / totalReviews) * 100)}%
                  </div>
                  <div>
                    <span className="font-medium">1 star:</span> {Math.round((reviews.filter(r => r.rating === 1).length / totalReviews) * 100)}%
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex items-start space-x-3">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {review.user?.profile_picture ? (
                  <img
                    src={getImageUrl(review.user.profile_picture)}
                    alt={`${review.user.firstname} ${review.user.lastname}`}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {review.user?.firstname?.[0] || 'U'}
                  </div>
                )}
              </div>

              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {review.user?.firstname} {review.user?.lastname}
                  </span>
                  {review.is_verified_purchase && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Verified Purchase
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500 ml-2">
                    {formatDate(review.created_at)}
                  </span>
                </div>

                {review.review_text && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {review.review_text}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
