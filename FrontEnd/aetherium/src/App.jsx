// import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
// import { AuthProvider } from "./context/AuthContext"
// import ProtectedRoute from "./routes/ProtectedRoute"
// import InstructorLayout from "./components/layout/InstructorLayout"
// import AdminLayout from "./components/layout/AdminLayout"

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
// import GoogleCallback from "./pages/common/GoogleCallback"

// // User Pages
// import UserDashboard from "./pages/user/UserDashboard"
// import UserProfile from "./pages/user/UserProfile"

// // Instructor Pages
// import InstructorDashboard from "./pages/instructor/InstructorDashboard"
// import InstructorSettings from "./pages/instructor/InstructorSettings"
// import CreateCourse from "./pages/instructor/CreateCourse"
// import InstructorDrafts from "./pages/instructor/InstructorDrafts"
// import PendingApproval from "./pages/instructor/PendingApproval"
// import MyCourses from "./pages/instructor/MyCourses"

// // Admin Pages
// import AdminDashboard from "./pages/admin/AdminDashboard"
// import AdminUsers from "./pages/admin/AdminUsers"
// import AllCourses from "./pages/admin/AllCourses"
// import CoursesToVerify from "./pages/admin/CoursesToVerify"
// import Categories from "./pages/admin/Categories"
// import Topics from "./pages/admin/Topics"
// import CourseReview from "./pages/admin/CourseReview"

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
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
//           <Route path="/auth/google/callback" element={<GoogleCallback />} />

//           {/* User Routes */}
//           <Route
//             path="/user/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["user"]}>
//                 <UserDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/user/profile"
//             element={
//               <ProtectedRoute allowedRoles={["user"]}>
//                 <UserProfile />
//               </ProtectedRoute>
//             }
//           />

//           {/* Instructor Routes with Layout */}
//           <Route
//             path="/instructor"
//             element={
//               <ProtectedRoute allowedRoles={["instructor"]}>
//                 <InstructorLayout />
//               </ProtectedRoute>
//             }
//           >
//             <Route path="dashboard" element={<InstructorDashboard />} />
//             <Route path="settings" element={<InstructorSettings />} />
//             <Route path="profile" element={<InstructorSettings />} />
//             <Route path="create-course" element={<CreateCourse />} />
//             <Route path="create-course/:courseId" element={<CreateCourse />} />
//             <Route path="drafts" element={<InstructorDrafts />} />
//             <Route path="pending-approval" element={<PendingApproval />} />
//             <Route path="my-courses" element={<MyCourses />} />
//             <Route
//               path="earnings"
//               element={
//                 <div className="p-8">
//                   <h1 className="text-3xl font-bold">Earnings</h1>
//                 </div>
//               }
//             />
//             <Route
//               path="messages"
//               element={
//                 <div className="p-8">
//                   <h1 className="text-3xl font-bold">Messages</h1>
//                 </div>
//               }
//             />
//             <Route path="topics" element={<Topics />} />
//           </Route>

//           {/* Admin Routes with Layout */}
//           <Route
//             path="/admin"
//             element={
//               <ProtectedRoute allowedRoles={["admin"]}>
//                 <AdminLayout />
//               </ProtectedRoute>
//             }
//           >
//             <Route path="dashboard" element={<AdminDashboard />} />
//             <Route path="users" element={<AdminUsers />} />
//             <Route path="all-courses" element={<AllCourses />} />
//             <Route path="courses-to-verify" element={<CoursesToVerify />} />
//             <Route path="courses/:courseId/review" element={<CourseReview />} />
//             <Route
//               path="profile"
//               element={
//                 <div className="p-8">
//                   <h1 className="text-3xl font-bold">Admin Profile</h1>
//                 </div>
//               }
//             />
//             <Route
//               path="sales"
//               element={
//                 <div className="p-8">
//                   <h1 className="text-3xl font-bold">Sales History</h1>
//                 </div>
//               }
//             />
//             <Route path="categories" element={<Categories />} />
//             <Route path="topics" element={<Topics />} />
//           </Route>

//           {/* Catch all route */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   )
// }

// export default App



// import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
// import { AuthProvider } from "./context/AuthContext"
// import ProtectedRoute from "./routes/ProtectedRoute"
// import InstructorLayout from "./components/layout/InstructorLayout"
// import AdminLayout from "./components/layout/AdminLayout"

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
// import GoogleCallback from "./pages/common/GoogleCallback"

