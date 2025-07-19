import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const InstructorSettings = () => {
  const { user, checkAuthStatus } = useAuth(); // Use checkAuthStatus instead of setUser
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [file, setFile] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
  // Account Settings Form
  const [accountData, setAccountData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    phoneNumber: "",
    title: "",
    designation: "",
  });

  // Social Profile Form
  const [socialData, setSocialData] = useState({
    personalWebsite: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    whatsapp: "",
    youtube: "",
  });

  // Password Change Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    courseComments: false,
    reviewWritten: true,
    lectureCommented: false,
    lectureDownloaded: true,
    replyToComment: true,
    dailyVisits: false,
    lectureAttached: true,
  });

  useEffect(() => {
    console.log("user details",user)
    if (user) {
      setAccountData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        username: user.username || "",
        phoneNumber: user.phone_number || "",
        title: user.title || "",
        designation: user.designation || "",
      });
      setSocialData({
        personalWebsite: user.personal_website || "",
        facebook: user.facebook || "",
        instagram: user.instagram || "",
        linkedin: user.linkedin || "",
        whatsapp: user.whatsapp || "",
        youtube: user.youtube || "",
      });
    }
  }, [user]);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSocialData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 1_000_000) {
        setError("Image file size should be under 1MB");
        console.log("File size validation failed:", selectedFile.size);
        return;
      }
      if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
        setError("Invalid file type. Only JPEG or PNG files are allowed");
        console.log("File type validation failed:", selectedFile.type);
        return;
      }
      console.log("File selected:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      });
      setFile(selectedFile);
      setError("");
    } else {
      console.log("No file selected");
      setFile(null);
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  // Add validation function similar to UserProfile
  const validateAccountForm = () => {
    // Phone number: 10 digits
    if (accountData.phoneNumber) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(accountData.phoneNumber)) {
        return "Phone number must be exactly 10 digits.";
      }
    }

    // Username: Alphanumeric
    if (accountData.username) {
      const usernameRegex = /^[a-zA-Z0-9]+$/;
      if (!usernameRegex.test(accountData.username)) {
        return "Username must be alphanumeric.";
      }
    }

    // Title: Letters and spaces only, non-empty
    if (accountData.title) {
      const titleRegex = /^[a-zA-Z\s]+$/;
      if (!titleRegex.test(accountData.title)) {
        return "Title must contain only letters and spaces.";
      }
    }

    return null;
  };

  const validateSocialForm = () => {
    // WhatsApp: 10 digits
    if (socialData.whatsapp) {
      const whatsappRegex = /^\d{10}$/;
      if (!whatsappRegex.test(socialData.whatsapp)) {
        return "WhatsApp number must be exactly 10 digits.";
      }
    }

    // URLs: Valid URL format
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const urlFields = [
      { field: "personalWebsite", label: "Personal Website" },
      { field: "facebook", label: "Facebook" },
      { field: "instagram", label: "Instagram" },
      { field: "linkedin", label: "LinkedIn" },
      { field: "youtube", label: "YouTube" },
    ];

    for (const { field, label } of urlFields) {
      if (socialData[field]) {
        if (!urlRegex.test(socialData[field])) {
          return `${label} must be a valid URL.`;
        }
      }
    }

    return null;
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate form data
    const validationError = validateAccountForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    let phoneNumber = null;
    if (accountData.phoneNumber) {
      phoneNumber = parseInt(accountData.phoneNumber);
    }

    const payload = {
      firstname: accountData.firstname || null,
      lastname: accountData.lastname || null,
      username: accountData.username || null,
      phone_number: phoneNumber,
      title: accountData.title || null,
      designation: accountData.designation || null,
    };

    console.log("Sending account payload to /auth/bio:", payload);

    try {
      const response = await authAPI.updateBio(payload);
      console.log("Account update response:", response);
      await checkAuthStatus(); // Use checkAuthStatus to refresh user data
      setSuccess("Account settings updated successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update account settings");
      console.error("Update account error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate form data
    const validationError = validateSocialForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const payload = {
      personal_website: socialData.personalWebsite || null,
      facebook: socialData.facebook || null,
      instagram: socialData.instagram || null,
      linkedin: socialData.linkedin || null,
      whatsapp: socialData.whatsapp || null,
      youtube: socialData.youtube || null,
    };

    console.log("Sending social payload to /auth/bio:", payload);

    try {
      const response = await authAPI.updateBio(payload);
      console.log("Social update response:", response);
      await checkAuthStatus(); // Use checkAuthStatus to refresh user data
      setSuccess("Social profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update social profile");
      console.error("Update social error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authAPI.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      });
      setSuccess("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to change password");
      console.error("Change password error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("No file selected");
      console.error("No file selected for upload");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      console.log("Uploading file:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      await authAPI.uploadProfilePicture(formData);
      await checkAuthStatus(); // Use checkAuthStatus to refresh user data
      setSuccess("Profile picture uploaded successfully!");
      setFile(null);
      document.getElementById("fileInput").value = "";
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload profile picture");
      console.error("Upload profile picture error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Implement backend endpoint for notifications
      setSuccess("Notification settings updated successfully!");
    } catch (err) {
      setError("Failed to update notification settings");
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!user) {
    return <div>Please log in to view your settings.</div>;
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
            {/* <span className="text-2xl cursor-pointer">🔔</span> */}
          </div>
          {/* <div className="flex items-center space-x-3">
            <img
              src={
                user?.profile_picture
                  ? `/uploads/profile_pictures/${user.profile_picture.split('/').pop()}`
                  : "/placeholder.svg?height=40&width=40"
              }
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div> */}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
      )}

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
                    name="firstname"
                    value={accountData.firstname}
                    onChange={handleAccountChange}
                    placeholder="First name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="lastname"
                    value={accountData.lastname}
                    onChange={handleAccountChange}
                    placeholder="Last name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={accountData.username}
                  onChange={handleAccountChange}
                  placeholder="Enter your username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}
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
                  maxLength="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-right text-sm text-gray-500 mt-1">{accountData.title.length}/50</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
                <textarea
                  name="designation"
                  value={accountData.designation}
                  onChange={handleAccountChange}
                  placeholder="Your title, profession or small biography"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    // src={
                    //   user?.profile_picture
                    //     ? `/uploads/profile_pictures/${user.profile_picture.split('/').pop()}`
                    //     : "/placeholder.svg?height=128&width=128"
                    // }
                    src={`${API_BASE_URL}/${user.profile_picture}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileInput"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </label>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleFileSubmit}
                    disabled={loading || !file}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <LoadingSpinner size="small" /> : "Upload Photo"}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Image size must be under 1MB and should be a JPEG or PNG file.
                  </p>
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
                      type="url"
                      name="facebook"
                      value={socialData.facebook}
                      onChange={handleSocialChange}
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
                      value={socialData.instagram}
                      onChange={handleSocialChange}
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
                      value={socialData.linkedin}
                      onChange={handleSocialChange}
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
                      value={socialData.whatsapp}
                      onChange={handleSocialChange}
                      placeholder="WhatsApp number"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                  <div className="flex items-center">
                    <span className="mr-3">📺</span>
                    <input
                      type="url"
                      name="youtube"
                      value={socialData.youtube}
                      onChange={handleSocialChange}
                      placeholder="YouTube URL"
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
                    placeholder="Current Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
                    placeholder="New Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
                    required
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
  );
};

export default InstructorSettings;