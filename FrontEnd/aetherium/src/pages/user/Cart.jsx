
// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Trash2, Heart, ShoppingCart } from "lucide-react";
// import Header from "../../components/common/Header";
// import Footer from "../../components/common/Footer";
// import LoadingSpinner from "../../components/common/LoadingSpinner";
// import CheckoutModal from "./CheckoutModal";
// import { userAPI } from "../../services/userApi";
// import { useAuth } from "../../context/AuthContext";

// const Cart = () => {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuth();
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
//   const [isRemoving, setIsRemoving] = useState({});

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate("/login");
//       return;
//     }
//     fetchCartItems();
//   }, [isAuthenticated]);

//   useEffect(() => {
//     if (!isCheckoutModalOpen) {
//       fetchCartItems();
//     }
//   }, [isCheckoutModalOpen]);

//   // Effect 3: Cleanup effect when component unmounts
//   useEffect(() => {
//     return () => {
//       setIsCheckoutModalOpen(false);
//     };
//   }, []);

//   // Effect 4: Debugging effect to log state changes
//   // useEffect(() => {
//   //   console.log('Cart items updated:', cartItems);
//   // }, [cartItems]);

//   useEffect(() => {
//   const updateGlobalCart = async () => {
//     if (isAuthenticated) {
//       try {
//         const data = await userAPI.getCart();
//         // Update any global state or context you're using for the header
//         // Example if you're using a context:
//         // updateCartCount(data.items?.length || 0);
//       } catch (error) {
//         console.error("Error syncing cart:", error);
//       }
//     }
//   };

//   updateGlobalCart();
// }, [cartItems, isAuthenticated]);

//   const fetchCartItems = async () => {
//     try {
//       setLoading(true);
//       const data = await userAPI.getCart();
//       setCartItems(data.items || []);
//     } catch (error) {
//       console.error("Error fetching cart:", error);
//       setError("Failed to load cart items.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveFromCart = async (courseId) => {
//     try {
//       setIsRemoving(prev => ({ ...prev, [courseId]: true }));
//       await userAPI.removeFromCart(courseId);
//       setCartItems(cartItems.filter((item) => item.course.id !== courseId));
//     } catch (error) {
//       console.error("Error removing from cart:", error);
//       setError("Failed to remove item from cart.");
//     } finally {
//       setIsRemoving(prev => ({ ...prev, [courseId]: false }));
//     }
//   };

//   const getImageUrl = (imagePath) => {
//     if (!imagePath) return null;
//     if (imagePath.startsWith("http")) return imagePath;
//     const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
//     return `${baseUrl}/${imagePath}`;
//   };

//   const handleMoveToWishlist = async (courseId) => {
//     // TODO: Implement wishlist functionality
//     console.log("Move to wishlist:", courseId);
//     // For now, just remove from cart
//     handleRemoveFromCart(courseId);
//   };

//   const calculateSubtotal = () => {
//     return cartItems.reduce((total, item) => {
//       const price = item.course.discount_price || item.course.price || 0;
//       return total + price;
//     }, 0);
//   };

//   const calculateTax = (subtotal) => {
//     return subtotal * 0.18; // 18% GST
//   };

//   const handlePaymentSuccess = (paymentData) => {
//      try {
//       console.log('Payment successful:', paymentData);
//     // Clear cart after successful payment
//     setCartItems([]);

//     setIsCheckoutModalOpen(false);
//     // Navigate to my learning page
//     setTimeout(()=>{navigate("/my-learning", {
//       state: {
//         message: "Payment successful! Your course has been added to your learning.",
//         ...paymentData
//       },replace: true
//     });},100) 
//     } catch (error) {
//       console.error('Error handling payment success:', error);
//       setError('Payment successful but navigation failed. Please check My Learning page.');
//       setIsCheckoutModalOpen(false);
//     }
//   };

//   const formatPrice = (price) => {
//     return `₹${price?.toFixed(2) || "0.00"}`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <LoadingSpinner />
//         <Footer />
//       </div>
//     );
//   }

//   const subtotal = calculateSubtotal();
//   const tax = calculateTax(subtotal);
//   const total = subtotal + tax;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <div className="container mx-auto px-4 py-8">
//         <div className="flex items-center mb-8">
//           <ShoppingCart className="w-8 h-8 text-blue-600 mr-3" />
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
//           {cartItems.length > 0 && (
//             <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
//               {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
//             </span>
//           )}
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
//             {error}
//           </div>
//         )}

