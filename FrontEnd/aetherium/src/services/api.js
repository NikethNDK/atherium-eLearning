// import axios from "axios"

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// // Auth API calls
// export const authAPI = {
//   // Register user
//   register: async (userData) => {
//     const response = await api.post("/auth/register", userData)
//     return response.data
//   },

//   // Login user
//   login: async (credentials) => {
//     const formData = new FormData()
//     formData.append("username", credentials.email)
//     formData.append("password", credentials.password)

//     const response = await api.post("/auth/login", formData, {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     })
//     return response.data
//   },

//   // Get current user
//   getCurrentUser: async () => {
//     const response = await api.get("/auth/me")
//     return response.data
//   },

//   // Logout
//   logout: async () => {
//     const response = await api.post("/auth/logout")
//     return response.data
//   },

//   // Send OTP
//   sendOTP: async (email) => {
//     const response = await api.post("/auth/send-otp", { email })
//     return response.data
//   },

//   // Verify OTP
//   verifyOTP: async (email, otp) => {
//     const response = await api.post("/auth/verify-otp", { email, otp })
//     return response.data
//   },

//   // Update bio
//   updateBio: async (bioData) => {
//     const response = await api.put("/auth/bio", bioData)
//     return response.data
//   },

//   // Google login
//   googleLogin: async () => {
//     window.location.href = `${API_BASE_URL}/auth/google/login`
//   },
// }

// // Add response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 && requesPath !=="/auth/me") {
//       // Redirect to login if unauthorized
//       window.location.href = "/login"
//     }
//     return Promise.reject(error)
//   },
// )

// export default api
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Auth API calls
export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await api.post("/auth/register", userData)
    return response.data
  },

  // Login user
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

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/me")
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post("/auth/logout")
    return response.data
  },

  // Send OTP
  sendOTP: async (email) => {
    const response = await api.post("/auth/send-otp", { email })
    return response.data
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp })
    return response.data
  },

  // Update bio
  updateBio: async (bioData) => {
    const response = await api.put("/auth/bio", bioData)
    return response.data
  },

  // Google login
  googleLogin: async () => {
    window.location.href = `${API_BASE_URL}/auth/google/login`
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    const response = await api.get("/admin/users")
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put("/auth/profile", profileData)
    return response.data
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get("/auth/profile")
    return response.data
  },
}

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
