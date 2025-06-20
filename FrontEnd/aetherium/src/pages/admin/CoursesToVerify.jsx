"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { adminAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react"

const CoursesToVerify = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPendingCourses()
  }, [])

  const fetchPendingCourses = async () => {
    try {
      const data = await adminAPI.getPendingCourses()
      setCourses(data)
    } catch (error) {
      console.error("Error fetching pending courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith("http")) return imagePath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    return `${baseUrl}/${imagePath}`
  }

  const handleQuickReview = async (courseId, status) => {
    try {
      await adminAPI.reviewCourse(courseId, status, status === "verified" ? "Approved" : "Needs revision")
      fetchPendingCourses()
    } catch (error) {
      console.error("Error reviewing course:", error)
    }
  }

  if (loading) return <LoadingSpinner size="large" />

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses to Verify</h1>
          <p className="text-gray-600 mt-1">{courses.length} courses pending review</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CheckCircle className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses to verify</h3>
          <p className="text-gray-600">All courses have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                {course.cover_image ? (
                  <img
                    src={getImageUrl(course.cover_image) || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Pending Review</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.subtitle}</p>

                <div className="text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1 mb-1">
                    <span>Instructor:</span>
                    <span className="font-medium">
                      {course.instructor?.firstname} {course.instructor?.lastname}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>Submitted {new Date(course.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <button
                    onClick={() => navigate(`/admin/courses/${course.id}/review`)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye size={14} />
                    <span>Review</span>
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleQuickReview(course.id, "verified")}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                      title="Quick Approve"
                    >
                      <CheckCircle size={12} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleQuickReview(course.id, "rejected")}
                      className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                      title="Quick Reject"
                    >
                      <XCircle size={12} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CoursesToVerify
