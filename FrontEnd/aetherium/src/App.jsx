// import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
// import { AuthProvider } from "./context/AuthContext"
// import ProtectedRoute from "./routes/ProtectedRoute"

// // Pages
// import Landing from "./pages/Landing"
// import LoginUser from "./pages/common/LoginUser"
// import LoginInstructor from "./pages/common/LoginInstructor"
// import LoginAdmin from "./pages/common/LoginAdmin"
// import RegisterUser from "./pages/common/RegisterUser"
// import RegisterInstructor from "./pages/common/RegisterInstructor"
// import RegisterAdmin from "./pages/common/RegisterAdmin"
// import Unauthorized from "./pages/common/Unauthorized"
// import NotFound from "./pages/common/NotFound"
// import InstructorDashboard from "./pages/instructor/InstructorDashboard"

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<Landing />} />
//           <Route path="/login" element={<LoginUser />} />
//           <Route path="/login/instructor" element={<LoginInstructor />} />
//           <Route path="/login/admin" element={<LoginAdmin />} />
//           <Route path="/register" element={<RegisterUser />} />
//           <Route path="/register/instructor" element={<RegisterInstructor />} />
//           <Route path="/register/admin" element={<RegisterAdmin />} />
//           <Route path="/unauthorized" element={<Unauthorized />} />

//           {/* Protected Routes */}
//           <Route
//             path="/instructor/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["instructor"]}>
//                 <InstructorDashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/admin/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["admin"]}>
//                 <div className="p-8">
//                   <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//                   <p>Welcome to the admin dashboard!</p>
//                 </div>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/user/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["user"]}>
//                 <div className="p-8">
//                   <h1 className="text-3xl font-bold">User Dashboard</h1>
//                   <p>Welcome to your learning dashboard!</p>
//                 </div>
//               </ProtectedRoute>
//             }
//           />

//           {/* Catch all route */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   )
// }

// export default App

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

// User Pages
import UserDashboard from "./pages/user/UserDashboard"
import UserProfile from "./pages/user/UserProfile"

// Instructor Pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard"
import InstructorSettings from "./pages/instructor/InstructorSettings"

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"

function App() {
  return (
    <AuthProvider>
      <Router>
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
            <Route
              path="courses"
              element={
                <div className="p-8">
                  <h1 className="text-3xl font-bold">My Courses</h1>
                </div>
              }
            />
            <Route
              path="courses/create"
              element={
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Create Course</h1>
                </div>
              }
            />
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
            <Route
              path="profile"
              element={
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Admin Profile</h1>
                </div>
              }
            />
            <Route
              path="courses"
              element={
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Manage Courses</h1>
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
            <Route
              path="categories"
              element={
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Categories</h1>
                </div>
              }
            />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
