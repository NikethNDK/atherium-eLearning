import { Star } from "lucide-react";
import { getImageUrl } from "../common/ImageURL";

const ReviewList = ({ reviews, stats }) => {
  const { average_rating, total } = stats;
  console.log("ReviewList rendered with props:", {
    reviews,
    average_rating,
    total,
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
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
        <div className="flex items-start gap-8">
          {/* Left: Average Rating */}
          <div className="text-center w-32 flex-shrink-0">
            <div className="text-3xl font-bold text-gray-900">
              {average_rating}
            </div>
            <div className="flex items-center justify-center mt-1">
              {renderStars(Math.round(average_rating))}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {total} review{total !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Right: Progress Bars */}
          <div className="flex-1">
            {total > 0 && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const percentage = Math.round((count / total) * 100);

                  return (
                    <div key={star} className="flex items-center space-x-2">
                      <span className="w-12 font-medium">{star}★</span>
                      <div className="flex-1 bg-gray-200 h-4 rounded-lg overflow-hidden">
                        <div
                          className="h-4 bg-yellow-500"
                          style={{
                            width: `${percentage}%`,
                            minWidth: percentage > 0 ? "4px" : "0",
                          }}
                        ></div>
                      </div>
                      <span className="w-12 text-right text-sm">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-200 pb-4 last:border-b-0"
          >
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
                    {review.user?.firstname?.[0] || "U"}
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
