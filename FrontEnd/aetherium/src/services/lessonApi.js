import api from "./api.js"

export const lessonAPI = {
  // Lesson Management
  createLesson: async (sectionId, lessonData) => {
    const response = await api.post(`/lessons/sections/${sectionId}/lessons`, lessonData)
    return response.data
  },

  updateLesson: async (lessonId, lessonData) => {
    const response = await api.put(`/lessons/lessons/${lessonId}`, lessonData)
    return response.data
  },

  deleteLesson: async (lessonId) => {
    const response = await api.delete(`/lessons/lessons/${lessonId}`)
    return response.data
  },

  getLesson: async (lessonId) => {
    const response = await api.get(`/lessons/lessons/${lessonId}`)
    return response.data
  },

  // Content Upload
  uploadLessonContent: async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await api.post("/lessons/upload-content", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Assessment Management
  submitAssessment: async (assessmentData) => {
    const response = await api.post("/lessons/assessments/submit", assessmentData)
    return response.data
  },

  // Progress Tracking
  updateLessonProgress: async (lessonId, progressData) => {
    const response = await api.post(`/lessons/lessons/${lessonId}/progress`, progressData)
    return response.data
  },

  getCourseProgress: async (courseId) => {
    const response = await api.get(`/lessons/courses/${courseId}/progress`)
    return response.data
  },

  // Certificate
  generateCertificate: async (courseId) => {
    const response = await api.post(`/lessons/courses/${courseId}/certificate`)
    return response.data
  },
}
