"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Clock, Users, BookOpen, Globe, BarChart3, Heart, ShoppingCart } from "lucide-react"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
// import CourseDetailTabs from "../../components/course/CourseDetailsTabs"
import CourseDetailTabs from "../../components/course/CourseDetailsTab"
import CourseCard from "../../components/course/CourseCard"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { userAPI } from "../../services/userApi"
import { useAuth } from "../../context/AuthContext"

const CourseDetail = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [course, setCourse] = useState(null)
  const [isPurchased, setIsPurchased] = useState(false)
  const [relatedCourses, setRelatedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails()
      if (isAuthenticated) {
        checkPurchaseStatus()
      }
    }
  }, [courseId, isAuthenticated])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getCourseDetails(courseId)
      setCourse(data)

      // Fetch related courses
      const relatedData = await userAPI.getPublishedCourses({
        category: data.category_id,
        limit: 4,
      })
      setRelatedCourses(relatedData.courses || relatedData.slice(0, 4))
    } catch (error) {
      console.error("Error fetching course details:", error)
      setError("Failed to load course details.")
    } finally {
      setLoading(false)
    }
  }

  const checkPurchaseStatus = async () => {
    try {
      const status = await userAPI.checkCoursePurchase(courseId)
      setIsPurchased(status.is_purchased)
    } catch (error) {
      console.error("Error checking purchase status:", error)
    }
  }

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    try {
      setPurchasing(true)
      await userAPI.purchaseCourse(courseId, "wallet")
      setIsPurchased(true)
      // Show success message or redirect to success page
      navigate("/payment-success", {
        state: {
          courseId: courseId,
          courseTitle: course.title,
        },
      })
    } catch (error) {
      console.error("Error purchasing course:", error)
      alert("Failed to purchase course. Please try again.")
    } finally {
      setPurchasing(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    try {
      await userAPI.addToCart(courseId)
      navigate("/cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Failed to add to cart. Please try again.")
    }
  }

  const formatPrice = (price) => {
    return `₹${price?.toFixed(2) || "0.00"}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <LoadingSpinner />
        <Footer />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The course you are looking for does not exist."}</p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Browse All Courses
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded">
                  {course.category?.name || "Photography"}
                </span>
                <span className="ml-2 text-sm text-gray-300">
                  by {course.instructor?.firstname} {course.instructor?.lastname}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4 leading-tight">{course.title}</h1>

              {course.subtitle && <p className="text-xl text-gray-200 mb-6">{course.subtitle}</p>}

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-cyan-400" />
                  <span>7 Weeks</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-cyan-400" />
                  <span>156 Students</span>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
                  <span>All levels</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
                  <span>20 Lessons</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-cyan-400" />
                  <span>3 Quizzes</span>
                </div>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
                <div className="relative">
                  <img
                    src={course.cover_image || "/placeholder.svg?height=200&width=400"}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {course.discount_price && course.discount_price < course.price ? (
                        <>
                          <span className="text-sm text-gray-500 line-through">{formatPrice(course.price)}</span>
                          <div className="text-2xl font-bold text-red-600">{formatPrice(course.discount_price)}</div>
                        </>
                      ) : (
                        <div className="text-2xl font-bold text-blue-600">{formatPrice(course.price)}</div>
                      )}
                    </div>
                    <button className="p-2 text-gray-400 hover:text-red-500">
                      <Heart className="w-6 h-6" />
                    </button>
                  </div>

                  {isPurchased ? (
                    <button
                      onClick={() => navigate(`/my-learning/${courseId}`)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium mb-3"
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handlePurchase}
                        disabled={purchasing}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
                      >
                        {purchasing ? "Processing..." : "Start Now"}
                      </button>
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-white border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-700 text-sm underline">
                      Other payment options
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseDetailTabs course={course} isPurchased={isPurchased} onPurchase={handlePurchase} />
          </div>
          <div className="lg:col-span-1">{/* This space can be used for additional course info or ads */}</div>
        </div>
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <div className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Others are also Viewing</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCourses.map((relatedCourse) => (
                <CourseCard key={relatedCourse.id} course={relatedCourse} />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default CourseDetail
