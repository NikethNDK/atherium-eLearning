"use client"

import { useEffect } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { CheckCircle } from "lucide-react"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"

const PaymentSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { courseId, courseTitle } = location.state || {}

  useEffect(() => {
    // If no course info is provided, redirect to courses
    if (!courseId) {
      navigate("/courses")
    }
  }, [courseId, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Thank you for your purchase. Your order has been processed successfully.</p>
          </div>

          {courseTitle && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Course purchased:</p>
              <p className="font-medium text-gray-900">{courseTitle}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to={`/my-learning/${courseId}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium block"
            >
              Start Course Now
            </Link>
            <Link
              to="/my-learning"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium block"
            >
              Go to My Learning
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default PaymentSuccess
