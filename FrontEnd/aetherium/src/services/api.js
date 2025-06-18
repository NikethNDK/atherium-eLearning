

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
    console.log("login response",response.data)
    return response.data
  },


  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      console.log("getCurrentUser response:", response.data); 
      return response.data;
    } catch (error) {
      console.error("getCurrentUser error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      }); // Debug
      if (error.response?.status === 401) {
        return null;
      }
      throw error;
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
    console.log("Initiating Google login");
    window.location.href = `${API_BASE_URL}/auth/google/login`
  },

exchangeGoogleCode: async ({ code }) => {
    try {
      const response = await api.post("/auth/google/exchange", { code });
      console.log("exchangeGoogleCode response:", response.data);
      return response.data;
    } catch (error) {
      console.error("exchangeGoogleCode error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
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

//Course Related apis -- Instructor
export const courseAPI = {
  createStep1: async (courseData) => {
    const response = await api.post("/instructor/courses/step1", courseData);
    return response.data;
  },
  updateStep2: async (courseId, courseData, coverImage, trailerVideo) => {
    const formData = new FormData();
    Object.keys(courseData).forEach((key) => formData.append(key, courseData[key]));
    if (coverImage) formData.append("cover_image", coverImage);
    if (trailerVideo) formData.append("trailer_video", trailerVideo);
    const response = await api.post(`/instructor/courses/${courseId}/step2`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  updateStep3: async (courseId, courseData) => {
    const response = await api.post(`/instructor/courses/${courseId}/step3`, courseData);
    return response.data;
  },
  updateStep4: async (courseId, courseData) => {
    const response = await api.post(`/instructor/courses/${courseId}/step4`, courseData);
    return response.data;
  },
  submitCourse: async (courseId) => {
    const response = await api.post(`/instructor/courses/${courseId}/submit`);
    return response.data;
  },
  getDrafts: async () => {
    const response = await api.get("/instructor/courses/drafts");
    return response.data;
  },
};

export const adminAPI = {
  getCourse: async (id) => {
    const response = await api.get(`/admin/courses/${id}`);
    return response.data;
  },
  reviewCourse: async (id, status, adminResponse) => {
    const response = await api.post(`/admin/courses/${id}/review`, { status, admin_response: adminResponse });
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await api.post("/admin/categories", categoryData);
    return response.data;
  },
  createTopic: async (topicData) => {
    const response = await api.post("/admin/topics", topicData);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get("/admin/categories");
    return response.data;
  },
  getTopics: async () => {
    const response = await api.get("/admin/topics");
    return response.data;
  },
};


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