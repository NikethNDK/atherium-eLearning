import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import UserDashboard from "../pages/user/UserDashboard";
import UserProfile from "../pages/user/UserProfile";
import Cart from "../pages/user/Cart";
import MyLearning from "../pages/user/MyLearning";
// import CourseDetail from "../pages/user/CourseDetail";
import PaymentSuccess from "../pages/user/PaymentSuccess";
import OrderHistory from "../pages/user/OrderHistory";
import MyLearningCoursePage from "../pages/user/MyLearningCoursePage";
import MyCourseView from "../pages/user/MyCourseView";
// import DownloadCertificate from "../components/course/user/learning/DownloadCertificate";

export default function UserRoutes() {
  return (
    <>
      <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/profile" element={<ProtectedRoute allowedRoles={["user"]}><UserProfile /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute allowedRoles={["user"]}><Cart /></ProtectedRoute>} />
      <Route path="/my-learning" element={<ProtectedRoute allowedRoles={["user"]}><MyLearning /></ProtectedRoute>} />
      <Route path="/my-learning/:courseId" element={<ProtectedRoute allowedRoles={["user"]}><MyCourseView /></ProtectedRoute>} />
      <Route path="/my-learning/course-curriculum/:courseId" element={<ProtectedRoute allowedRoles={["user"]}><MyLearningCoursePage /></ProtectedRoute>} />
      <Route path="/payment-success" element={<ProtectedRoute allowedRoles={["user"]}><PaymentSuccess /></ProtectedRoute>} />
      <Route path="/user/orders" element={<ProtectedRoute allowedRoles={["user"]}><OrderHistory /></ProtectedRoute>} />
      {/* <Route path="/user/generate-certificate" element={<ProtectedRoute allowedRoles={["user"]}><DownloadCertificate /></ProtectedRoute>}/> */}
    </>
  );
}
