"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const InstructorSettings = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Account Settings Form
  const [accountData, setAccountData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phoneNumber: "",
    title: "",
    biography: "",
  })

  // Social Profile Form
  const [socialData, setSocialData] = useState({
    personalWebsite: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    whatsapp: "",
    youtube: "",
  })

  // Password Change Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Notifications
  const [notifications, setNotifications] = useState({
    courseComments: false,
    reviewWritten: true,
    lectureCommented: false,
    lectureDownloaded: true,
    replyToComment: true,
    dailyVisits: false,
    lectureAttached: true,
  })

  useEffect(() => {
    if (user) {
      setAccountData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        phoneNumber: user.phoneNumber || "",
        title: user.title || "",
        biography: user.designation || "",
      })
    }
  }, [user])

  const handleAccountChange = (e) => {
    const { name, value } = e.target
    setAccountData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSocialChange = (e) => {
    const { name, value } = e.target
    setSocialData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotifications((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAccountSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Add API call to update account settings
      setSuccess("Account settings updated successfully!")
    } catch (err) {
      setError("Failed to update account settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Add API call to update social profile
      setSuccess("Social profile updated successfully!")
    } catch (err) {
      setError("Failed to update social profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Add API call to change password
      setSuccess("Password changed successfully!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      setError("Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationsSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Add API call to update notifications
      setSuccess("Notification settings updated successfully!")
    } catch (err) {
      setError("Failed to update notification settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-gray-600">Good Morning</p>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="text-2xl cursor-pointer">🔔</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/placeholder.svg?height=40&width=40" alt="Profile" className="w-10 h-10 rounded-full" />
          </div>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">{success}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Account Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>

            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    value={accountData.firstName}
                    onChange={handleAccountChange}
                    placeholder="First name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={accountData.lastName}
                    onChange={handleAccountChange}
                    placeholder="Last name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={accountData.username}
                  onChange={handleAccountChange}
                  placeholder="Enter your username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex">
                  <select className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>+91</option>
                  </select>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={accountData.phoneNumber}
                    onChange={handleAccountChange}
                    placeholder="Your Phone number..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={accountData.title}
                  onChange={handleAccountChange}
                  placeholder="Your title, profession or small biography"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-right text-sm text-gray-500 mt-1">{accountData.title.length}/50</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
                <textarea
                  name="biography"
                  value={accountData.biography}
                  onChange={handleAccountChange}
                  placeholder="Your title, profession or small biography"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="flex justify-end">
                <div className="w-32 h-32 bg-pink-100 rounded-lg flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=128&width=128"
                    alt="Profile"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size="small" /> : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Social Profile */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Social Profile</h2>

            <form onSubmit={handleSocialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Website</label>
                <div className="flex items-center">
                  <span className="mr-3">🌐</span>
                  <input
                    type="url"
                    name="personalWebsite"
                    value={socialData.personalWebsite}
                    onChange={handleSocialChange}
                    placeholder="Personal website or portfolio url..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <div className="flex items-center">
                    <span className="mr-3">👤</span>
                    <input
                      type="text"
                      name="facebook"
                      value={socialData.facebook}
                      onChange={handleSocialChange}
                      placeholder="Username"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <div className="flex items-center">
                    <span className="mr-3">📷</span>
                    <input
                      type="text"
                      name="instagram"
                      value={socialData.instagram}
                      onChange={handleSocialChange}
                      placeholder="Username"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <div className="flex items-center">
                    <span className="mr-3">💼</span>
                    <input
                      type="text"
                      name="linkedin"
                      value={socialData.linkedin}
                      onChange={handleSocialChange}
                      placeholder="Username"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <div className="flex items-center">
                    <span className="mr-3">📱</span>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={socialData.whatsapp}
                      onChange={handleSocialChange}
                      placeholder="Phone number"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                  <div className="flex items-center">
                    <span className="mr-3">📺</span>
                    <input
                      type="text"
                      name="youtube"
                      value={socialData.youtube}
                      onChange={handleSocialChange}
                      placeholder="Username"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size="small" /> : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>

            <form onSubmit={handleNotificationsSubmit} className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="courseComments"
                    checked={notifications.courseComments}
                    onChange={handleNotificationChange}
                    className="mr-3"
                  />
                  <span>I want to know who buy my course</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="reviewWritten"
                    checked={notifications.reviewWritten}
                    onChange={handleNotificationChange}
                    className="mr-3"
                  />
                  <span>I want to know who write a review on my course</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="lectureCommented"
                    checked={notifications.lectureCommented}
                    onChange={handleNotificationChange}
                    className="mr-3"
                  />
                  <span>I want to know who commented on my lecture</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="lectureDownloaded"
                    checked={notifications.lectureDownloaded}
                    onChange={handleNotificationChange}
                    className="mr-3"
                  />
                  <span>I want to know who download my lecture notes</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="replyToComment"
                    checked={notifications.replyToComment}
                    onChange={handleNotificationChange}
                    className="mr-3"
                  />
                  <span>I want to know who replied on my comment</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="dailyVisits"
                    checked={notifications.dailyVisits}
                    onChange={handleNotificationChange}
                    className="mr-3"
                  />
                  <span>I want to know daily how many people visited my profile</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="lectureAttached"
                    checked={notifications.lectureAttached}
                    onChange={handleNotificationChange}
                    className="mr-3"
                  />
                  <span>I want to know who download my lecture attach file</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size="small" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Change Password */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Change password</h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 cursor-pointer">👁️</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 cursor-pointer">👁️</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 cursor-pointer">👁️</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size="small" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorSettings
