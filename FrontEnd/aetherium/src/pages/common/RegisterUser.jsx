"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import OTPModal from "../../components/common/OTPModal"

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { register } = useAuth()
  const navigate = useNavigate()
  const [showOTPModal, setShowOTPModal] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        role_id: 1, // User role
      })

      if (result.success) {
        setSuccess("Registration successful! Please verify your email.")
        setShowOTPModal(true)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
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
                src="/images/register-bg.jpg"
                alt="Students learning"
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="absolute bottom-8 left-8">
                <h2 className="text-3xl font-bold mb-2">Lorem Ipsum is simply</h2>
                <p className="text-lg opacity-90">Lorem Ipsum is simply</p>
              </div>
            </div>
          </div>

          {/* Right side - Register Form */}
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-8 text-white">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-cyan-400 mb-2">Welcome to Aetherium</h1>
                <div className="flex bg-purple-800 rounded-full p-1 mb-6">
                  <Link
                    to="/login"
                    className="flex-1 text-center py-2 px-4 rounded-full font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Login
                  </Link>
                  <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-full font-semibold">
                    Register
                  </button>
                </div>
              </div>

              {error && <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">{error}</div>}

              {success && <div className="bg-green-500 text-white p-3 rounded-lg mb-4 text-sm">{success}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-cyan-400 text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-cyan-400 text-sm font-semibold mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your user name"
                    className="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-cyan-400 text-sm font-semibold mb-2">Password</label>
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

                <div>
                  <label className="block text-cyan-400 text-sm font-semibold mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your Password"
                    className="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <LoadingSpinner size="small" /> : "Register"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-300 text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-cyan-400 hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* OTP Modal */}
        <OTPModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          email={formData.email}
          onSuccess={() => {
            setSuccess("Email verified successfully! Redirecting to login...")
            setTimeout(() => {
              navigate("/login")
            }, 2000)
          }}
          title="Verify Your Email"
        />
      </div>

      <Footer />
    </div>
  )
}

export default RegisterUser
