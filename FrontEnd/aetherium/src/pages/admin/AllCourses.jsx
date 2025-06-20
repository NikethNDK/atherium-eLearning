"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { adminAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Eye, Edit, Clock, Users, DollarSign } from "lucide-react"

const AllCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const data = await adminAPI.getAllCourses()
      setCourses(data)
    } catch (error) {
      console.error("Error fetching courses:", error)
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "PENDING":
        return "bg-orange-100 text-orange-800"
      case "verified":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      course.verification_status === statusFilter ||
      (statusFilter === "published" && course.is_published)

    return matchesSearch && matchesStatus
  })

  if (loading) return <LoadingSpinner size="large" />

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Draft</option>
            <option value="PENDING">Pending Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">No courses match your current filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
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
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.verification_status)}`}
                  >
                    {course.verification_status === "PENDING" ? "Pending Review" : course.verification_status}
                  </span>
                </div>
                {course.is_published && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Published</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title || "Untitled Course"}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.subtitle || "No subtitle"}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span>0 students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign size={14} />
                    <span>${course.price || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{course.duration || 0}h</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  Instructor: {course.instructor?.firstname} {course.instructor?.lastname}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/admin/courses/${course.id}/review`)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                      title="Review Course"
                    >
                      <Eye size={14} />
                      <span>Review</span>
                    </button>
                    <button
                      onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm"
                      title="Edit Course"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">{new Date(course.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllCourses
