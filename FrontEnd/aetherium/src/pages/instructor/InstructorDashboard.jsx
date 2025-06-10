"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const InstructorDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex">
        <div className="w-64 bg-[#1a1b3a] text-white min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-[#1a1b3a] font-bold">AE</span>
              </div>
              <span className="text-lg font-bold">AETHERIUM</span>
            </div>

            <nav className="space-y-2">
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-purple-600">
                <span>📊</span>
                <span>Dashboard</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700">
                <span>➕</span>
                <span>Create New Course</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700">
                <span>📚</span>
                <span>My Courses</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700">
                <span>💰</span>
                <span>Earning</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700">
                <span>💬</span>
                <span>Message</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-auto">3</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700">
                <span>⚙️</span>
                <span>Settings</span>
              </a>
            </nav>

            <div className="absolute bottom-6 left-6">
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700">
                <span>🚪</span>
                <span>Sign-out</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hello, {user?.title || "Instructor"}</h1>
              <p className="text-gray-600">Manage your courses</p>
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
                  3
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <img src="/placeholder.svg?height=40&width=40" alt="Profile" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold">{user?.title || "Instructor"}</p>
                  <p className="text-sm text-gray-600">{user?.designation || "UI/UX Designer"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">$168.2</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold">4.8/5</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">⭐</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Student</p>
                  <p className="text-2xl font-bold">5,622</p>
                </div>
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-pink-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Course</p>
                  <p className="text-2xl font-bold">20</p>
                </div>
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📚</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Course Overview Chart */}
            <div className="col-span-2 bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Course Overview</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart placeholder - Revenue analytics would go here</p>
              </div>

              {/* Weekly Sales Stats */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4">Weekly Sales Stats</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold">
                        P
                      </div>
                      <div>
                        <p className="font-medium">UI/UX Prototyping with Proto.io</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">10 Sales</p>
                      <p className="font-semibold text-green-600">$160.5</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                        📊
                      </div>
                      <div>
                        <p className="font-medium">How to Make UX Case Study for Beginner</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">32 Sales</p>
                      <p className="font-semibold text-green-600">$285</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                        🔍
                      </div>
                      <div>
                        <p className="font-medium">How to Conduct User Research from Scratch</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">12 Sales</p>
                      <p className="font-semibold text-green-600">$109</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center mb-4">
                  <img
                    src="/placeholder.svg?height=80&width=80"
                    alt="Profile"
                    className="w-20 h-20 rounded-full mx-auto mb-3"
                  />
                  <h3 className="font-bold">{user?.title || "Instructor"}</h3>
                  <p className="text-sm text-gray-600">{user?.designation || "UI/UX Designer"}</p>
                </div>

                <div className="bg-purple-600 text-white p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Total Earnings</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span>Today Earning</span>
                    <span>$19,010</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Pending</span>
                    <span>$64</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span>In Review</span>
                    <span>$80</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span>Available</span>
                    <span>$178</span>
                  </div>
                  <button className="w-full bg-white text-purple-600 py-2 rounded-lg font-semibold">Withdraw</button>
                </div>
              </div>

              {/* Popular Courses */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-semibold mb-4">Popular Courses</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">
                      UI
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">UI/UX Design</p>
                      <p className="text-xs text-gray-600">30 + Courses</p>
                    </div>
                    <button className="text-blue-600 text-sm">View Course</button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Marketing</p>
                      <p className="text-xs text-gray-600">20 + Courses</p>
                    </div>
                    <button className="text-blue-600 text-sm">View Course</button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                      W
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Web Development</p>
                      <p className="text-xs text-gray-600">20 + Courses</p>
                    </div>
                    <button className="text-blue-600 text-sm">View Course</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorDashboard
