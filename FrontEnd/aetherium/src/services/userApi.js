// import api from "./api.js"

// export const userAPI = {
//   // Get all published courses for users
//   getPublishedCourses: async (filters = {}) => {
//     const params = new URLSearchParams()
//     if (filters.category) params.append("category", filters.category)
//     if (filters.level) params.append("level", filters.level)
//     if (filters.language) params.append("language", filters.language)
//     if (filters.search) params.append("search", filters.search)
//     if (filters.page) params.append("page", filters.page)

//     const response = await api.get(`/user/courses?${params.toString()}`)
//     return response.data
//   },

//   // Get course details by ID
//   getCourseDetails: async (courseId) => {
//     const response = await api.get(`/user/courses/${courseId}`)
//     return response.data
//   },

//   // Get user's purchased courses
//   getMyCourses: async () => {
//     const response = await api.get("/user/my-courses")
//     return response.data
//   },

//   // Add course to cart
//   addToCart: async (courseId) => {
//     const response = await api.post("/user/cart/add", { course_id: courseId })
//     return response.data
//   },

//   // Get cart items
//   getCart: async () => {
//     const response = await api.get("/user/cart")
//     return response.data
//   },

//   // Remove from cart
//   removeFromCart: async (courseId) => {
//     const response = await api.delete(`/user/cart/remove/${courseId}`)
//     return response.data
//   },

//   // Purchase course with wallet
//   purchaseCourse: async (courseId, paymentMethod = "wallet") => {
//     const response = await api.post("/user/purchase", {
//       course_id: courseId,
//       payment_method: paymentMethod,
//     })
//     return response.data
//   },

//   // Get course reviews
//   getCourseReviews: async (courseId, page = 1) => {
//     const response = await api.get(`/user/courses/${courseId}/reviews?page=${page}`)
//     return response.data
//   },

//   // Check if course is purchased
//   checkCoursePurchase: async (courseId) => {
//     const response = await api.get(`/user/courses/${courseId}/purchase-status`)
//     return response.data
//   },
//   // Order History
//   getOrderHistory: async (page = 1) => {
//     const response = await api.get(`/user/orders?page=${page}`)
//     return response.data
//   },

//   getOrderDetail: async (orderId) => {
//     const response = await api.get(`/user/orders/${orderId}`)
//     return response.data
//   },

//   // Wishlist functions
//   getWishlist: async () => {
//     const response = await api.get("/user/wishlist")
//     return response.data
//   },

//   addToWishlist: async (courseId) => {
//     const response = await api.post("/user/wishlist/add", { course_id: courseId })
//     return response.data
//   },

//   removeFromWishlist: async (courseId) => {
//     const response = await api.delete(`/user/wishlist/remove/${courseId}`)
//     return response.data
//   },

//   // Enhanced cart function to return count
//   getCartCount: async () => {
//     const cartData = await api.get("/user/cart")
//     return cartData.data.total_items || 0
//   },

//   // Enhanced wishlist count
//   getWishlistCount: async () => {
//     const wishlistData = await api.get("/user/wishlist")
//     return wishlistData.data.length || 0
//   },
// }

import api from "./api.js"


