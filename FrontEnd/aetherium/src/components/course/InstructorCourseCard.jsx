"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const InstructorCourseCard = ({ course, onEdit, showActions = true }) => {
  const { user } = useAuth()
  const isInstructor = user?.role?.name === "instructor"

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=160&width=240"
    if (imagePath.startsWith("http")) return imagePath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    return `${baseUrl}/${imagePath}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={getImageUrl(course.cover_image) || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-40 sm:h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.verification_status)}`}
          >
            {course.verification_status}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">{course.title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">{course.subtitle}</p>

        {/* Only show price for non-instructors */}
        {!isInstructor && (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-xs sm:text-sm">0 students</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              <span className="text-xs sm:text-sm">${course.price}</span>
            </div>
          </div>
        )}

        {/* Instructor-specific actions */}
        {isInstructor && showActions && (
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <button
                onClick={() => window.open(`/courses/${course.id}`, "_blank")}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>Preview</span>
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(course.id)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-xs sm:text-sm px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Edit</span>
                </button>
              )}
              <Link
                to={`/instructor/courses/${course.id}/analytics`}
                className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-xs sm:text-sm px-2 py-1 rounded hover:bg-purple-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Analytics</span>
              </Link>
            </div>
          </div>
        )}

        {/* Regular user purchase button (only for non-instructors) */}
        {!isInstructor && (
          <Link
            to={`/courses/${course.id}`}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors mt-4"
          >
            View Course
          </Link>
        )}
      </div>
    </div>
  )
}

export default InstructorCourseCard
