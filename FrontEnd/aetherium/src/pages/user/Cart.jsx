"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Trash2, Heart } from "lucide-react"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { userAPI } from "../../services/userApi"
import { useAuth } from "../../context/AuthContext"

const Cart = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    fetchCartItems()
  }, [isAuthenticated])

  const fetchCartItems = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getCart()
      setCartItems(data.items || [])
    } catch (error) {
      console.error("Error fetching cart:", error)
      setError("Failed to load cart items.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromCart = async (courseId) => {
    try {
      await userAPI.removeFromCart(courseId)
      setCartItems(cartItems.filter((item) => item.course.id !== courseId))
    } catch (error) {
      console.error("Error removing from cart:", error)
      alert("Failed to remove item from cart.")
    }
  }

  const handleMoveToWishlist = async (courseId) => {
    // Implement wishlist functionality
    console.log("Move to wishlist:", courseId)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.course.discount_price || item.course.price || 0
      return total + price
    }, 0)
  }

  const calculateTax = (subtotal) => {
    return subtotal * 0.18 // 18% GST
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    try {
      setProcessing(true)
      // For now, we'll purchase the first item in cart
      // In a real app, you'd handle multiple items
      const firstCourse = cartItems[0]
      await userAPI.purchaseCourse(firstCourse.course.id, "wallet")

      navigate("/payment-success", {
        state: {
          courseId: firstCourse.course.id,
          courseTitle: firstCourse.course.title,
        },
      })
    } catch (error) {
      console.error("Error during checkout:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setProcessing(false)
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

  const subtotal = calculateSubtotal()
  const tax = calculateTax(subtotal)
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">Your cart is empty</div>
            <p className="text-gray-400 mb-8">Add some courses to get started!</p>
            <Link to="/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div key={item.course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="flex">
                    <div className="w-48 h-32 flex-shrink-0">
                      <img
                        src={item.course.cover_image || "/placeholder.svg?height=128&width=192"}
                        alt={item.course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.course.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">
                            by {item.course.instructor?.firstname} {item.course.instructor?.lastname}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <button
                              onClick={() => handleMoveToWishlist(item.course.id)}
                              className="flex items-center text-blue-600 hover:text-blue-700"
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              Move to Wishlist
                            </button>
                            <button
                              onClick={() => handleRemoveFromCart(item.course.id)}
                              className="flex items-center text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          {item.course.discount_price && item.course.discount_price < item.course.price ? (
                            <>
                              <div className="text-lg font-bold text-red-600">
                                {formatPrice(item.course.discount_price)}
                              </div>
                              <div className="text-sm text-gray-500 line-through">{formatPrice(item.course.price)}</div>
                            </>
                          ) : (
                            <div className="text-lg font-bold text-blue-600">{formatPrice(item.course.price)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold text-blue-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={processing || cartItems.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : "Proceed to Checkout"}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">Secure checkout powered by wallet payment</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Cart
