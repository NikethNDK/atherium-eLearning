import api from "./api.js"

export const authAPI = {
  // Existing auth methods...
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials)
    return response.data
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData)
    return response.data
  },

  // Password reset methods
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email })
    return response.data
  },

  resetPassword: async (resetData) => {
    const response = await api.post("/auth/reset-password", resetData)
    return response.data
  },

  verifyResetToken: async (token) => {
    const response = await api.get(`/auth/verify-reset-token/${token}`)
    return response.data
  },

  // Other existing methods...
  refreshToken: async () => {
    const response = await api.post("/auth/refresh")
    return response.data
  },

  logout: async () => {
    const response = await api.post("/auth/logout")
    return response.data
  },
}
