"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { courseAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Edit, Trash2 } from "lucide-react"
import { getImageUrl } from "../../components/common/ImageURL"

const InstructorDrafts = () => {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const data = await courseAPI.getDrafts()
      setDrafts(data)
    } catch (error) {
      console.error("Error fetching drafts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (courseId) => {
    navigate(`/instructor/create-course/${courseId}`)
  }

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      try {
        await courseAPI.deleteCourse(courseId)
        fetchDrafts()
      } catch (error) {
        console.error("Error deleting course:", error)
      }
    }
  }

  // const getImageUrl = (imagePath) => {
  //   if (!imagePath) return null
  //   // If it's already a full URL, return as is
  //   if (imagePath.startsWith("http")) return imagePath
  //   // Otherwise, construct the URL with your backend base URL
  //   const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
  //   return `${baseUrl}/${imagePath}`
  // }

  if (loading) return <LoadingSpinner size="large" />

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Draft Courses</h1>
        <button
          onClick={() => navigate("/instructor/create-course")}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Create New Course
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Edit className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts yet</h3>
          <p className="text-gray-600 mb-4">Start creating your first course</p>
          <button
            onClick={() => navigate("/instructor/create-course")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                {course.cover_image ? (
                  <img
                    src={getImageUrl(course.cover_image) || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none"
                      e.target.nextSibling.style.display = "flex"
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full flex items-center justify-center text-gray-400"
                  style={{ display: course.cover_image ? "none" : "flex" }}
                >
                  No Image
                </div>
                <div className="absolute top-2 right-2">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Draft</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title || "Untitled Course"}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.subtitle || "No subtitle"}</p>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(course.id)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
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

export default InstructorDrafts
