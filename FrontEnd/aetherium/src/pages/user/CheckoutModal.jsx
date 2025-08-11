// import { useState,useEffect } from "react";
// import { X, CreditCard, Wallet, Building, Smartphone } from "lucide-react";
// import { useRazorpay } from "../../hooks/useRazorpay";

// const CheckoutModal = ({ isOpen, onClose, cartItems, total, onPaymentSuccess }) => {
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("razorpay");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const { processPayment, loading: razorpayLoading, error: razorpayError, clearError } = useRazorpay();

//   useEffect(() => {
//     if (isOpen) {
//       setIsProcessing(false);
//       clearError();
//     }
//   }, [isOpen, clearError]);

//   const formatPrice = (price) => `₹${price?.toFixed(2) || "0.00"}`;

//   const paymentMethods = [
//     {
//       id: "razorpay",
//       name: "Card/UPI/Netbanking",
//       icon: CreditCard,
//       description: "Secure payment via Razorpay",
//     },
//     {
//       id: "wallet",
//       name: "Wallet Payment",
//       icon: Wallet,
//       description: "Pay using your wallet balance",
//       disabled: true,
//     },
//     {
//       id: "bank",
//       name: "Bank Transfer",
//       icon: Building,
//       description: "Direct bank transfer",
//       disabled: true,
//     },
//     {
//       id: "emi",
//       name: "EMI Options",
//       icon: Smartphone,
//       description: "Pay in installments",
//       disabled: true,
//     },
//   ];

//   const handlePayment = async () => {
//     if (selectedPaymentMethod === "razorpay") {
//       try {
//         setIsProcessing(true);
//         clearError();

//         // Determine if it's single course or cart purchase
//         const isCartPurchase = cartItems.length > 1;
//         const purchaseType = isCartPurchase ? "cart" : "single";
        
//         let result;
         
//         if (isCartPurchase) {
//           // Cart purchase - pass all cart items
//           result = await processPayment(null, {
//             companyName: "Aetherium Learning",
//             themeColor: "#06b6d4",
//             amount: total,
//             purchaseType: "cart",
//             cartItems: cartItems
//           });
//         } else {
//           // Single course purchase (backward compatibility)
//           const firstCourse = cartItems[0];
//           result = await processPayment(firstCourse.course.id, {
//             companyName: "Aetherium Learning",
//             themeColor: "#06b6d4",
//             amount: total,
//             purchaseType: "single"
//           });
//         }
        
//         if (result.success) {
//           onPaymentSuccess({
//             courseIds: result.course_ids || [result.course_id],
//             courseTitles: cartItems.map(item => item.course.title),
//             paymentMethod: "CARD",
//             orderId: result.order_id,
//             amount: total,
//             purchaseIds: result.purchase_ids || [result.purchase_id]
//           });
          
//           console.log('Calling onPaymentSuccess with:', paymentData);
//           await onPaymentSuccess(paymentData);
//           // onClose();
//           console.log('Payment success handler completed');
//         }
//       } catch (error) {
//         console.error("Payment error:", error);
//         if (!error.message.includes('cancelled by user')) {
//           // Error will be displayed via razorpayError
//         }
//       } finally {
//         setIsProcessing(false);
//       }
//     }
//   };
//    const handleClose = () => {
//     if (!isProcessing && !razorpayLoading) {
//       setIsProcessing(false);
//       clearError();
//       onClose();
//     }
//   };


//   const isPaymentDisabled = isProcessing || razorpayLoading || cartItems.length === 0;

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b">
//           <h2 className="text-xl font-semibold text-gray-900">Choose Payment Method</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Order Summary */}
//         <div className="p-6 bg-gray-50 border-b">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
          
//           {/* Show purchase type indicator */}
//           <div className="mb-3 text-sm text-blue-600 font-medium">
//             {cartItems.length > 1 ? `Cart Purchase (${cartItems.length} courses)` : 'Single Course Purchase'}
//           </div>
          
//           <div className="space-y-2">
//             {cartItems.map((item) => (
//               <div key={item.course.id} className="flex justify-between text-sm">
//                 <span className="text-gray-600 truncate pr-2">{item.course.title}</span>
//                 <span className="font-medium">
//                   {formatPrice(item.course.discount_price || item.course.price)}
//                 </span>
//               </div>
//             ))}
//             <div className="border-t pt-2 mt-2">
//               <div className="flex justify-between font-semibold">
//                 <span>Total</span>
//                 <span className="text-blue-600">{formatPrice(total)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Payment Methods */}
//         <div className="p-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
          
//           {/* Display Razorpay error if any */}
//           {razorpayError && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
//               {razorpayError}
//             </div>
//           )}

//           <div className="space-y-3">
//             {paymentMethods.map((method) => (
//               <div
//                 key={method.id}
//                 className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
//                   selectedPaymentMethod === method.id
//                     ? "border-blue-500 bg-blue-50"
//                     : "border-gray-200 hover:border-gray-300"
//                 } ${method.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
//                 onClick={() => !method.disabled && setSelectedPaymentMethod(method.id)}
//               >
//                 <div className="flex items-center flex-1">
//                   <method.icon className="w-5 h-5 text-gray-600 mr-3" />
//                   <div>
//                     <div className="font-medium text-gray-900">{method.name}</div>
//                     <div className="text-sm text-gray-500">{method.description}</div>
//                   </div>
//                 </div>
                
