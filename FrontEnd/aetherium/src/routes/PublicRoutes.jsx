import { Route, Routes } from "react-router-dom";

import Landing from "../pages/Landing";
import LoginUser from "../pages/common/LoginUser";
import LoginInstructor from "../pages/common/LoginInstructor";
import LoginAdmin from "../pages/common/LoginAdmin";
import RegisterUser from "../pages/common/RegisterUser";
import RegisterInstructor from "../pages/common/RegisterInstructor";
import RegisterAdmin from "../pages/common/RegisterAdmin";
import Unauthorized from "../pages/common/Unauthorized";
import GoogleCallback from "../pages/common/GoogleCallback";
import ForgotPassword from "../pages/common/ForgotPassword";
import ResetPassword from "../pages/common/ResetPassword";
import Courses from "../pages/user/Courses";
import CourseDetail from "../pages/user/CourseDetail";

export default function PublicRoutes() {
  return (
    <>
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
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:courseId" element={<CourseDetail />} />
    </>
  );
}
