import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./routes/ProtectedRoute"
import InstructorLayout from "./components/layout/InstructorLayout"
import AdminLayout from "./components/layout/AdminLayout"

// Pages
import Landing from "./pages/Landing"
import LoginUser from "./pages/common/LoginUser"
import LoginInstructor from "./pages/common/LoginInstructor"
import LoginAdmin from "./pages/common/LoginAdmin"
import RegisterUser from "./pages/common/RegisterUser"
import RegisterInstructor from "./pages/common/RegisterInstructor"
import RegisterAdmin from "./pages/common/RegisterAdmin"
import Unauthorized from "./pages/common/Unauthorized"
import NotFound from "./pages/common/NotFound"
import GoogleCallback from "./pages/common/GoogleCallback"

// User Pages
import UserDashboard from "./pages/user/UserDashboard"
import UserProfile from "./pages/user/UserProfile"

// Instructor Pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard"
import InstructorSettings from "./pages/instructor/InstructorSettings"
import CreateCourse from "./pages/instructor/CreateCourse"
import InstructorDrafts from "./pages/instructor/InstructorDrafts"
import PendingApproval from "./pages/instructor/PendingApproval"
import MyCourses from "./pages/instructor/MyCourses"

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"
import AllCourses from "./pages/admin/AllCourses"
import CoursesToVerify from "./pages/admin/CoursesToVerify"
import Categories from "./pages/admin/Categories"
import Topics from "./pages/admin/Topics"
import CourseReview from "./pages/admin/CourseReview"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginUser />} />
          <Route path="/login/instructor" element={<LoginInstructor />} />
          <Route path="/login/admin" element={<LoginAdmin />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/register/instructor" element={<RegisterInstructor />} />
          <Route path="/register/admin" element={<RegisterAdmin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Instructor Routes with Layout */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <InstructorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="settings" element={<InstructorSettings />} />
            <Route path="profile" element={<InstructorSettings />} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="create-course/:courseId" element={<CreateCourse />} />
            <Route path="drafts" element={<InstructorDrafts />} />
            <Route path="pending-approval" element={<PendingApproval />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route
              path="earnings"
              element={
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Earnings</h1>
                </div>
              }
            />
            <Route
              path="messages"
              element={
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Messages</h1>
                </div>
              }
            />
            <Route path="topics" element={<Topics />} />
          </Route>

          {/* Admin Routes with Layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="all-courses" element={<AllCourses />} />
            <Route path="courses-to-verify" element={<CoursesToVerify />} />
            <Route path="courses/:courseId/review" element={<CourseReview />} />
            <Route
              path="profile"
              element={
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Admin Profile</h1>
                </div>
              }
            />
            <Route
              path="sales"
              element={
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Sales History</h1>
                </div>
              }
            />
            <Route path="categories" element={<Categories />} />
            <Route path="topics" element={<Topics />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