// // User Pages
// import UserDashboard from "./pages/user/UserDashboard"
// import UserProfile from "./pages/user/UserProfile"
// import Courses from "./pages/user/Courses"
// import CourseDetail from "./pages/user/CourseDetail"
// import Cart from "./pages/user/Cart"
// import MyLearning from "./pages/user/MyLearning"
// import PaymentSuccess from "./pages/user/PaymentSuccess"

// // Instructor Pages
// import InstructorDashboard from "./pages/instructor/InstructorDashboard"
// import InstructorSettings from "./pages/instructor/InstructorSettings"
// import CreateCourse from "./pages/instructor/CreateCourse"
// import InstructorDrafts from "./pages/instructor/InstructorDrafts"
// import PendingApproval from "./pages/instructor/PendingApproval"
// import MyCourses from "./pages/instructor/MyCourses"

// // Admin Pages
// import AdminDashboard from "./pages/admin/AdminDashboard"
// import AdminUsers from "./pages/admin/AdminUsers"
// import AllCourses from "./pages/admin/AllCourses"
// import CoursesToVerify from "./pages/admin/CoursesToVerify"
// import Categories from "./pages/admin/Categories"
// import Topics from "./pages/admin/Topics"
// import CourseReview from "./pages/admin/CourseReview"

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
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
//           <Route path="/auth/google/callback" element={<GoogleCallback />} />

//           {/* Public Course Routes (accessible to all) */}
//           <Route path="/courses" element={<Courses />} />
//           <Route path="/courses/:courseId" element={<CourseDetail />} />

//           {/* User Routes */}
//           <Route
//             path="/user/dashboard"
//             element={
//               <ProtectedRoute allowedRoles={["user"]}>
//                 <UserDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/user/profile"
//             element={
//               <ProtectedRoute allowedRoles={["user"]}>
//                 <UserProfile />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/cart"
//             element={
//               <ProtectedRoute allowedRoles={["user"]}>
//                 <Cart />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/my-learning"
//             element={
//               <ProtectedRoute allowedRoles={["user"]}>
//                 <MyLearning />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/my-learning/:courseId"
//             element={
//               <ProtectedRoute allowedRoles={["user"]}>
//                 <MyLearning />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/payment-success"
//             element={
//               <ProtectedRoute allowedRoles={["user"]}>
//                 <PaymentSuccess />
//               </ProtectedRoute>
//             }
//           />

//           {/* Instructor Routes with Layout */}
//           <Route
//             path="/instructor"
//             element={
//               <ProtectedRoute allowedRoles={["instructor"]}>
//                 <InstructorLayout />
//               </ProtectedRoute>
//             }
//           >
//             <Route path="dashboard" element={<InstructorDashboard />} />
//             <Route path="settings" element={<InstructorSettings />} />
//             <Route path="profile" element={<InstructorSettings />} />
//             <Route path="create-course" element={<CreateCourse />} />
//             <Route path="create-course/:courseId" element={<CreateCourse />} />
//             <Route path="drafts" element={<InstructorDrafts />} />
//             <Route path="pending-approval" element={<PendingApproval />} />
//             <Route path="my-courses" element={<MyCourses />} />
//             <Route
//               path="earnings"
//               element={
//                 <div className="p-8">
//                   <h1 className="text-3xl font-bold">Earnings</h1>
//                 </div>
//               }
//             />
//             <Route
//               path="messages"
//               element={
//                 <div className="p-8">
//                   <h1 className="text-3xl font-bold">Messages</h1>
//                 </div>
//               }
//             />
//             <Route path="topics" element={<Topics />} />
//           </Route>

//           {/* Admin Routes with Layout */}
//           <Route
//             path="/admin"
//             element={
//               <ProtectedRoute allowedRoles={["admin"]}>
//                 <AdminLayout />
//               </ProtectedRoute>
//             }
//           >
//             <Route path="dashboard" element={<AdminDashboard />} />
//             <Route path="users" element={<AdminUsers />} />
//             <Route path="all-courses" element={<AllCourses />} />
//             <Route path="courses-to-verify" element={<CoursesToVerify />} />
//             <Route path="courses/:courseId/review" element={<CourseReview />} />
//             <Route
//               path="profile"
//               element={
//                 <div className="p-8">
//                   <h1 className="text-3xl font-bold">Admin Profile</h1>
//                 </div>
//               }
//             />
//             <Route
//               path="sales"
//               element={
//                 <div className="p-8">
//                   <h1 className="text-3xl font-bold">Sales History</h1>
//                 </div>
//               }
//             />
//             <Route path="categories" element={<Categories />} />
//             <Route path="topics" element={<Topics />} />
//           </Route>

