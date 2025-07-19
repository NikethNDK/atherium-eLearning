"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { userAPI } from "../../services/userApi"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import Header from '../../components/common/Header'
const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [page])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getOrderHistory(page)
      
      if (page === 1) {
        setOrders(response)
      } else {
        setOrders((prev) => [...prev, ...response])
      }
      
      // Assuming 10 items per page (matching the limit in API)
      setHasMore(response.length === 10)
      
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=80&width=120"
    if (imagePath.startsWith("http")) return imagePath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    return `${baseUrl}/${imagePath}`
  }

  const formatAmount = (amount) => {
    const numericAmount = parseFloat(amount)
    return `₹${numericAmount.toFixed(2)}`
  }

  if (initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      < Header />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order History</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            View all your course purchases
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-600">
              Start learning by purchasing your first course.
            </p>
            <div className="mt-6">
              <Link
                to="/courses"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#2a2b4a] rounded-lg shadow-sm border border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                    {/* Course Info */}
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-8 flex-1">
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={getImageUrl(order.course.cover_image)}
                          alt={order.course.title}
                          className="w-full max-w-xs sm:w-32 h-20 object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left px-6">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {order.course.title}
                        </h3>
                        <p className="text-sm text-gray-300 mb-2">
                          {order.course.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            {order.course.instructor.firstname}{" "}
                            {order.course.instructor.lastname}
                          </div>
                          {order.course.category && (
                            <div className="flex items-center">
                              <svg
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                              {order.course.category.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex-shrink-0 text-center lg:text-right">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center lg:justify-end text-lg font-semibold text-white">
                          {formatAmount(order.total_amount || order.amount)}
                        </div>

                        <div className="flex items-center justify-center lg:justify-end text-sm text-gray-400">
                          {/* <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg> */}
                          {formatDate(order.purchased_at)}
                        </div>

                        <div className="text-sm text-gray-400 capitalize">
                          {order.payment_method.toLowerCase()}
                        </div>

                        <div className="text-xs text-gray-500">
                          Order #{order.transaction_id?.slice(-8) || order.id}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/my-learning/${order.course.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      Continue Learning
                      <svg
                        className="ml-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>

                    <Link
                      to={`/courses/${order.course.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-white bg-transparent hover:bg-gray-700 transition-colors"
                    >
                      View Course Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-gray-600 shadow-sm text-base font-medium rounded-md text-white bg-transparent hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? <LoadingSpinner size="small" /> : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistory