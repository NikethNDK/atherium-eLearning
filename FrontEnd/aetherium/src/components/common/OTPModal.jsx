"use client"

import { useState, useEffect } from "react"
import { authAPI } from "../../services/api"
import LoadingSpinner from "./LoadingSpinner"

const OTPModal = ({ isOpen, onClose, email, onSuccess, title = "Email Verification" }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false)

  // Timer effect
  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", "", "", ""])
      setError("")
      setSuccess("")
      setTimeLeft(300)
      setCanResend(false)
    }
  }, [isOpen])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setLoading(true)
    setError("")

    try {
      await authAPI.verifyOTP(email, otpString)
      setSuccess("Email verified successfully!")
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setError("")

    try {
      await authAPI.sendOTP(email)
      setSuccess("OTP sent successfully!")
      setTimeLeft(300)
      setCanResend(false)
      setOtp(["", "", "", "", "", ""])
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send OTP")
    } finally {
      setResendLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">
            We've sent a verification code to
            <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter verification code</label>
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-cyan-400 focus:outline-none"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">
              Code expires in <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-sm text-red-600 font-semibold">Code has expired</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.join("").length !== 6}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <LoadingSpinner size="small" /> : "Verify Code"}
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleResendOTP}
              disabled={!canResend || resendLoading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? <LoadingSpinner size="small" /> : "Resend OTP"}
            </button>

            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Help text */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Didn't receive the code? Check your spam folder or{" "}
            <button
              onClick={handleResendOTP}
              disabled={!canResend || resendLoading}
              className="text-cyan-600 hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              resend
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OTPModal
