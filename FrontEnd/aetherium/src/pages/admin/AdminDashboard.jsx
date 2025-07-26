// "use client"

// import { useState, useEffect } from "react"
// import { useAuth } from "../../context/AuthContext"
// import { adminAPI } from "../../services/api"
// import LoadingSpinner from "../../components/common/LoadingSpinner"
// import { Users, BookOpen, DollarSign, Star, ShoppingCart } from "lucide-react"

// const AdminDashboard = () => {
//   const { user } = useAuth()
//   const [loading, setLoading] = useState(true)
//   const [stats, setStats] = useState({})
//   const [topInstructors, setTopInstructors] = useState([])

//   useEffect(() => {
//     fetchDashboardData()
//   }, [])

//   const fetchDashboardData = async () => {
//     try {
//       const [statsData, instructorsData] = await Promise.all([
//         adminAPI.getDashboardStats(),
//         adminAPI.getTopInstructors(),
        
//       ])
//       const response = await fetch('/admin/dashboard/revenue-analytics?days=30');
//       const data = await response.json();
//       console.log("Reveneu analytics api call data ")
//       setStats(statsData)
//       setTopInstructors(instructorsData)
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getRandomColor = (id) => {
//     const colors = [
//       "bg-blue-500",
//       "bg-green-500",
//       "bg-purple-500",
//       "bg-pink-500",
//       "bg-indigo-500",
//       "bg-yellow-500",
//       "bg-red-500",
//       "bg-cyan-500",
//       "bg-orange-500",
//     ]
//     return colors[id % colors.length]
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="large" />
//       </div>
//     )
//   }

//   return (
//     <div className="p-8">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstname || "Admin"}</h1>
//           <p className="text-gray-600">Admin Dashboard</p>
//         </div>

//         <div className="flex items-center space-x-4">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search anything here..."
//               className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
//           </div>
//           <div className="relative">
//             <span className="text-2xl cursor-pointer">🔔</span>
//             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
//               {stats.pending_courses || 0}
//             </span>
//           </div>
//           <div className="bg-purple-600 text-white p-4 rounded-lg">
//             <div className="flex items-center space-x-3 mb-4">
//               <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//                 <span className="text-white font-bold text-lg">
//                   {user?.firstname?.[0]}
//                   {user?.lastname?.[0]}
//                 </span>
//               </div>
//               <div>
//                 <h3 className="font-bold">
//                   {user?.firstname} {user?.lastname}
//                 </h3>
//                 <p className="text-sm opacity-90">Admin</p>
//               </div>
//             </div>
//             <div className="space-y-2 text-sm">
//               <h4 className="font-semibold">Total Revenue</h4>
//               <div className="flex justify-between">
//                 <span>This Year</span>
//                 <span>${(stats.total_revenue / 1000).toFixed(1)}K</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>This Month</span>
//                 <span>${((stats.total_revenue || 0) * 0.08).toFixed(0)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Today</span>
//                 <span>${((stats.total_revenue || 0) * 0.003).toFixed(0)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-6 gap-6 mb-8">
//         <div className="bg-blue-100 p-6 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Revenue</p>
//               <p className="text-2xl font-bold">₹{(stats.total_revenue / 1000).toFixed(1)}K</p>
//             </div>
//             <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
//               <DollarSign className="text-white" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-purple-100 p-6 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Average Rating</p>
//               <p className="text-2xl font-bold">{stats.average_rating}/5</p>
//             </div>
//             <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
//               <Star className="text-white" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-indigo-100 p-6 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Users</p>
//               <p className="text-2xl font-bold">{(stats.total_users / 1000).toFixed(1)}K</p>
//             </div>
//             <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
//               <Users className="text-white" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-pink-100 p-6 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Courses</p>
//               <p className="text-2xl font-bold">{(stats.total_courses / 1000).toFixed(1)}K</p>
//             </div>
//             <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
//               <BookOpen className="text-white" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-green-100 p-6 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Sales</p>
//               <p className="text-2xl font-bold">{(stats.total_sales / 1000).toFixed(1)}K</p>
//             </div>
//             <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
//               <ShoppingCart className="text-white" size={24} />
//             </div>
//           </div>
//         </div>

//         <div className="bg-orange-100 p-6 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Instructors</p>
//               <p className="text-2xl font-bold">{(stats.total_instructors / 1000).toFixed(1)}K</p>
//             </div>
//             <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
//               <Users className="text-white" size={24} />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-3 gap-8">
//         {/* Course Overview Chart */}
//         <div className="col-span-2 bg-white p-6 rounded-lg shadow">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-xl font-bold">Course Overview</h3>
//             <div className="flex items-center space-x-4 text-sm">
//               <div className="flex items-center">
//                 <span className="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>Course Visit
//               </div>
//               <div className="flex items-center">
//                 <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>Course Sale
//               </div>
//               <div className="flex items-center">
//                 <span className="w-3 h-3 bg-cyan-400 rounded-full mr-2"></span>Revenue
//               </div>
//             </div>
//           </div>
//           <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
//             <p className="text-gray-500">Chart placeholder - Course analytics would go here</p>
//           </div>

//           {/* Course Stats */}
//           <div className="mt-6 grid grid-cols-3 gap-4">
//             <div className="text-center">
//               <p className="text-2xl font-bold text-purple-600">{stats.total_courses}</p>
//               <p className="text-sm text-gray-600">Total Courses</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-orange-600">{stats.pending_courses}</p>
//               <p className="text-sm text-gray-600">Pending Review</p>
//             </div>
//             <div className="text-center">
//               <p className="text-2xl font-bold text-green-600">{stats.published_courses}</p>
//               <p className="text-sm text-gray-600">Published</p>
//             </div>
//           </div>
//         </div>

//         {/* Top Instructors */}
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h4 className="font-semibold mb-4">Top Instructors</h4>
//           <div className="space-y-4">
//             {topInstructors.slice(0, 8).map((instructor, index) => (
//               <div key={instructor.id} className="flex items-center space-x-3">
//                 <div className="flex items-center space-x-2 flex-1">
//                   <span className="text-xs text-gray-500 w-4">#{index + 1}</span>
//                   <div
//                     className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getRandomColor(instructor.id)}`}
//                   >
//                     {instructor.initials}
//                   </div>
//                   <div className="flex-1">
//                     <span className="text-sm font-medium">{instructor.name}</span>
//                     <p className="text-xs text-gray-500">{instructor.course_count} courses</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Popular Categories */}
//           <div className="mt-8">
//             <h4 className="font-semibold mb-4">Popular Categories</h4>
//             <div className="space-y-4">
//               <div className="flex items-center space-x-3">
//                 <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">
//                   UI
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-medium text-sm">UI/UX Design</p>
//                   <p className="text-xs text-gray-600">{Math.floor(stats.total_courses * 0.3)} + Courses</p>
//                 </div>
//                 <button className="text-blue-600 text-sm">View</button>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
//                   M
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-medium text-sm">Marketing</p>
//                   <p className="text-xs text-gray-600">{Math.floor(stats.total_courses * 0.2)} + Courses</p>
//                 </div>
//                 <button className="text-blue-600 text-sm">View</button>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
//                   W
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-medium text-sm">Web Development</p>
//                   <p className="text-xs text-gray-600">{Math.floor(stats.total_courses * 0.25)} + Courses</p>
//                 </div>
//                 <button className="text-blue-600 text-sm">View</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AdminDashboard

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { adminAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Users, BookOpen, DollarSign, Star, ShoppingCart, Award, Filter } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const AdminDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({})
  const [revenueFilter, setRevenueFilter] = useState("yearly")
  const [revenueData, setRevenueData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (revenueFilter) {
      fetchRevenueData()
    }
  }, [revenueFilter])

  // FIXED: Now using adminAPI.getComprehensiveDashboard() instead of direct fetch
  const fetchDashboardData = async () => {
    try {
      const data = await adminAPI.getComprehensiveDashboard()
      setDashboardData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // FIXED: Now using adminAPI.getRevenueAnalytics() instead of direct fetch
  const fetchRevenueData = async () => {
    try {
      let days = 365 // yearly by default
      if (revenueFilter === "monthly") days = 30
      if (revenueFilter === "daily") days = 7

      const data = await adminAPI.getRevenueAnalytics(days)

      // Process data based on filter
      if (revenueFilter === "yearly" || revenueFilter === "monthly") {
        setRevenueData(
          data.monthly_revenue?.map((item) => ({
            ...item,
            revenue: Number.parseFloat(item.revenue),
            period: new Date(item.month).toLocaleDateString("en-US", {
              month: "short",
              year: revenueFilter === "yearly" ? "numeric" : undefined,
            }),
          })) || [],
        )
      } else {
        setRevenueData(
          data.daily_revenue?.map((item) => ({
            ...item,
            revenue: Number.parseFloat(item.revenue),
            period: new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          })) || [],
        )
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    }
  }

  // Utility functions for formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num?.toString() || "0"
  }

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "NA"
    )
  }

  // Colors for charts
  const categoryColors = ["#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#6366F1", "#84CC16"]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Extract data from the comprehensive dashboard response
  const stats = dashboardData.basic_stats || {}
  const categoryAnalytics = dashboardData.category_analytics || []
  const instructorAnalytics = dashboardData.instructor_analytics || []
  const bestSellingCourses = dashboardData.best_selling_courses || []
  const topInstructors = dashboardData.top_instructors || []

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.firstname || "Admin"}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
                </svg>
              </div>
              {stats.pending_courses > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {stats.pending_courses}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_users || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_courses || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_sales || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.average_rating || 0}/5</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Instructors</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_instructors || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Award className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Revenue Analytics</h3>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
                <option value="yearly">Last 12 Months</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `₹${formatNumber(value)}`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Category Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryAnalytics.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {categoryAnalytics.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryAnalytics.slice(0, 4).map((category, index) => (
              <div key={category.category_id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[index] }}></div>
                  <span className="text-gray-700">{category.category_name}</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(category.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Best Selling Courses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Best Selling Courses</h3>
          <div className="space-y-4">
            {bestSellingCourses.slice(0, 5).map((course, index) => (
              <div key={course.course_id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                  <p className="text-xs text-gray-500">{course.instructor_name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-600">{course.sales_count} sales</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-medium text-green-600">{formatCurrency(course.revenue)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={12} className="text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">{course.avg_rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Instructors */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Instructors</h3>
          <div className="space-y-4">
            {topInstructors.slice(0, 5).map((instructor, index) => (
              <div key={instructor.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm`}
                    style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                  >
                    {instructor.initials}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{instructor.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-600">{instructor.course_count} courses</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">{instructor.student_count} students</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{formatCurrency(instructor.total_revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Status Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Course Status</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Published</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{stats.published_courses || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats.total_courses ? Math.round((stats.published_courses / stats.total_courses) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Pending Review</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{stats.pending_courses || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats.total_courses ? Math.round((stats.pending_courses / stats.total_courses) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Total Courses</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{stats.total_courses || 0}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Admin Wallet</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(stats.admin_wallet_balance || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
