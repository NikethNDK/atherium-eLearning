
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

  // updateCourseStep2: async (courseId, courseData) => {
  //   const response = await api.put(`/instructor/courses/${courseId}/step2`, courseData)
  //   return response.data
  // },

  updateCourseStep3: async (courseId) => {
    const response = await api.put(`/instructor/courses/${courseId}/step3`)
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
 
  // updateStep3: async (courseId, courseData) => {
  //   const response = await api.put(`/instructor/courses/${courseId}/step3`, courseData)
  //   return response.data
  // },

  // updateStep3Lesson: async (sectionId, lessonData) => {
  //   const response = await api.put(`/instructor/courses/lesson/${sectionId}/step3Lesson`, lessonData)
  //   return response.data
  // },

  updateStep4: async (courseId, courseData) => {
    const response = await api.put(`/instructor/courses/${courseId}/step4`, courseData)
    return response.data
  },

  submitCourse: async (courseId) => {
    const response = await api.post(`/instructor/courses/${courseId}/submit`)
    return response.data
  },



// Section Management APIs
  createSection: async (courseId, sectionName) => {
    const response = await api.post(`/instructor/courses/${courseId}/sections`, { name: sectionName })
    return response.data
  },

  updateSection: async (sectionId, sectionName) => {
    const response = await api.put(`/instructor/sections/${sectionId}`, { name: sectionName })
    return response.data
  },

  deleteSection: async (sectionId) => {
    const response = await api.delete(`/instructor/sections/${sectionId}`)
    return response.data
  },

  // Lesson Management APIs (added based on backend endpoints)
  createLesson: async (sectionId, lessonData) => {
    const response = await api.post(`/instructor/sections/${sectionId}/lessons`, lessonData)
    return response.data
  },

  updateLesson: async (lessonId, lessonData) => {
    const response = await api.put(`/instructor/lessons/${lessonId}`, lessonData)
    return response.data
  },

  deleteLesson: async (lessonId) => {
    const response = await api.delete(`/instructor/lessons/${lessonId}`)
    return response.data
  },

  uploadLessonFile: async (lessonId, file, fileType) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("file_type", fileType)
    const response = await api.post(`/instructor/lessons/${lessonId}/upload-file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
  getUploadStatus: async (taskId) => {
    const response = await api.get(`/instructor/lessons/upload-status/${taskId}`)
    return response.data
  },
getLessonAssessment: async (lessonId) => {
  const response = await api.get(`/instructor/lessons/${lessonId}/assessment`);
  return response.data;
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

  // Withdrawal APIs
  createWithdrawalRequest: async (amount) => {
    const response = await api.post("/instructor/withdrawal/request", { amount })
    return response.data
  },

  getWithdrawalRequests: async (page = 1, limit = 10) => {
    const response = await api.get(`/instructor/withdrawal/requests?page=${page}&limit=${limit}`)
    return response.data
  },

  getAccountSummary: async () => {
    const response = await api.get("/instructor/withdrawal/account-summary")
    return response.data
  },

  completeWithdrawal: async (requestId) => {
    const response = await api.post(`/instructor/withdrawal/complete/${requestId}`)
    return response.data
  },

  createBankDetails: async (bankData) => {
    const response = await api.post("/instructor/withdrawal/bank-details", bankData)
    return response.data
  },

  getBankDetails: async () => {
    const response = await api.get("/instructor/withdrawal/bank-details")
    return response.data
  },

  deleteBankDetails: async (bankDetailId) => {
    const response = await api.delete(`/instructor/withdrawal/bank-details/${bankDetailId}`)
    return response.data
  }

}


export const CourseAnalyticsService = {
  getCourseAnalytics: async (courseId) => {
    const response = await api.get(`/instructor/courses/${courseId}/analytics`);
    return response.data;
  },
  
  getPurchaseStats: async (courseId, period = 'monthly') => {
    const response = await api.get(`/instructor/courses/${courseId}/purchase-stats?period=${period}`);
    return response.data;
  },
  
  getStudentProgress: async (courseId) => {
    const response = await api.get(`/instructor/courses/${courseId}/student-progress`);
    return response.data;
  }
};
