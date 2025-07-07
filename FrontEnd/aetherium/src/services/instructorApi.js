import api from "./api.js"

export const instructorAPI = {
  // Course Management
  getMyCourses: async (page = 1, status = null) => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    if (status) params.append("status", status)
    const response = await api.get(`/instructor/my-courses?${params.toString()}`)
    return response.data
  },

  getCourseDetail: async (courseId) => {
    const response = await api.get(`/instructor/courses/${courseId}`)
    return response.data
  },

  getDashboardStats: async () => {
    const response = await api.get("/instructor/dashboard/stats")
    return response.data
  },

  createCourse: async (courseData) => {
    const response = await api.post("/instructor/courses", courseData)
    return response.data
  },

  updateCourse: async (courseId, courseData) => {
    const response = await api.put(`/instructor/courses/${courseId}`, courseData)
    return response.data
  },

  updateCourseStep1: async (courseId, courseData) => {
    const response = await api.put(`/instructor/courses/${courseId}/step1`, courseData)
    return response.data
  },

  updateCourseStep2: async (courseId, courseData) => {
    const response = await api.put(`/instructor/courses/${courseId}/step2`, courseData)
    return response.data
  },

  updateCourseStep3: async (courseId, courseData) => {
    const response = await api.put(`/instructor/courses/${courseId}/step3`, courseData)
    return response.data
  },

  updateCourseStep4: async (courseId, courseData) => {
    const response = await api.put(`/instructor/courses/${courseId}/step4`, courseData)
    return response.data
  },

  deleteCourse: async (courseId) => {
    const response = await api.delete(`/instructor/courses/${courseId}`)
    return response.data
  },

  publishCourse: async (courseId) => {
    const response = await api.post(`/instructor/courses/${courseId}/publish`)
    return response.data
  },

  unpublishCourse: async (courseId) => {
    const response = await api.post(`/instructor/courses/${courseId}/unpublish`)
    return response.data
  },

  submitCourse: async (courseId) => {
    const response = await api.post(`/instructor/courses/${courseId}/submit`)
    return response.data
  },

  // Analytics
  getCourseAnalytics: async (courseId) => {
    const response = await api.get(`/instructor/courses/${courseId}/analytics`)
    return response.data
  },

  // Students
  getCourseStudents: async (courseId, page = 1) => {
    const response = await api.get(`/instructor/courses/${courseId}/students?page=${page}`)
    return response.data
  },

  // Reviews
  getCourseReviews: async (courseId, page = 1) => {
    const response = await api.get(`/instructor/courses/${courseId}/reviews?page=${page}`)
    return response.data
  },

  // Change Requests
  submitCourseChangeRequest: async (courseId, changeData) => {
    const response = await api.post(`/instructor/courses/${courseId}/change-request`, changeData)
    return response.data
  },

  getChangeRequests: async (page = 1) => {
    const response = await api.get(`/instructor/change-requests?page=${page}`)
    return response.data
  },

  // Instructor Search (for co-instructors)
  searchInstructors: async (query) => {
    const response = await api.get(`/instructor/courses/search/instructors?q=${encodeURIComponent(query)}`)
    return response.data
  },

  getAllInstructors: async () => {
    const response = await api.get("/instructor/courses/all/instructors")
    return response.data
  },

  // Enhanced Course Related APIs -- Instructor
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


