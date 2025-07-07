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
}