//           {/* Catch all route */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   )
// }

// export default App



import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import InstructorLayout from "./components/layout/InstructorLayout";
import AdminLayout from "./components/layout/AdminLayout";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Public Pages
import Landing from "./pages/Landing";
import LoginUser from "./pages/common/LoginUser";
import LoginInstructor from "./pages/common/LoginInstructor";
import LoginAdmin from "./pages/common/LoginAdmin";
import RegisterUser from "./pages/common/RegisterUser";
import RegisterInstructor from "./pages/common/RegisterInstructor";
import RegisterAdmin from "./pages/common/RegisterAdmin";
import Unauthorized from "./pages/common/Unauthorized";
import NotFound from "./pages/common/NotFound";
import GoogleCallback from "./pages/common/GoogleCallback";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import UserProfile from "./pages/user/UserProfile";
import Courses from "./pages/user/Courses";
import CourseDetail from "./pages/user/CourseDetail";
import Cart from "./pages/user/Cart";
import MyLearning from "./pages/user/MyLearning";
import PaymentSuccess from "./pages/user/PaymentSuccess";

// Instructor Pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorSettings from "./pages/instructor/InstructorSettings";
import CreateCourse from "./pages/instructor/CreateCourse";
import InstructorDrafts from "./pages/instructor/InstructorDrafts";
import PendingApproval from "./pages/instructor/PendingApproval";
import MyCourses from "./pages/instructor/MyCourses";


// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AllCourses from "./pages/admin/AllCourses";
import CoursesToVerify from "./pages/admin/CoursesToVerify";
import Categories from "./pages/admin/Categories";
import Topics from "./pages/admin/Topics";
import CourseReview from "./pages/admin/CourseReview";
import InstrtructorCourseView from "./pages/instructor/InstructorCourseView";
import ForgotPassword from "./pages/common/ForgotPassword";
import ResetPassword from "./pages/common/ResetPassword";


const queryClient = new QueryClient()

