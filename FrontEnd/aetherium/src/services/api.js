

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
    return response.data
  },


  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me")
      return response.data
    } catch (error) {
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
    window.location.href = `${API_BASE_URL}/auth/google/login`
  },

  getAllUsers: async () => {
    console.log("Fetching all users from /admin/users")
    const response = await api.get("/admin/users")
    console.log("Received users:", response.data)
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
      // Prevent redirect loop by checking if already on /login
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api