//         {cartItems.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="max-w-md mx-auto">
//               <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <div className="text-gray-500 text-lg mb-2">Your cart is empty</div>
//               <p className="text-gray-400 mb-8">
//                 Discover amazing courses and start your learning journey!
//               </p>
//               <Link
//                 to="/courses"
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
//               >
//                 <ShoppingCart className="w-5 h-5 mr-2" />
//                 Browse Courses
//               </Link>
//             </div>
//           </div>
//         ) : (
//           <div className="grid lg:grid-cols-3 gap-8">
//             {/* Cart Items */}
//             <div className="lg:col-span-2 space-y-4">
//               {cartItems.map((item) => (
//                 <div key={item.course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
//                   <div className="flex flex-col sm:flex-row">
//                     <div className="w-full sm:w-48 h-32 sm:h-32 flex-shrink-0">
//                       <img
//                         src={getImageUrl(item.course.cover_image) || "/placeholder.svg"}
//                         alt={item.course.title}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <div className="flex-1 p-4 sm:p-6">
//                       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
//                         <div className="flex-1 mb-4 sm:mb-0">
//                           <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
//                             {item.course.title}
//                           </h3>
//                           <p className="text-gray-600 text-sm mb-3">
//                             by {item.course.instructor?.firstname} {item.course.instructor?.lastname}
//                           </p>
//                           <div className="flex flex-wrap items-center gap-4 text-sm">
//                             <button
//                               onClick={() => handleMoveToWishlist(item.course.id)}
//                               className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
//                             >
//                               <Heart className="w-4 h-4 mr-1" />
//                               Move to Wishlist
//                             </button>
//                             <button
//                               onClick={() => handleRemoveFromCart(item.course.id)}
//                               disabled={isRemoving[item.course.id]}
//                               className="flex items-center text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
//                             >
//                               <Trash2 className="w-4 h-4 mr-1" />
//                               {isRemoving[item.course.id] ? "Removing..." : "Remove"}
//                             </button>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           {item.course.discount_price && item.course.discount_price < item.course.price ? (
//                             <>
//                               <div className="text-lg font-bold text-red-600">
//                                 {formatPrice(item.course.discount_price)}
//                               </div>
//                               <div className="text-sm text-gray-500 line-through">
//                                 {formatPrice(item.course.price)}
//                               </div>
//                             </>
//                           ) : (
//                             <div className="text-lg font-bold text-blue-600">
//                               {formatPrice(item.course.price)}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Order Summary */}
//             <div className="lg:col-span-1">
//               <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
//                 <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

//                 <div className="space-y-4 mb-6">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Subtotal</span>
//                     <span className="font-medium">{formatPrice(subtotal)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Tax (18%)</span>
//                     <span className="font-medium">{formatPrice(tax)}</span>
//                   </div>
//                   <div className="border-t pt-4">
//                     <div className="flex justify-between">
//                       <span className="text-lg font-semibold">Total</span>
//                       <span className="text-lg font-bold text-blue-600">{formatPrice(total)}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => setIsCheckoutModalOpen(true)}
//                   disabled={cartItems.length === 0}
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   Proceed to Checkout
//                 </button>

//                 <div className="mt-4 text-center">
//                   <p className="text-sm text-gray-500">
//                     🔒 Secure checkout with multiple payment options
//                   </p>
//                 </div>

//                 {/* Additional Cart Info */}
//                 <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//                   <h4 className="font-medium text-blue-900 mb-2">Why choose us?</h4>
//                   <ul className="text-sm text-blue-700 space-y-1">
//                     <li>• Lifetime access to courses</li>
//                     <li>• Expert instructor support</li>
//                     <li>• Mobile & desktop access</li>
//                     <li>• Certificate of completion</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Checkout Modal */}
//       <CheckoutModal
//         isOpen={isCheckoutModalOpen}
//         onClose={() => setIsCheckoutModalOpen(false)}
//         cartItems={cartItems}
//         total={total}
//         onPaymentSuccess={handlePaymentSuccess}
//       />

//       <Footer />
//     </div>
//   );
// };

