"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { courseAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Clock, CheckCircle, XCircle, Edit, Eye } from "lucide-react"

const PendingApproval = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPendingCourses()
  }, [])

  const fetchPendingCourses = async () => {
    try {
      const data = await courseAPI.getPendingApproval()
      setCourses(data)
    } catch (error) {
      console.error("Error fetching pending courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (courseId) => {
    navigate(`/instructor/create-course/${courseId}`)
  }

  const handlePublish = async (courseId) => {
    try {
      await courseAPI.updateCourseStatus(courseId, { status: "published" })
      fetchPendingCourses()
    } catch (error) {
      console.error("Error publishing course:", error)
    }
  }

  const handleDisable = async (courseId) => {
    try {
      await courseAPI.updateCourseStatus(courseId, { status: "disabled" })
      fetchPendingCourses()
    } catch (error) {
      console.error("Error disabling course:", error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-500" size={16} />
      case "verified":
        return <CheckCircle className="text-green-500" size={16} />
      case "rejected":
        return <XCircle className="text-red-500" size={16} />
      default:
        return <Clock className="text-gray-500" size={16} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "verified":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith("http")) return imagePath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    return `${baseUrl}/${imagePath}`
  }

  if (loading) return <LoadingSpinner size="large" />

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Pending Approval</h1>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses pending approval</h3>
          <p className="text-gray-600">Submit a course for review to see it here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
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
      
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(course.verification_status)}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.verification_status)}`}
                        >
                          {course.verification_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {course.admin_response || "No remarks yet"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(course.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          course.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {course.is_published ? "Published" : "Not Published"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {course.verification_status === "verified" && !course.is_published && (
                        <button
                          onClick={() => handlePublish(course.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Publish
                        </button>
                      )}
                      {course.is_published && (
                        <button onClick={() => handleDisable(course.id)} className="text-red-600 hover:text-red-900">
                          Disable
                        </button>
                      )}
                      {course.verification_status === "rejected" && (
                        <button
                          onClick={() => handleEdit(course.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/instructor/courses/${course.id}/preview`)}
                        className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                      >
                        <Eye size={14} />
                        <span>Preview</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingApproval
