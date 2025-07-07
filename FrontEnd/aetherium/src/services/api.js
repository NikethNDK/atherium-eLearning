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
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
