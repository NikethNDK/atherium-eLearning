"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { userAPI } from "../../services/userApi"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await userAPI.getWishlist()
      setWishlistItems(response)
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (courseId) => {
    setActionLoading(courseId)
    try {
      await userAPI.removeFromWishlist(courseId)
      setWishlistItems((prev) => prev.filter((item) => item.course.id !== courseId))
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddToCart = async (courseId) => {
    setActionLoading(courseId)
    try {
      await userAPI.addToCart(courseId)
      // Optionally remove from wishlist after adding to cart
      await handleRemoveFromWishlist(courseId)
    } catch (error) {
      console.error("Error adding to cart:", error)
      setActionLoading(null)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=160&width=240"
    if (imagePath.startsWith("http")) return imagePath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    return `${baseUrl}/${imagePath}`
  }

  const getPrice = (course) => {
    return course.discount_price || course.price
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-center sm:justify-start">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                {wishlistItems.length} course{wishlistItems.length !== 1 ? "s" : ""} in your wishlist
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Save courses you're interested in to your wishlist.</p>
            <div className="mt-6">
              <Link
                to="/courses"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Course Image */}
                <div className="relative">
                  <img
                    src={getImageUrl(item.course.cover_image) || "/placeholder.svg"}
                    alt={item.course.title}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFromWishlist(item.course.id)}
                    disabled={actionLoading === item.course.id}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    {actionLoading === item.course.id ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Course Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
                    {item.course.title}
                  </h3>

                  <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="truncate">
                      {item.course.instructor.firstname} {item.course.instructor.lastname}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.course.level}</span>
                    <span className="text-xs">
                      {item.course.duration} {item.course.duration_unit?.toLowerCase()}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 text-green-600 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      <span className="font-semibold text-lg text-gray-900">${getPrice(item.course)}</span>
                      {item.course.discount_price && (
                        <span className="ml-2 text-sm text-gray-500 line-through">${item.course.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(item.course.id)}
                      disabled={actionLoading === item.course.id}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 005 16h12M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"
                        />
                      </svg>
                      Add to Cart
                    </button>

                    <Link
                      to={`/courses/${item.course.id}`}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
