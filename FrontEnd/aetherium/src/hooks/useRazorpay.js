

// import { useState } from 'react';
// import { userAPI } from '../services/userApi';

// const loadRazorpayScript = () => {
//   return new Promise((resolve) => {
//     if (window.Razorpay) {
//       resolve(true);
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.head.appendChild(script);
//   });
// };

// export const useRazorpay = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const clearError = () => setError(null);

//   const processPayment = async (courseId, options = {}) => {
//     try {
//       setLoading(true);
//       setError(null);

//        console.log('Loading Razorpay script...');
//     const scriptLoaded = await loadRazorpayScript();
//     if (!scriptLoaded || !window.Razorpay) {
//       throw new Error('Failed to load Razorpay. Please refresh and try again.');
//     }
//     console.log('Razorpay script loaded successfully')

//       const { 
//         companyName = "Aetherium Learning", 
//         themeColor = "#06b6d4", 
//         amount,
//         purchaseType = "single",
//         cartItems = []
//       } = options;

//       // Create order based on purchase type
//       let orderData;
//       if (purchaseType === "cart") {
//         orderData = await userAPI.createRazorpayOrder(null, "cart");
//       } else {
//         orderData = await userAPI.createRazorpayOrder(courseId, "single");
//       }

//       // Initialize Razorpay
//       const rzp = new window.Razorpay({
//         key: orderData.key_id,
//         amount: orderData.amount,
//         currency: orderData.currency || 'INR',
//         name: companyName,
//         description: purchaseType === "cart" 
//           ? `Purchase ${orderData.courses.length} courses` 
//           : orderData.courses[0]?.course_title || 'Course Purchase',
//         order_id: orderData.order_id,
//         prefill: {
//           name: orderData.user_name,
//           email: orderData.user_email,
//         },
//         theme: {
//           color: themeColor,
//         },
//         handler: async (response) => {
//           try {
//             // Prepare verification data based on purchase type
//             const verificationData = {
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//               purchase_type: purchaseType
//             };

//             // Add course information based on purchase type
//             if (purchaseType === "cart") {
//               verificationData.course_ids = orderData.courses.map(c => c.course_id);
//             } else {
//               verificationData.course_id = orderData.courses[0]?.course_id;
//             }

//             const verificationResult = await userAPI.verifyRazorpayPayment(verificationData);
            
//             // Return success result with updated structure
//             return {
//               success: true,
//               order_id: response.razorpay_order_id,
//               payment_id: response.razorpay_payment_id,
//               course_ids: verificationResult.course_ids,
//               purchase_ids: verificationResult.purchase_ids,
//               // Backward compatibility
//               course_id: verificationResult.course_id,
//               purchase_id: verificationResult.purchase_id
//             };
//           } catch (verificationError) {
//             console.error('Payment verification failed:', verificationError);
//             setError(verificationError.response?.data?.detail || 'Payment verification failed');
//             throw verificationError;
//           }
//         },
//         modal: {
//           ondismiss: () => {
//             setError('Payment cancelled by user');
//             throw new Error('Payment cancelled by user');
//           }
//         }
//       });

//       // Open Razorpay checkout
//       rzp.open();

//       // Return a promise that will be resolved by the handler
//       return new Promise((resolve, reject) => {
//         const originalHandler = rzp.options.handler;
        
//         rzp.options.handler = async (response) => {
//           try {
//             const result = await originalHandler(response);
//             resolve(result);
//           } catch (error) {
//             reject(error);
//           }
//         };

//         const originalOnDismiss = rzp.options.modal.ondismiss;
//         rzp.options.modal.ondismiss = () => {
//           try {
//             originalOnDismiss();
//           } catch (error) {
//             reject(error);
//           }
//         };
//       });

//     } catch (error) {
//       console.error('Payment process failed:', error);
//       const errorMessage = error.response?.data?.detail || error.message || 'Payment failed';
//       setError(errorMessage);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return {
//     processPayment,
//     loading,
//     error,
//     clearError
//   };
// };

import { useState } from 'react';
import { userAPI } from '../services/userApi';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const processPayment = async (courseId, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Failed to load Razorpay. Please refresh and try again.');
      }
      console.log('Razorpay script loaded successfully');

      const { 
        companyName = "Aetherium Learning", 
        themeColor = "#06b6d4", 
        amount,
        purchaseType = "single",
        cartItems = []
      } = options;

      // Create order based on purchase type
      let orderData;
      if (purchaseType === "cart") {
        orderData = await userAPI.createRazorpayOrder(null, "cart");
      } else {
        orderData = await userAPI.createRazorpayOrder(courseId, "single");
      }

      // Return a promise that resolves when payment is complete
      return new Promise((resolve, reject) => {
        // Initialize Razorpay
        const rzp = new window.Razorpay({
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: companyName,
          description: purchaseType === "cart" 
            ? `Purchase ${orderData.courses.length} courses` 
            : orderData.courses[0]?.course_title || 'Course Purchase',
          order_id: orderData.order_id,
          prefill: {
            name: orderData.user_name,
            email: orderData.user_email,
          },
          theme: {
            color: themeColor,
          },
          handler: async (response) => {
            try {
              // Prepare verification data based on purchase type
              const verificationData = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                purchase_type: purchaseType
              };

              // Add course information based on purchase type
              if (purchaseType === "cart") {
                verificationData.course_ids = orderData.courses.map(c => c.course_id);
              } else {
                verificationData.course_id = orderData.courses[0]?.course_id;
              }

              const verificationResult = await userAPI.verifyRazorpayPayment(verificationData);
              
              // Return success result with updated structure
              const result = {
                success: true,
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                course_ids: verificationResult.course_ids,
                purchase_ids: verificationResult.purchase_ids,
                // Backward compatibility
                course_id: verificationResult.course_id,
                purchase_id: verificationResult.purchase_id
              };

              resolve(result);
            } catch (verificationError) {
              console.error('Payment verification failed:', verificationError);
              const errorMessage = verificationError.response?.data?.detail || 'Payment verification failed';
              setError(errorMessage);
              reject(verificationError);
            }
          },
          modal: {
            ondismiss: () => {
              const dismissError = new Error('Payment cancelled by user');
              setError('Payment cancelled by user');
              reject(dismissError);
            }
          }
        });

        // Open Razorpay checkout
        rzp.open();
      });

    } catch (error) {
      console.error('Payment process failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Payment failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    processPayment,
    loading,
    error,
    clearError
  };
};