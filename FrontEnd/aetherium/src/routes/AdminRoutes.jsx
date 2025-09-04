import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AllCourses from "../pages/admin/AllCourses";
import CoursesToVerify from "../pages/admin/CoursesToVerify";
import CourseReview from "../pages/admin/CourseReview";
import Categories from "../pages/admin/Categories";
import Topics from "../pages/admin/Topics"; // or shared path
import DetailedView from "../pages/admin/DetailedView";
import AdminReport from "../pages/admin/AdminReport";
import WithdrawalRequests from "../pages/admin/WithdrawalRequests";


export default function AdminRoutes() {
  return (

    <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="all-courses" element={<AllCourses />} />
      <Route path="courses-to-verify" element={<CoursesToVerify />} />
      <Route path="reports" element={<AdminReport />} />
      <Route path="courses/:courseId/review" element={<CourseReview />} />
      <Route path="courses/:courseId/review/detailed-view" element={<DetailedView />} />
      <Route path="profile" element={<div className="p-8"><h1 className="text-3xl font-bold">Admin Profile</h1></div>} />
      <Route path="sales" element={<div className="p-8"><h1 className="text-3xl font-bold">Sales History</h1></div>} />
      <Route path="withdrawal-requests" element={<WithdrawalRequests />} />
      <Route path="categories" element={<Categories />} />
      <Route path="topics" element={<Topics />} />
    </Route>
    
  );
}