//                 {method.disabled && (
//                   <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
//                     Coming Soon
//                   </span>
//                 )}
                
//                 <div className="ml-4">
//                   <div
//                     className={`w-4 h-4 rounded-full border-2 ${
//                       selectedPaymentMethod === method.id
//                         ? "border-blue-500 bg-blue-500"
//                         : "border-gray-300"
//                     }`}
//                   >
//                     {selectedPaymentMethod === method.id && (
//                       <div className="w-full h-full rounded-full bg-white scale-50"></div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t bg-gray-50">
//           <div className="flex space-x-3">
//             <button
//               onClick={handleClose}
//               className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handlePayment}
//               disabled={isPaymentDisabled}
//               className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {isProcessing || razorpayLoading ? "Processing..." : "Proceed to Payment"}
//             </button>
//           </div>
          
//           <div className="mt-3 text-center">
//             <p className="text-xs text-gray-500">
//               🔒 Your payment information is secure and encrypted
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutModal;

import { useState, useEffect } from "react";
import { X, CreditCard, Wallet, Building, Smartphone } from "lucide-react";
import { useRazorpay } from "../../hooks/useRazorpay";

const CheckoutModal = ({ isOpen, onClose, cartItems, total, onPaymentSuccess }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const { processPayment, loading: razorpayLoading, error: razorpayError, clearError } = useRazorpay();

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      clearError();
    }
  }, [isOpen, clearError]);

  const formatPrice = (price) => `₹${price?.toFixed(2) || "0.00"}`;

  const paymentMethods = [
    {
      id: "razorpay",
      name: "Card/UPI/Netbanking",
      icon: CreditCard,
      description: "Secure payment via Razorpay",
    },
    {
      id: "wallet",
      name: "Wallet Payment",
      icon: Wallet,
      description: "Pay using your wallet balance",
      disabled: true,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: Building,
      description: "Direct bank transfer",
      disabled: true,
    },
    {
      id: "emi",
      name: "EMI Options",
      icon: Smartphone,
      description: "Pay in installments",
      disabled: true,
    },
  ];

  const handlePayment = async () => {
    if (selectedPaymentMethod === "razorpay") {
      try {
        setIsProcessing(true);
        clearError();

        // Determine if it's single course or cart purchase
        const isCartPurchase = cartItems.length > 1;
        const purchaseType = isCartPurchase ? "cart" : "single";
        
        let result;
         
        if (isCartPurchase) {
          // Cart purchase - pass all cart items
          result = await processPayment(null, {
            companyName: "Aetherium Learning",
            themeColor: "#06b6d4",
            amount: total,
            purchaseType: "cart",
            cartItems: cartItems
          });
        } else {
          // Single course purchase (backward compatibility)
          const firstCourse = cartItems[0];
          result = await processPayment(firstCourse.course.id, {
            companyName: "Aetherium Learning",
            themeColor: "#06b6d4",
            amount: total,
            purchaseType: "single"
          });
        }
        
        if (result.success) {
          // Prepare payment data for success handler
          const paymentData = {
            courseIds: result.course_ids || [result.course_id],
            courseTitles: cartItems.map(item => item.course.title),
            paymentMethod: "CARD",
            orderId: result.order_id,
            amount: total,
            purchaseIds: result.purchase_ids || [result.purchase_id]
          };
          
          console.log('Calling onPaymentSuccess with:', paymentData);
          
          // Call the success handler
          await onPaymentSuccess(paymentData);
          
          console.log('Payment success handler completed');
          
          // Close modal after successful payment
          onClose();
        }
      } catch (error) {
        console.error("Payment error:", error);
        if (!error.message.includes('cancelled by user')) {
          // Error will be displayed via razorpayError
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleClose = () => {
    if (!isProcessing && !razorpayLoading) {
      setIsProcessing(false);
      clearError();
      onClose();
    }
  };

  const isPaymentDisabled = isProcessing || razorpayLoading || cartItems.length === 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Choose Payment Method</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing || razorpayLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
          
          {/* Show purchase type indicator */}
          <div className="mb-3 text-sm text-blue-600 font-medium">
            {cartItems.length > 1 ? `Cart Purchase (${cartItems.length} courses)` : 'Single Course Purchase'}
          </div>
          
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item.course.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate pr-2">{item.course.title}</span>
                <span className="font-medium">
                  {formatPrice(item.course.discount_price || item.course.price)}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
          
          {/* Display Razorpay error if any */}
          {razorpayError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {razorpayError}
            </div>
          )}

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPaymentMethod === method.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${method.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !method.disabled && setSelectedPaymentMethod(method.id)}
              >
                <div className="flex items-center flex-1">
                  <method.icon className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </div>
                
                {method.disabled && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
                
                <div className="ml-4">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedPaymentMethod === method.id
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedPaymentMethod === method.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isProcessing || razorpayLoading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isPaymentDisabled}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing || razorpayLoading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;