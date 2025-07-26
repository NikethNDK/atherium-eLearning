// import { useState, useEffect } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { instructorAPI } from "../../services/instructorApi"
// import InstructorCourseCard from "../../components/course/InstructorCourseCard"
// import LoadingSpinner from "../../components/common/LoadingSpinner"

// const InstructorDashboard = () => {
//   const [courses, setCourses] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [stats, setStats] = useState({
//     totalCourses: 0,
//     totalStudents: 0,
//     totalRevenue: 0,
//     pendingReviews: 0,
//   })
//   const [activeTab, setActiveTab] = useState("all")
//   const navigate = useNavigate()

//   useEffect(() => {
//     fetchDashboardData()
//   }, [activeTab])

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true)
//       const [coursesData, statsData] = await Promise.all([
//         instructorAPI.getMyCourses(1, activeTab === "all" ? null : activeTab),
//         instructorAPI.getDashboardStats().catch(() => ({
//           totalCourses: 0,
//           totalStudents: 0,
//           totalRevenue: 0,
//           pendingReviews: 0,
//         })),
//       ])

//       setCourses(coursesData)
//       setStats(statsData)
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleEditCourse = (courseId) => {
//     navigate(`/instructor/courses/${courseId}/edit`)
//   }

//   const tabs = [
//     { key: "all", label: "All Courses", count: courses.length },
//     { key: "verified", label: "Published", count: courses.filter((c) => c.verification_status === "verified").length },
//     { key: "pending", label: "Pending", count: courses.filter((c) => c.verification_status === "pending").length },
//     { key: "rejected", label: "Rejected", count: courses.filter((c) => c.verification_status === "rejected").length },
//   ]

//   const filteredCourses =
//     activeTab === "all" ? courses : courses.filter((course) => course.verification_status === activeTab)

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
//               <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
//                 Manage your courses and track performance
//               </p>
//             </div>
//             <div className="mt-4 sm:mt-0">
//               <Link
//                 to="/instructor/courses/create"
//                 className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
//               >
//                 <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                 </svg>
//                 Create New Course
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3 sm:ml-5 w-0 flex-1">
//                 <dl>
//                   <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Courses</dt>
//                   <dd className="text-lg sm:text-xl font-semibold text-gray-900">{stats.totalCourses}</dd>
//                 </dl>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="h-6 w-6 sm:h-8 sm:w-8 text-green-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3 sm:ml-5 w-0 flex-1">
//                 <dl>
//                   <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Students</dt>
//                   <dd className="text-lg sm:text-xl font-semibold text-gray-900">{stats.totalStudents}</dd>
//                 </dl>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3 sm:ml-5 w-0 flex-1">
//                 <dl>
//                   <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
//                   <dd className="text-lg sm:text-xl font-semibold text-gray-900">₹{stats.totalRevenue}</dd>
//                 </dl>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3 sm:ml-5 w-0 flex-1">
//                 <dl>
//                   <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Pending Reviews</dt>
//                   <dd className="text-lg sm:text-xl font-semibold text-gray-900">{stats.pendingReviews}</dd>
//                 </dl>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <div className="border-b border-gray-200">
//             <nav className="flex overflow-x-auto">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.key}
//                   onClick={() => setActiveTab(tab.key)}
//                   className={`flex-shrink-0 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
//                     activeTab === tab.key
//                       ? "border-purple-500 text-purple-600"
//                       : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                   }`}
//                 >
//                   {tab.label}
//                   <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">{tab.count}</span>
//                 </button>
//               ))}
//             </nav>
//           </div>

//           {/* Course Grid */}
//           <div className="p-4 sm:p-6">
//             {loading ? (
//               <div className="flex justify-center py-12">
//                 <LoadingSpinner size="large" />
//               </div>
//             ) : filteredCourses.length === 0 ? (
//               <div className="text-center py-12">
//                 <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
//                   />
//                 </svg>
//                 <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
//                 <p className="mt-1 text-sm text-gray-500">
//                   {activeTab === "all"
//                     ? "Get started by creating your first course."
//                     : `No courses with ${activeTab} status.`}
//                 </p>
//                 {activeTab === "all" && (
//                   <div className="mt-6">
//                     <Link
//                       to="/instructor/courses/create"
//                       className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
//                     >
//                       Create Your First Course
//                     </Link>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
//                 {filteredCourses.map((course) => (
//                   <InstructorCourseCard key={course.id} course={course} onEdit={handleEditCourse} showActions={true} />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default InstructorDashboard


"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { instructorAPI } from "../../services/instructorApi"
import InstructorCourseCard from "../../components/course/InstructorCourseCard"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import NotificationBell from "../../components/common/NotificationBell"
import { NotificationProvider } from "../../context/NotificationContext"

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    pendingReviews: 0,
  })
  const [activeTab, setActiveTab] = useState("all")
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [coursesData, statsData] = await Promise.all([
        instructorAPI.getMyCourses(1, activeTab === "all" ? null : activeTab),
        instructorAPI.getDashboardStats().catch(() => ({
          totalCourses: 0,
          totalStudents: 0,
          totalRevenue: 0,
          pendingReviews: 0,
        })),
      ])

      setCourses(coursesData)
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCourse = (courseId) => {
    navigate(`/instructor/courses/${courseId}/edit`)
  }

  const tabs = [
    { key: "all", label: "All Courses", count: courses.length },
    { key: "verified", label: "Published", count: courses.filter((c) => c.verification_status === "verified").length },
    { key: "pending", label: "Pending", count: courses.filter((c) => c.verification_status === "pending").length },
    { key: "rejected", label: "Rejected", count: courses.filter((c) => c.verification_status === "rejected").length },
  ]

  const filteredCourses =
    activeTab === "all" ? courses : courses.filter((course) => course.verification_status === activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Manage your courses and track performance
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <NotificationBell />
              <Link
                to="/instructor/courses/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Course
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                  <dd className="text-lg sm:text-xl font-semibold text-gray-900">{stats.totalCourses}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 sm:h-8 sm:w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Students</dt>
                  <dd className="text-lg sm:text-xl font-semibold text-gray-900">{stats.totalStudents}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg sm:text-xl font-semibold text-gray-900">₹{stats.totalRevenue}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Pending Reviews</dt>
                  <dd className="text-lg sm:text-xl font-semibold text-gray-900">{stats.pendingReviews}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">{tab.count}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Course Grid */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === "all"
                    ? "Get started by creating your first course."
                    : `No courses with ${activeTab} status.`}
                </p>
                {activeTab === "all" && (
                  <div className="mt-6">
                    <Link
                      to="/instructor/courses/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Create Your First Course
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredCourses.map((course) => (
                  <InstructorCourseCard key={course.id} course={course} onEdit={handleEditCourse} showActions={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorDashboard