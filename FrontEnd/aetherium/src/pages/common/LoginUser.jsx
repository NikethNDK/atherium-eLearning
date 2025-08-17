"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { authAPI } from "../../services/api"
import OTPModal from "../../components/common/OTPModal"

const LoginUser = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const [showOTPModal, setShowOTPModal] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      })
      console.log("This is the result log", result)

      if (result.success) {
        navigate("/user/dashboard")
      } else {
        // Check if error is about email verification
        if (result.error.includes("Email not verified") || result.error.includes("OTP sent")) {
          setPendingEmail(formData.email)
          setShowOTPModal(true)
          setError("")
        } else {
          setError(result.error)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    authAPI.googleLogin()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Image */}
          <div className="hidden lg:block">
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <img
                src="https://res.cloudinary.com/grand-canyon-university/image/fetch/w_750,h_564,c_fill,g_faces,q_auto/https://www.gcu.edu/sites/default/files/2025-01/students%20working.jpg"
                alt="Students learning"
                className="w-full h-96 object-cover rounded-2xl"
              />
              {/* <div className="absolute bottom-8 left-8">
                <h2 className="text-3xl font-bold mb-2 ml-3 text-black">Aetherium</h2>
                <p className="text-lg opacity-90">Lorem Ipsum is simply</p>
              </div> */}
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-8 text-white">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-cyan-400 mb-2">Welcome to Aetherium</h1>
                <div className="flex bg-purple-800 rounded-full p-1 mb-6">
                  <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-full font-semibold">
                    Login
                  </button>
                  <Link
                    to="/register"
                    className="flex-1 text-center py-2 px-4 rounded-full font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
                <p className="text-gray-300 text-sm">
                  Aetherium revolutionizing the way you learn
                </p>
              </div>

              {error && <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-cyan-400 text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your User name"
                    className="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-cyan-400 text-sm font-semibold mb-2">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your Password"
                      className="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-cyan-400">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-cyan-400 hover:underline">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <LoadingSpinner size="small" /> : "Login"}
                </button>

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex-1 bg-white text-gray-900 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🔍</span>
                    <span>Sign in with Google</span>
                  </button>
                  <Link
                    to="/login/instructor"
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-full font-semibold transition-colors text-center"
                  >
                    Login as Instructor
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* OTP Modal */}
        <OTPModal
          isOpen={showOTPModal}
          onClose={() => {
            setShowOTPModal(false)
            setPendingEmail("")
          }}
          email={pendingEmail}
          onSuccess={async () => {
            // After email verification, try to login again
            const result = await login({
              email: formData.email,
              password: formData.password,
            })
            if (result.success) {
              navigate("/user/dashboard")
            }
          }}
          title="Verify Your Email"
        />
      </div>

      <Footer />
    </div>
  )
}

export default LoginUser


