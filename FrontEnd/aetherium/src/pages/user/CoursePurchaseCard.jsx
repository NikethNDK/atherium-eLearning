import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { userAPI } from "../../services/userApi";

const CoursePurchaseCard = ({ course, isPurchased, purchasing, setPurchasing, setIsPurchased }) => {
  const navigate = useNavigate();
  const formatPrice = (price) => `₹${price?.toFixed(2) || "0.00"}`;

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      await userAPI.purchaseCourse(course.id, "wallet");
      setIsPurchased(true);
      navigate("/payment-success", {
        state: { courseId: course.id, courseTitle: course.title },
      });
    } catch (error) {
      console.error("Error purchasing course:", error);
      alert("Failed to purchase course. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await userAPI.addToCart(course.id);
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    }
  }; 
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) return imagePath
    // Otherwise, construct the URL with your backend base URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    return `${baseUrl}/${imagePath}`
  }

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
        <div className="relative">
          <img
            src={getImageUrl(course.cover_image) || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-32 sm:h-48 object-cover"
          />
          {/* <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-6 sm:border-l-8 border-l-white border-t-3 sm:border-t-4 border-t-transparent border-b-3 sm:border-b-4 border-b-transparent ml-1"></div>
            </div>
          </div> */}
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              {course.discount_price && course.discount_price < course.price ? (
                <>
                  <span className="text-xs sm:text-sm text-gray-500 line-through">
                    {formatPrice(course.price)}
                  </span>
                  <div className="text-lg sm:text-2xl font-bold text-red-600">
                    {formatPrice(course.discount_price)}
                  </div>
                </>
              ) : (
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {formatPrice(course.price)}
                </div>
              )}
            </div>
            <button className="p-2 text-gray-400 hover:text-red-500">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          {isPurchased ? (
            <button
              onClick={() => navigate(`/my-learning/${course.id}`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base mb-3"
            >
              Continue Learning
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base disabled:opacity-50"
              >
                {purchasing ? "Processing..." : "Start Now"}
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full bg-white border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base flex items-center justify-center"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Add to Cart
              </button>
            </div>
          )}
          <div className="mt-3 sm:mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm underline">
              Other payment options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePurchaseCard;