"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { courseAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Eye, Edit, BarChart3, Users, DollarSign } from "lucide-react"

const MyCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyCourses()
  }, [])

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith("http")) return imagePath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    return `${baseUrl}/${imagePath}`
  }

  const fetchMyCourses = async () => {
    try {
      const data = await courseAPI.getMyCourses()
      setCourses(data)
    } catch (error) {
      console.error("Error fetching my courses:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner size="large" />

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <button
          onClick={() => navigate("/instructor/create-course")}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Create New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <BarChart3 className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No published courses yet</h3>
          <p className="text-gray-600 mb-4">Create and publish your first course to see it here</p>
          <button
            onClick={() => navigate("/instructor/create-course")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Course
          </button>
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
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Published</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.subtitle}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  {/* <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span>0 students</span>
                  </div> */}
                  <div className="flex items-center space-x-1">
                    {/* <DollarSign size={14} /> */}
                    <span>₹  {course.price}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      // onClick={() => navigate(`/courses/${course.id}`)} 
                      onClick={() => navigate(`/instructor/courses/${course.id}/review/detailed-view`)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    <button
                      // onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                      onClick={ ()=> navigate(`/instructor/create-course/${course.id}`)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => navigate(`/instructor/courses/${course.id}/analytics`)}
                      className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm"
                    >
                      <BarChart3 size={14} />
                      <span>Analytics</span>
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

export default MyCourses
