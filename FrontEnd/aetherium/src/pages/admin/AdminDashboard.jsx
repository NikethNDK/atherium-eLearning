"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { adminAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Users, BookOpen, DollarSign, Star, ShoppingCart } from "lucide-react"

const AdminDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [topInstructors, setTopInstructors] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsData, instructorsData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getTopInstructors(),
      ])
      setStats(statsData)
      setTopInstructors(instructorsData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRandomColor = (id) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-cyan-500",
      "bg-orange-500",
    ]
    return colors[id % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstname || "Admin"}</h1>
          <p className="text-gray-600">Admin Dashboard</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search anything here..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          <div className="relative">
            <span className="text-2xl cursor-pointer">🔔</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {stats.pending_courses || 0}
            </span>
          </div>
          <div className="bg-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.firstname?.[0]}
                  {user?.lastname?.[0]}
                </span>
              </div>
              <div>
                <h3 className="font-bold">
                  {user?.firstname} {user?.lastname}
                </h3>
                <p className="text-sm opacity-90">Admin</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold">Total Revenue</h4>
              <div className="flex justify-between">
                <span>This Year</span>
                <span>${(stats.total_revenue / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between">
                <span>This Month</span>
                <span>${((stats.total_revenue || 0) * 0.08).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Today</span>
                <span>${((stats.total_revenue || 0) * 0.003).toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-6 mb-8">
        <div className="bg-blue-100 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">${(stats.total_revenue / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-purple-100 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold">{stats.average_rating}/5</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Star className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-indigo-100 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{(stats.total_users / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-pink-100 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold">{(stats.total_courses / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-green-100 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold">{(stats.total_sales / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-orange-100 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Instructors</p>
              <p className="text-2xl font-bold">{(stats.total_instructors / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Course Overview Chart */}
        <div className="col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Course Overview</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>Course Visit
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>Course Sale
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-cyan-400 rounded-full mr-2"></span>Revenue
              </div>
            </div>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - Course analytics would go here</p>
          </div>

          {/* Course Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.total_courses}</p>
              <p className="text-sm text-gray-600">Total Courses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pending_courses}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.published_courses}</p>
              <p className="text-sm text-gray-600">Published</p>
            </div>
          </div>
        </div>

        {/* Top Instructors */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold mb-4">Top Instructors</h4>
          <div className="space-y-4">
            {topInstructors.slice(0, 8).map((instructor, index) => (
              <div key={instructor.id} className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-xs text-gray-500 w-4">#{index + 1}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getRandomColor(instructor.id)}`}
                  >
                    {instructor.initials}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{instructor.name}</span>
                    <p className="text-xs text-gray-500">{instructor.course_count} courses</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Popular Categories */}
          <div className="mt-8">
            <h4 className="font-semibold mb-4">Popular Categories</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">
                  UI
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">UI/UX Design</p>
                  <p className="text-xs text-gray-600">{Math.floor(stats.total_courses * 0.3)} + Courses</p>
                </div>
                <button className="text-blue-600 text-sm">View</button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Marketing</p>
                  <p className="text-xs text-gray-600">{Math.floor(stats.total_courses * 0.2)} + Courses</p>
                </div>
                <button className="text-blue-600 text-sm">View</button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                  W
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Web Development</p>
                  <p className="text-xs text-gray-600">{Math.floor(stats.total_courses * 0.25)} + Courses</p>
                </div>
                <button className="text-blue-600 text-sm">View</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
