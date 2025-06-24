"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Play, Clock, BookOpen, Award } from "lucide-react"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { userAPI } from "../../services/userApi"
import { useAuth } from "../../context/AuthContext"

const MyLearning = () => {
  const { isAuthenticated } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all") // all, in-progress, completed

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyCourses()
    }
  }, [isAuthenticated])

  const fetchMyCourses = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getMyCourses()
      setCourses(data)
    } catch (error) {
      console.error("Error fetching my courses:", error)
      setError("Failed to load your courses.")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return `₹${price?.toFixed(2) || "0.00"}`
  }

  const getProgressPercentage = (course) => {
    // Mock progress calculation - in real app, this would come from backend
    return Math.floor(Math.random() * 100)
  }

  const filteredCourses = courses.filter((course) => {
    const progress = getProgressPercentage(course)
    if (filter === "in-progress") return progress > 0 && progress < 100
    if (filter === "completed") return progress === 100
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <LoadingSpinner />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: "all", label: "All Courses", count: courses.length },
                {
                  id: "in-progress",
                  label: "In Progress",
                  count: courses.filter((c) => {
                    const p = getProgressPercentage(c)
                    return p > 0 && p < 100
                  }).length,
                },
                {
                  id: "completed",
                  label: "Completed",
                  count: courses.filter((c) => getProgressPercentage(c) === 100).length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 text-lg mb-4">
              {filter === "all" ? "No courses purchased yet" : `No ${filter.replace("-", " ")} courses`}
            </div>
            <p className="text-gray-400 mb-8">
              {filter === "all"
                ? "Start learning by purchasing your first course!"
                : "Check back later as you progress through your courses."}
            </p>
            {filter === "all" && (
              <Link to="/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                Browse Courses
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const progress = getProgressPercentage(course)
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={course.cover_image || "/placeholder.svg?height=200&width=300"}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Link
                        to={`/my-learning/${course.id}`}
                        className="bg-white bg-opacity-20 rounded-full p-4 hover:bg-opacity-30 transition-colors"
                      >
                        <Play className="w-8 h-8 text-white" />
                      </Link>
                    </div>
                    {progress === 100 && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                        <Award className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>

                    <div className="flex items-center mb-3 text-sm text-gray-600">
                      <img
                        src={course.instructor?.profile_picture || "/placeholder.svg?height=20&width=20"}
                        alt={course.instructor?.firstname}
                        className="w-5 h-5 rounded-full mr-2"
                      />
                      <span>
                        {course.instructor?.firstname} {course.instructor?.lastname}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {course.duration || 0} {course.duration_unit || "hours"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>{course.sections?.length || 0} sections</span>
                      </div>
                    </div>

                    <Link
                      to={`/my-learning/${course.id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 block text-center"
                    >
                      {progress === 0 ? "Start Learning" : progress === 100 ? "Review Course" : "Continue Learning"}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default MyLearning
