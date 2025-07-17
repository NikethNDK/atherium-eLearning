// import { useNavigate } from "react-router-dom";
// import { Heart, ShoppingCart } from "lucide-react";
// import { userAPI } from "../../services/userApi";
// import { useRazorpay } from "../../hooks/useRazorpay"; 

// const CoursePurchaseCard = ({ course, isPurchased, purchasing, setPurchasing, setIsPurchased }) => {
//   const navigate = useNavigate();
//   const { processPayment, loading: razorpayLoading, error: razorpayError, clearError } = useRazorpay();

//   const formatPrice = (price) => `₹${price?.toFixed(2) || "0.00"}`;

//   const handlePurchase = async () => {
//     try {
//       setPurchasing(true);
//       await userAPI.purchaseCourse(course.id, "wallet");
//       setIsPurchased(true);
//       navigate("/payment-success", {
//         state: { courseId: course.id, courseTitle: course.title },
//       });
//     } catch (error) {
//       console.error("Error purchasing course:", error);
//       alert("Failed to purchase course. Please try again.");
//     } finally {
//       setPurchasing(false);
//     }
//   };

//   const handleRazorpayPayment = async () => {
//     try {
 
//       clearError();
      
//       const result = await processPayment(course.id, {
//         companyName: "Aetherium Learning",
//         themeColor: "#06b6d4"
//       });

//       if (result.success) {
//         setIsPurchased(true);
//         navigate("/payment-success", {
//           state: { 
//             courseId: course.id, 
//             courseTitle: course.title,
//             paymentMethod: "CARD",
//             orderId: result.order_id
//           },
//         });
//       }
//     } catch (error) {
//       console.error("Razorpay payment error:", error);
      
    
//       if (!error.message.includes('cancelled by user')) {
//         alert(`Payment failed: ${error.message}`);
//       }
//     }
//   };

//   const handleAddToCart = async () => {
//     try {
//       await userAPI.addToCart(course.id);
//       navigate("/cart");
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       alert("Failed to add to cart. Please try again.");
//     }
//   }; 

//   const getImageUrl = (imagePath) => {
//     if (!imagePath) return null
//     if (imagePath.startsWith("http")) return imagePath
//     const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
//     return `${baseUrl}/${imagePath}`
//   }


//   const isPaymentInProgress = purchasing || razorpayLoading;

//   return (
//     <div className="lg:col-span-1">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
//         <div className="relative">
          
//           <img
//             src={getImageUrl(course.cover_image) || "/placeholder.svg"}
//             alt={course.title}
//             className="w-full h-32 sm:h-48 object-cover"
//           />
//         </div>
//         <div className="p-4 sm:p-6">
//           <div className="flex items-center justify-between mb-3 sm:mb-4">
//             <div>
//               {course.discount_price && course.discount_price < course.price ? (
//                 <>
//                   <span className="text-xs sm:text-sm text-gray-500 line-through">
//                     {formatPrice(course.price)}
//                   </span>
//                   <div className="text-lg sm:text-2xl font-bold text-red-600">
//                     {formatPrice(course.discount_price)}
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-lg sm:text-2xl font-bold text-blue-600">
//                   {formatPrice(course.price)}
//                 </div>
//               )}
//             </div>
//             <button className="p-2 text-gray-400 hover:text-red-500">
//               <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
//             </button>
//           </div>

//           {/* Display Razorpay error if any */}
//           {razorpayError && (
//             <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
//               {razorpayError}
//             </div>
//           )}

//           {isPurchased ? (
//             <button
//               onClick={() => navigate(`/my-learning/${course.id}`)}
//               className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base mb-3"
//             >
//               Continue Learning
//             </button>
//           ) : (
//             <div className="space-y-3">
//               <button
//                 onClick={handlePurchase}
//                 disabled={isPaymentInProgress}
//                 className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base disabled:opacity-50"
//               >
//                 {purchasing ? "Processing..." : "Start Now"}
//               </button>
//               <button
//                 onClick={handleAddToCart}
//                 disabled={isPaymentInProgress}
//                 className="w-full bg-white border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base flex items-center justify-center disabled:opacity-50"
//               >
//                 <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
//                 Add to Cart
//               </button>
//             </div>
//           )}
//           <div className="mt-3 sm:mt-4 text-center">
//             <button 
//               onClick={handleRazorpayPayment}
//               disabled={isPaymentInProgress || isPurchased}
//               className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {razorpayLoading ? "Loading payment..." : "Other payment options"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CoursePurchaseCard;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { userAPI } from "../../services/userApi";

const CoursePurchaseCard = ({ course, isPurchased }) => {
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const formatPrice = (price) => `₹${price?.toFixed(2) || "0.00"}`;

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      await userAPI.addToCart(course.id);
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      
      // Check if item is already in cart
      if (error.response?.status === 409 || error.message.includes("already")) {
        showNotificationMessage("Item already in cart");
      } else {
        showNotificationMessage("Failed to add to cart. Please try again.");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    return `${baseUrl}/${imagePath}`;
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
        {/* Notification */}
        {showNotification && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 text-center text-sm font-medium animate-fade-in">
            <div className="flex items-center justify-center">
              <Check className="w-4 h-4 mr-2" />
              {notificationMessage}
            </div>
          </div>
        )}

        <div className="relative">
          <img
            src={getImageUrl(course.cover_image) || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-32 sm:h-48 object-cover"
          />
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
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {isPurchased ? (
            <button
              onClick={() => navigate(`/my-learning/${course.id}`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base mb-3 transition-colors"
            >
              Continue Learning
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-[#2f3066fc] hover:bg-[#1a1b3a] text-white py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base disabled:opacity-50 flex items-center justify-center transition-colors"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </button>
              
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500">
                  Click "Add to Cart" to proceed with purchase
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CoursePurchaseCard;