// export default Cart;

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Heart, ShoppingCart } from "lucide-react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import BookLoader from "../../components/common/BookLoader";
import CheckoutModal from "./CheckoutModal";
import { userAPI } from "../../services/userApi";
import { useAuth } from "../../context/AuthContext";

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCartItems();
  }, [isAuthenticated]);

  // Effect to refresh cart when modal closes (but not when it opens)
  useEffect(() => {
    if (!isCheckoutModalOpen && isAuthenticated) {
      // Only fetch if modal was previously open (to avoid fetching on initial render)
      const wasModalOpen = sessionStorage.getItem('checkoutModalWasOpen');
      if (wasModalOpen === 'true') {
        fetchCartItems();
        sessionStorage.removeItem('checkoutModalWasOpen');
      }
    } else if (isCheckoutModalOpen) {
      // Mark that modal was opened
      sessionStorage.setItem('checkoutModalWasOpen', 'true');
    }
  }, [isCheckoutModalOpen, isAuthenticated]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      setIsCheckoutModalOpen(false);
      sessionStorage.removeItem('checkoutModalWasOpen');
    };
  }, []);

  // Effect to update global cart state when cart items change
  useEffect(() => {
    const updateGlobalCart = async () => {
      if (isAuthenticated) {
        try {
          // Trigger any global cart update here if you have a cart context
          // For example: updateCartCount(cartItems.length);
          
          // If you're using a global state management solution, update it here
          console.log('Cart updated, item count:', cartItems.length);
        } catch (error) {
          console.error("Error syncing cart:", error);
        }
      }
    };

    updateGlobalCart();
  }, [cartItems, isAuthenticated]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getCart();
      setCartItems(data.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (courseId) => {
    try {
      setIsRemoving(prev => ({ ...prev, [courseId]: true }));
      await userAPI.removeFromCart(courseId);
      setCartItems(cartItems.filter((item) => item.course.id !== courseId));
    } catch (error) {
      console.error("Error removing from cart:", error);
      setError("Failed to remove item from cart.");
    } finally {
      setIsRemoving(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    return `${baseUrl}/${imagePath}`;
  };

  const handleMoveToWishlist = async (courseId) => {
    // TODO: Implement wishlist functionality
    console.log("Move to wishlist:", courseId);
    // For now, just remove from cart
    handleRemoveFromCart(courseId);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.course.discount_price || item.course.price || 0;
      return total + price;
    }, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.18; // 18% GST
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      console.log('Payment successful:', paymentData);
      
      // Clear cart items immediately for UI responsiveness
      setCartItems([]);
      
      // Close the checkout modal
      setIsCheckoutModalOpen(false);
      
      // Small delay to ensure modal closes before navigation
      setTimeout(() => {
        navigate("/my-learning", {
          state: {
            message: "Payment successful! Your course has been added to your learning.",
            ...paymentData
          },
          replace: true
        });
      }, 100);
      
    } catch (error) {
      console.error('Error handling payment success:', error);
      setError('Payment successful but navigation failed. Please check My Learning page.');
      setIsCheckoutModalOpen(false);
    }
  };

  const formatPrice = (price) => {
    return `₹${price?.toFixed(2) || "0.00"}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <BookLoader message="Loading your cart..." />
        <Footer />
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <ShoppingCart className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 text-lg mb-2">Your cart is empty</div>
              <p className="text-gray-400 mb-8">
                Discover amazing courses and start your learning journey!
              </p>
              <Link
                to="/courses"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-48 h-32 sm:h-32 flex-shrink-0">
                      <img
                        src={getImageUrl(item.course.cover_image) || "/placeholder.svg"}
                        alt={item.course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div className="flex-1 mb-4 sm:mb-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {item.course.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            by {item.course.instructor?.firstname} {item.course.instructor?.lastname}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <button
                              onClick={() => handleMoveToWishlist(item.course.id)}
                              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              Move to Wishlist
                            </button>
                            <button
                              onClick={() => handleRemoveFromCart(item.course.id)}
                              disabled={isRemoving[item.course.id]}
                              className="flex items-center text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {isRemoving[item.course.id] ? "Removing..." : "Remove"}
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          {item.course.discount_price && item.course.discount_price < item.course.price ? (
                            <>
                              <div className="text-lg font-bold text-red-600">
                                {formatPrice(item.course.discount_price)}
                              </div>
                              <div className="text-sm text-gray-500 line-through">
                                {formatPrice(item.course.price)}
                              </div>
                            </>
                          ) : (
                            <div className="text-lg font-bold text-blue-600">
                              {formatPrice(item.course.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold text-blue-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutModalOpen(true)}
                  disabled={cartItems.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    🔒 Secure checkout with multiple payment options
                  </p>
                </div>

                {/* Additional Cart Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Why choose us?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Lifetime access to courses</li>
                    <li>• Expert instructor support</li>
                    <li>• Mobile & desktop access</li>
                    <li>• Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        total={total}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Footer />
    </div>
  );
};

export default Cart;