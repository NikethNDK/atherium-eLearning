import Header from "../../components/common/Header"
import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { authAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const UserProfile = () => {
  const { user, checkAuthStatus } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [file, setFile] = useState(null)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    personal_website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    whatsapp: "",
    youtube: "",
    title: "",
    designation: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phone_number || "",
        dateOfBirth: user.date_of_birth ? user.date_of_birth.split("T")[0] : "",
        personal_website: user.personal_website || "",
        facebook: user.facebook || "",
        instagram: user.instagram || "",
        linkedin: user.linkedin || "",
        whatsapp: user.whatsapp || "",
        youtube: user.youtube || "",
        title: user.title || "",
        designation: user.designation || "",
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 1_000_000) {
        setError("Image file size should be under 1MB")
        console.log("File size validation failed:", selectedFile.size)
        return
      }
      if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
        setError("Invalid file type. Only JPEG or PNG files are allowed")
        console.log("File type validation failed:", selectedFile.type)
        return
      }
      console.log("File selected:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      })
      setFile(selectedFile)
      setError("")
    } else {
      console.log("No file selected")
      setFile(null)
    }
  }

  const validateForm = () => {
    // Phone number: 10 digits
    if (formData.phoneNumber) {
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(formData.phoneNumber)) {
        return "Phone number must be exactly 10 digits."
      }
    }

    // WhatsApp: 10 digits
    if (formData.whatsapp) {
      const whatsappRegex = /^\d{10}$/
      if (!whatsappRegex.test(formData.whatsapp)) {
        return "WhatsApp number must be exactly 10 digits."
      }
    }

    // Username: Alphanumeric
    if (formData.username) {
      const usernameRegex = /^[a-zA-Z0-9]+$/
      if (!usernameRegex.test(formData.username)) {
        return "Username must be alphanumeric."
      }
    }

    // Title: Letters and spaces only, non-empty
    if (formData.title) {
      const titleRegex = /^[a-zA-Z\s]+$/
      if (!titleRegex.test(formData.title)) {
        return "Title must contain only letters and spaces."
      }
    }

    // URLs: Valid URL format
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    const urlFields = ["personal_website", "facebook", "instagram", "linkedin", "youtube"]
    for (const field of urlFields) {
      if (formData[field]) {
        if (!urlRegex.test(formData[field])) {
          return `${field.charAt(0).toUpperCase() + field.slice(1)} must be a valid URL.`
        }
      }
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validate form data
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    let phoneNumber = null
    if (formData.phoneNumber) {
      phoneNumber = parseInt(formData.phoneNumber)
    }

    const payload = {
      firstname: formData.firstname || null,
      lastname: formData.lastname || null,
      username: formData.username || null,
      phone_number: phoneNumber,
      date_of_birth: formData.dateOfBirth || null,
      personal_website: formData.personal_website || null,
      facebook: formData.facebook || null,
      instagram: formData.instagram || null,
      linkedin: formData.linkedin || null,
      whatsapp: formData.whatsapp || null,
      youtube: formData.youtube || null,
      title: formData.title || null,
      designation: formData.designation || null,
    }
    console.log("Sending payload to /auth/bio:", payload)

    try {
      const response = await authAPI.updateBio(payload)
      console.log("Bio update response:", response)
      await checkAuthStatus()
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile. Please try again.")
      console.error("Update bio error:", err)
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
      await authAPI.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      })
      setSuccess("Password changed successfully!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to change password")
      console.error("Change password error:", err.response?.data || err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError("No file selected")
      console.error("No file selected for upload")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      console.log("Uploading file:", {
        name: file.name,
        size: file.size,
        type: file.type,
      })
      await authAPI.uploadProfilePicture(formData)
      await checkAuthStatus()
      setSuccess("Profile picture uploaded successfully!")
      setFile(null)
      document.getElementById("fileInput").value = ""
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload profile picture")
      console.error("Upload profile picture error:", err.response?.data || err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-600">Personal Information</h1>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last name</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  disabled
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
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Your Phone number..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Your title or profession"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
                <textarea
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Your biography"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Website</label>
                <div className="flex items-center">
                  <span className="mr-3">🌐</span>
                  <input
                    type="url"
                    name="personal_website"
                    value={formData.personal_website}
                    onChange={handleChange}
                    placeholder="Personal website or portfolio URL..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <div className="flex items-center">
                  <span className="mr-3">👤</span>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="Facebook URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <div className="flex items-center">
                  <span className="mr-3">📷</span>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="Instagram URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <div className="flex items-center">
                  <span className="mr-3">💼</span>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="LinkedIn URL"
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
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="WhatsApp number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                <div className="flex items-center">
                  <span className="mr-3">📺</span>
                  <input
                    type="url"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleChange}
                    placeholder="YouTube URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div> */}
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size="small" /> : "Save Changes"}
              </button>
            </div>
          </form>

          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Profile Photo</h2>
            </div>
            <div className="flex items-center space-x-6">
              <div className="relative">


                <img
                  src={`${API_BASE_URL}/${user.profile_picture}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <input
                  type="file"
                  id="fileInput"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="fileInput" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </label>
              </div>
              <div>
                <button
                  onClick={handleFileSubmit}
                  disabled={loading || !file}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Photo
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Image size must be under 1MB and should be a JPEG or PNG file.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Current Password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="New Password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm New Password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size="small" /> : "Save Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile