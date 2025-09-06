import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export const authAPI = {
  register: async (userData) => {
    console.log("Sending register request:", userData)
    const response = await api.post("/auth/register", userData)
    console.log("Register response:", response.data)
    return response.data
  },

  login: async (credentials) => {
    const formData = new FormData()
    formData.append("username", credentials.email)
    formData.append("password", credentials.password)
    const response = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    console.log("login response", response.data)
    return response.data
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me")
      console.log("getCurrentUser response:", response.data)
      return response.data
    } catch (error) {
      console.error("getCurrentUser error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      }) // Debug
      if (error.response?.status === 401) {
        return null
      }
      throw error
    }
  },

  logout: async () => {
    const response = await api.post("/auth/logout")
    return response.data
  },

  sendOTP: async (email) => {
    const response = await api.post("/auth/send-otp", { email })
    return response.data
  },

  verifyOTP: async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp })
    return response.data
  },

  updateBio: async (bioData) => {
    const response = await api.put("/auth/bio", bioData)
    return response.data
  },

  changePassword: async (passwordData) => {
    const response = await api.post("/auth/change-password", passwordData)
    return response.data
  },

  uploadProfilePicture: async (formData) => {
    console.log("Sending upload request with FormData:", Array.from(formData.entries()))
    const response = await api.post("/auth/upload-profile-picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  googleLogin: async () => {
    console.log("Initiating Google login")
    window.location.href = `${API_BASE_URL}/auth/google/login`
  },

  exchangeGoogleCode: async ({ code }) => {
    try {
      const response = await api.post("/auth/google/exchange", { code })
      console.log("exchangeGoogleCode response:", response.data)
      return response.data
    } catch (error) {
      console.error("exchangeGoogleCode error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
      throw error
    }
  },

  getAllUsers: async () => {
    console.log("Fetching all users from /admin/users")
    const response = await api.get("/admin/users")
    console.log("Received users:", response.data)
    return response.data
  },

  blockUser: async (userId, block) => {
    const response = await api.post(`/admin/users/${userId}/block`, { block })
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.post("/auth/profile", profileData)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile")
    return response.data
  },
  // Password reset methods
  // forgotPassword: async (email) => {
  //   const response = await api.post("/auth/forgot-password", { email })
  //   return response.data
  // },
  forgotPassword: async (email) => {
    console.log("Sending forgot password request for:", email); // Add logging
    const response = await api.post("/auth/forgot-password", { email });
    console.log("Forgot password response:", response.data); // Add logging
    return response.data;
  },

  resetPassword: async (resetData) => {
    const response = await api.post("/auth/reset-password", resetData)
    return response.data
  },

  verifyResetToken: async (token) => {
    const response = await api.get(`/auth/verify-reset-token/${token}`)
    return response.data
  },
  refreshToken: async () => {
    const response = await api.post("/auth/refresh-token");
    return response.data;
  }
}

// Enhanced Course Related APIs -- Instructor
export const courseAPI = {
  createStep1: async (courseData) => {
    const response = await api.post("/instructor/courses/step1", courseData)
    return response.data
  },

  updateStep2: async (courseId, formData) => {
    const response = await api.put(`/instructor/courses/${courseId}/step2`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
 
  updateStep3: async (courseId, courseData) => {
    const response = await api.put(`/instructor/courses/${courseId}/step3`, courseData)
    return response.data
  },

  updateStep4: async (courseId, courseData) => {
    const response = await api.put(`/instructor/courses/${courseId}/step4`, courseData)
    return response.data
  },

  submitCourse: async (courseId) => {
    const response = await api.post(`/instructor/courses/${courseId}/submit`)
    return response.data
  },

  getDrafts: async () => {
    const response = await api.get("/instructor/courses/drafts")
    return response.data
  },

  getPendingApproval: async () => {
    const response = await api.get("/instructor/courses/pending-approval")
    return response.data
  },

  getMyCourses: async () => {
    const response = await api.get("/instructor/courses/my-courses")
    return response.data
  },

  getCourse: async (courseId) => {
    const response = await api.get(`/instructor/courses/${courseId}`)
    return response.data
  },

  updateCourseStatus: async (courseId, statusData) => {
    const response = await api.put(`/instructor/courses/${courseId}/status`, statusData)
    return response.data
  },

  deleteCourse: async (courseId) => {
    const response = await api.delete(`/instructor/courses/${courseId}`)
    return response.data
  },

  searchInstructors: async (query) => {
    const response = await api.get(`/instructor/courses/search/instructors?q=${encodeURIComponent(query)}`)
    return response.data
  },

  getAllInstructors: async () => {
    const response = await api.get("/instructor/courses/all/instructors")
    return response.data
  },
}

export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard/stats")
    return response.data
  },

  getTopInstructors: async () => {
    const response = await api.get("/admin/top-instructors")
    return response.data
  },

  getAllCourses: async () => {
    const response = await api.get("/admin/courses")
    return response.data
  },

  getCourse: async (id) => {
    const response = await api.get(`/admin/courses/${id}`)
    return response.data
  },

  getPendingCourses: async () => {
    const response = await api.get("/admin/courses/pending")
    return response.data
  },

  reviewCourse: async (id, status, adminResponse) => {
    const response = await api.post(`/admin/courses/${id}/review`, {
      status,
      admin_response: adminResponse,
    })
    return response.data
  },

  createCategory: async (categoryData) => {
    const response = await api.post("/admin/categories", categoryData)
    return response.data
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/admin/categories/${categoryId}`, categoryData)
    return response.data
  },

  createTopic: async (topicData) => {
    const response = await api.post("/admin/topics", topicData)
    return response.data
  },

  getCategories: async () => {
    const response = await api.get("/admin/categories")
    return response.data
  },

  getTopics: async () => {
    const response = await api.get("/admin/topics")
    return response.data
  },
  getComprehensiveDashboard: async () => {
    const response = await api.get("/admin/dashboard/comprehensive")
    return response.data
  },

  getRevenueAnalytics: async (days = 30) => {
    const response = await api.get(`/admin/dashboard/revenue-analytics?days=${days}`)
    return response.data
  },

  getCategoryAnalytics: async () => {
    const response = await api.get("/admin/dashboard/category-analytics")
    return response.data
  },

  getInstructorAnalytics: async () => {
    const response = await api.get("/admin/dashboard/instructor-analytics")
    return response.data
  },

  getBestSellingCourses: async (limit = 10) => {
    const response = await api.get(`/admin/dashboard/best-selling-courses?limit=${limit}`)
    return response.data
  },
  getCourseReport: async (params) => {
    const response = await api.get("/admin/course-report", { params });
    return response.data;
  },

  downloadCourseReportCSV: async (params) => {
    // This returns a blob for CSV download
    const response = await api.get("/admin/course-report/download", {
      params,
      responseType: "blob",
    });
    return response;
  },
  getAllInstructors: async () => {
    const response = await api.get("/admin/instructors");
    return response.data;
  },

  // Withdrawal Management APIs
  getWithdrawalRequests: async (page = 1, limit = 10, statusFilter = null) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (statusFilter) params.append("status_filter", statusFilter);
    
    const response = await api.get(`/admin/withdrawal/requests?${params.toString()}`);
    return response.data;
  },

  updateWithdrawalRequest: async (requestId, status, adminFeedback = null) => {
    const response = await api.put(`/admin/withdrawal/requests/${requestId}`, {
      status,
      admin_feedback: adminFeedback
    });
    return response.data;
  },

  getWithdrawalRequestDetails: async (requestId) => {
    const response = await api.get(`/admin/withdrawal/requests/${requestId}`);
    return response.data;
  },

  getInstructorWithdrawalRequests: async (instructorId, page = 1, limit = 10) => {
    const response = await api.get(`/admin/withdrawal/instructor/${instructorId}/requests?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Admin Bank Details
  createBankDetails: async (bankData) => {
    const response = await api.post("/admin/bank-details", bankData);
    return response.data;
  },

  getBankDetails: async () => {
    const response = await api.get("/admin/bank-details");
    return response.data;
  },

  updateBankDetails: async (bankDetailId, updateData) => {
    const response = await api.put(`/admin/bank-details/${bankDetailId}`, updateData);
    return response.data;
  },

  deleteBankDetails: async (bankDetailId) => {
    const response = await api.delete(`/admin/bank-details/${bankDetailId}`);
    return response.data;
  },

  getPrimaryBankDetails: async () => {
    const response = await api.get("/admin/bank-details/primary");
    return response.data;
  },

  // Admin Withdrawal
  createWithdrawalRequest: async (amount, bankDetailsId) => {
    const response = await api.post("/admin/withdrawal/request", { amount }, {
      params: { bank_details_id: bankDetailsId }
    });
    return response.data;
  },

  getWithdrawalRequests: async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/withdrawal/requests?page=${page}&limit=${limit}`);
    return response.data;
  },

  getWalletBalance: async () => {
    const response = await api.get("/admin/wallet/balance");
    return response.data;
  },
}

export const chatAPI = {
  // Get all conversations
  getConversations: async (page = 1, limit = 20) => {
    const response = await api.get("/chat/conversations", {
      params: { page, limit }
    });
    return response.data;
  },

  // Get messages for a conversation
  getConversationMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Create a new conversation
  createConversation: async (courseId, instructorId) => {
    const response = await api.post("/chat/conversations", {
      course_id: courseId,
      instructor_id: instructorId
    });
    return response.data;
  },

  // Send a text message
  sendMessage: async (conversationId, content, messageType = "text") => {
    const response = await api.post("/chat/messages", {
      conversation_id: conversationId,
      content,
      message_type: messageType
    });
    return response.data;
  },

  // Send an image message
  sendImageMessage: async (conversationId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post(`/chat/messages/image?conversation_id=${conversationId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get or create conversation for a course
  getCourseConversation: async (courseId) => {
    const response = await api.get(`/chat/courses/${courseId}/conversation`);
    return response.data;
  },

  // Get all messages from all conversations with an instructor (for grouped conversations)
  getInstructorMessages: async (instructorId, page = 1, limit = 50) => {
    const response = await api.get(`/chat/instructors/${instructorId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Send a message to an instructor (for grouped conversations)
  sendMessageToInstructor: async (instructorId, content, messageType = "text") => {
    const response = await api.post("/chat/instructors/messages", {
      instructor_id: instructorId,
      content,
      message_type: messageType
    });
    return response.data;
  },

  // Send an image message to an instructor (for grouped conversations)
  sendImageMessageToInstructor: async (instructorId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instructor_id", instructorId);
    
    const response = await api.post("/chat/instructors/messages/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all messages from all conversations with a user (for instructors)
  getUserMessages: async (userId, page = 1, limit = 50) => {
    const response = await api.get(`/chat/users/${userId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Send a message to a user (for instructors)
  sendMessageToUser: async (userId, content, messageType = "text") => {
    const response = await api.post("/chat/users/messages", {
      user_id: userId,
      content,
      message_type: messageType
    });
    return response.data;
  },

  // Send an image message to a user (for instructors)
  sendImageMessageToUser: async (userId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);
    
    const response = await api.post("/chat/users/messages/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Mark messages as read for regular conversations
  markMessagesAsRead: async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/mark-read`);
    return response.data;
  },

  // Mark instructor messages as read (for users)
  markInstructorMessagesAsRead: async (instructorId) => {
    const response = await api.post(`/chat/instructors/${instructorId}/mark-read`);
    return response.data;
  },

  // Mark user messages as read (for instructors)
  markUserMessagesAsRead: async (userId) => {
    const response = await api.post(`/chat/users/${userId}/mark-read`);
    return response.data;
  }
};

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         // Try to refresh token
//         const refreshResponse = await api.post("/auth/refresh-token");
        
//         // Only retry if refresh was successful
//         if (refreshResponse.status === 200) {
//           return api.request(originalRequest);
//         }
//       } catch (refreshError) {
//         // Refresh failed, clear tokens and redirect to login
//         console.log("Token refresh failed, redirecting to login");
//         // Clear cookies or redirect to login
//         return Promise.reject(refreshError);
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );
      
//       try {
//         // Try to refresh token
//         await api.post("/auth/refresh-token");
        
//         // Retry original request
//         return api.request(originalRequest);
//       } catch (refreshError) {
//         // Refresh failed, redirect to login
//         console.log("Token refresh failed, redirecting to login");
//         // window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );


// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error("API error:", {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message,
//     })
//     // if (error.response?.status === 401 && window.location.pathname !== "/login") {
//     //   window.location.href = "/login"
//     // }
//     return Promise.reject(error)
//   },
// )

export default api