export const userAPI = {
  // =================== COURSE RELATED APIs ===================
  
  getPublishedCourses: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.category) params.append("category", filters.category)
    if (filters.level) params.append("level", filters.level)
    if (filters.language) params.append("language", filters.language)
    if (filters.search) params.append("search", filters.search)
    if (filters.page) params.append("page", filters.page)

    const response = await api.get(`/user/courses?${params.toString()}`)
    return response.data
  },

  getCourseDetails: async (courseId) => {
    const response = await api.get(`/user/courses/${courseId}`)
    return response.data
  },

  getMyCourses: async () => {
    const response = await api.get("/user/my-courses")
    return response.data
  },

  getCourseReviews: async (courseId, page = 1) => {
    const response = await api.get(`/user/courses/${courseId}/reviews?page=${page}`)
    return response.data
  },

  createCourseReview: async (courseId, reviewData) => {
    const response = await api.post(`/user/courses/${courseId}/reviews`, {
      course_id: courseId,
      ...reviewData
    })
    return response.data
  },
  updateCourseReview:async(courseId,reviewData)=>{
    const response = await api.put(`/user/courses/${courseId}/reviews`,{
      course_id:courseId,
      ...reviewData
    })
  },

  checkCoursePurchase: async (courseId) => {
    const response = await api.get(`/user/courses/${courseId}/purchase-status`)
    return response.data
  },

  // =================== CART RELATED APIs ===================

  addToCart: async (courseId) => {
    const response = await api.post("/user/cart/add", { course_id: courseId })
    return response.data
  },

  getCart: async () => {
    const response = await api.get("/user/cart")
    return response.data
  },

  removeFromCart: async (courseId) => {
    const response = await api.delete(`/user/cart/remove/${courseId}`)
    return response.data
  },

  getCartCount: async () => {
    const cartData = await api.get("/user/cart")
    return cartData.data.total_items || 0
  },

  // =================== WISHLIST RELATED APIs ===================

  getWishlist: async () => {
    const response = await api.get("/user/wishlist")
    return response.data
  },

  addToWishlist: async (courseId) => {
    const response = await api.post("/user/wishlist/add", { course_id: courseId })
    return response.data
  },

  removeFromWishlist: async (courseId) => {
    const response = await api.delete(`/user/wishlist/remove/${courseId}`)
    return response.data
  },

  getWishlistCount: async () => {
    const wishlistData = await api.get("/user/wishlist")
    return wishlistData.data.length || 0
  },

  // =================== PURCHASE & PAYMENT RELATED APIs ===================

  purchaseCourse: async (courseId, paymentMethod = "wallet") => {
    const response = await api.post("/user/purchase", {
      course_id: courseId,
      payment_method: paymentMethod,
    })
    return response.data
  },

  // Razorpay API calls (just the backend communication)
  // createRazorpayOrder: async (courseId) => {
  //   const response = await api.post("/user/payment/create-razorpay-order", {
  //     course_id: courseId,
  //     payment_method: "CARD"
  //   })
  //   return response.data
  // },

  // verifyRazorpayPayment: async (paymentData) => {
  //   const response = await api.post("/user/payment/verify-razorpay", paymentData)
  //   return response.data
  // },

   createRazorpayOrder: async (courseId, purchaseType = "single") => {
    const requestData = {
      payment_method: "CARD",
      purchase_type: purchaseType
    };

    // Only include course_id for single course purchases
    if (purchaseType === "single" && courseId) {
      requestData.course_id = courseId;
    }

    const response = await api.post("/user/payment/create-razorpay-order", requestData);
    return response.data;
  },

  // Updated verifyRazorpayPayment to handle multiple courses
  verifyRazorpayPayment: async (paymentData) => {
    const response = await api.post("/user/payment/verify-razorpay", paymentData);
    return response.data;
  },

  // =================== ORDER HISTORY APIs ===================

  // getOrderHistory: async (page = 1) => {
  //   // const response = await api.get(`/user/orders?page=${page}`)
  //   const response = await api.get('/user/orders')
  //   return response.data
  // },
  getOrderHistory: async (page = 1) => {
  const response = await api.get(`/user/orders?page=${page}&limit=10`)
  return response.data
},

  getOrderDetail: async (orderId) => {
    const response = await api.get(`/user/orders/${orderId}`)
    return response.data
  },

  getPurchaseHistory: async (page = 1) => {
    return userAPI.getOrderHistory(page)
  },

  // Progress Tracking
  getCourseProgress: async (courseId) => {
    const response = await api.get(`/user/progress/courses/${courseId}`);
    return response.data;
  },

  getSectionProgress: async (sectionId) => {
    const response = await api.get(`/user/progress/sections/${sectionId}`);
    return response.data;
  },

  getLessonProgress: async (lessonId) => {
    const response = await api.get(`/user/progress/lessons/${lessonId}`);
    return response.data;
  },
  updateLessonProgress: async (lessonId, data) => {
    const response = await api.post(`/user/progress/lessons/${lessonId}`, data)
    return response.data
  },

  completeLesson: async (lessonId) => {
    const response = await api.post(`/user/progress/lessons/${lessonId}/complete`);
    return response.data;
  },

  updateLessonTime: async (lessonId, timeSpent) => {
    const response = await api.post(`/user/progress/lessons/${lessonId}/time`, { time_spent: timeSpent });
    return response.data;
  },
  verifyCertificate: async (courseId) => {
    try{
      const response = await api.get(`/user/verify-certificate/${courseId}`)
      return response.data
    }catch(error){
      console.error("Error verifying certificate:", error)
      throw error
    }
  },

  // =================== LESSON COMMENTS APIs ===================
  
  getLessonComments: async (lessonId, page = 1, limit = 20) => {
    const response = await api.get(`/user/lessons/${lessonId}/comments?page=${page}&limit=${limit}`)
    return response.data
  },

  createLessonComment: async (lessonId, content, parentCommentId = null) => {
    const response = await api.post(`/user/lessons/${lessonId}/comments`, {
      lesson_id: lessonId,
      content,
      parent_comment_id: parentCommentId
    })
    return response.data
  },

  updateLessonComment: async (commentId, content) => {
    const response = await api.put(`/user/comments/${commentId}`, {
      content
    })
    return response.data
  },

  deleteLessonComment: async (commentId) => {
    const response = await api.delete(`/user/comments/${commentId}`)
    return response.data
  }

}