function App() {

 


  return (
    <QueryClientProvider client={queryClient}>
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          {/* Public Course Routes (accessible to all, including unauthenticated users) */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />

          {/* User Routes (require authentication and 'user' role) */}
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
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-learning"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <MyLearning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-learning/:courseId"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />

          {/* Instructor Routes with Layout (require authentication and 'instructor' role) */}
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
            <Route path="courses/:courseId/InstrtructorCourseView" element={<InstrtructorCourseView/>} />
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

          {/* Admin Routes with Layout (require authentication and 'admin' role) */}
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

          {/* Catch-all Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
    </QueryClientProvider>
  );
}

export default App;





// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
// import { AuthProvider } from "./context/AuthContext"
// // import { ToastProvider } from "./context/ToastContext"
// import ProtectedRoute from "./routes/ProtectedRoute"
// import Header from "./components/common/Header"
// import Footer from "./components/common/Footer"

// // Public Pages
// import Home from "./pages/Landing"
// // import About from "./pages/About"
// // import Contact from "./pages/Contact"
// import Login from "./pages/common/LoginUser"
// import Register from "./pages/common/RegisterUser"
// import ForgotPassword from "./pages/auth/ForgotPassword"
// import ResetPassword from "./pages/auth/ResetPassword"

// // Course Pages
// import CourseList from "./pages/courses/CourseList"
// import CourseDetail from "./pages/courses/CourseDetail"
// import CoursePlayer from "./pages/courses/CoursePlayer"

// // User Pages
// import UserDashboard from "./pages/user/UserDashboard"
// import MyLearning from "./pages/user/MyLearning"
// import Cart from "./pages/user/Cart"
// import Checkout from "./pages/user/Checkout"
// import OrderHistory from "./pages/user/OrderHistory"
// import Wishlist from "./pages/user/Wishlist"
// import Profile from "./pages/user/Profile"

// // Instructor Pages
// import InstructorDashboard from "./pages/instructor/InstructorDashboard"
// import CreateCourse from "./pages/instructor/CreateCourse"
// import EditCourse from "./pages/instructor/EditCourse"
// import CourseAnalytics from "./pages/instructor/CourseAnalytics"
// import InstructorProfile from "./pages/instructor/InstructorProfile"
// import InstructorStudents from "./pages/instructor/InstructorStudents"

// // Admin Pages
// import AdminDashboard from "./pages/admin/AdminDashboard"
// import AdminUsers from "./pages/admin/AdminUsers"
// import AdminCourses from "./pages/admin/AdminCourses"
// import AdminCategories from "./pages/admin/AdminCategories"
// import AdminReports from "./pages/admin/AdminReports"
// import AdminSettings from "./pages/admin/AdminSettings"

// // Error Pages
// import NotFound from "./pages/errors/NotFound"
// import Unauthorized from "./pages/errors/Unauthorized"

// function App() {
//   return (
//     <AuthProvider>
//       <ToastProvider>
//         <Router>
//           <div className="min-h-screen flex flex-col">
//             <Header />
//             <main className="flex-grow">
//               <Routes>
//                 {/* Public Routes */}
//                 <Route path="/" element={<Home />} />
//                 <Route path="/about" element={<About />} />
//                 <Route path="/contact" element={<Contact />} />
//                 <Route path="/courses" element={<CourseList />} />
//                 <Route path="/courses/:id" element={<CourseDetail />} />

//                 {/* Auth Routes */}
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/forgot-password" element={<ForgotPassword />} />
//                 <Route path="/reset-password" element={<ResetPassword />} />

//                 {/* User Protected Routes */}
//                 <Route
//                   path="/dashboard"
//                   element={
//                     <ProtectedRoute allowedRoles={["user"]}>
//                       <UserDashboard />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/my-learning"
//                   element={
//                     <ProtectedRoute allowedRoles={["user"]}>
//                       <MyLearning />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/my-learning/:courseId"
//                   element={
//                     <ProtectedRoute allowedRoles={["user"]}>
//                       <CoursePlayer />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/cart"
//                   element={
//                     <ProtectedRoute allowedRoles={["user"]}>
//                       <Cart />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/checkout"
//                   element={
//                     <ProtectedRoute allowedRoles={["user"]}>
//                       <Checkout />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/user/orders"
//                   element={
//                     <ProtectedRoute allowedRoles={["user"]}>
//                       <OrderHistory />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/wishlist"
//                   element={
//                     <ProtectedRoute allowedRoles={["user"]}>
//                       <Wishlist />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/profile"
//                   element={
//                     <ProtectedRoute allowedRoles={["user", "instructor"]}>
//                       <Profile />
//                     </ProtectedRoute>
//                   }
//                 />

//                 {/* Instructor Protected Routes */}
//                 <Route
//                   path="/instructor/dashboard"
//                   element={
//                     <ProtectedRoute allowedRoles={["instructor"]}>
//                       <InstructorDashboard />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/instructor/courses/create"
//                   element={
//                     <ProtectedRoute allowedRoles={["instructor"]}>
//                       <CreateCourse />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/instructor/courses/:id/edit"
//                   element={
//                     <ProtectedRoute allowedRoles={["instructor"]}>
//                       <EditCourse />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/instructor/courses/:id/analytics"
//                   element={
//                     <ProtectedRoute allowedRoles={["instructor"]}>
//                       <CourseAnalytics />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/instructor/students"
//                   element={
//                     <ProtectedRoute allowedRoles={["instructor"]}>
//                       <InstructorStudents />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/instructor/profile"
//                   element={
//                     <ProtectedRoute allowedRoles={["instructor"]}>
//                       <InstructorProfile />
//                     </ProtectedRoute>
//                   }
//                 />

//                 {/* Admin Protected Routes */}
//                 <Route
//                   path="/admin/dashboard"
//                   element={
//                     <ProtectedRoute allowedRoles={["admin"]}>
//                       <AdminDashboard />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/admin/users"
//                   element={
//                     <ProtectedRoute allowedRoles={["admin"]}>
//                       <AdminUsers />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/admin/courses"
//                   element={
//                     <ProtectedRoute allowedRoles={["admin"]}>
//                       <AdminCourses />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/admin/categories"
//                   element={
//                     <ProtectedRoute allowedRoles={["admin"]}>
//                       <AdminCategories />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/admin/reports"
//                   element={
//                     <ProtectedRoute allowedRoles={["admin"]}>
//                       <AdminReports />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/admin/settings"
//                   element={
//                     <ProtectedRoute allowedRoles={["admin"]}>
//                       <AdminSettings />
//                     </ProtectedRoute>
//                   }
//                 />

//                 {/* Error Routes */}
//                 <Route path="/unauthorized" element={<Unauthorized />} />
//                 <Route path="/404" element={<NotFound />} />
//                 <Route path="*" element={<Navigate to="/404" replace />} />
//               </Routes>
//             </main>
//             <Footer />
//           </div>
//         </Router>
//       </ToastProvider>
//     </AuthProvider>
//   )
// }

// export default App
