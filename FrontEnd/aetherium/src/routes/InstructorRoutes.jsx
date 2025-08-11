import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import InstructorLayout from "../components/layout/InstructorLayout";
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import InstructorSettings from "../pages/instructor/InstructorSettings";
import CreateCourse from "../pages/instructor/CreateCourse";
import InstructorDrafts from "../pages/instructor/InstructorDrafts";
import PendingApproval from "../pages/instructor/PendingApproval";
import MyCourses from "../pages/instructor/MyCourses";
import InstrtructorCourseView from "../pages/instructor/InstructorCourseView";
import Topics from "../pages/admin/Topics"; // assumed shared
import DetailedView from "../pages/admin/DetailedView";
import InstructorChat from "../pages/instructor/InstructorChat";
import CourseAnalytics from "../pages/instructor/CourseAnalytics";

export default function InstructorRoutes() {
  return (
    <Route path="/instructor" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorLayout /></ProtectedRoute>}>
      <Route path="dashboard" element={<InstructorDashboard />} />
      <Route path="settings" element={<InstructorSettings />} />
      <Route path="profile" element={<InstructorSettings />} />
      <Route path="create-course" element={<CreateCourse />} />
      <Route path="create-course/:courseId" element={<CreateCourse />} />
      <Route path="drafts" element={<InstructorDrafts />} />
      <Route path="pending-approval" element={<PendingApproval />} />
      <Route path="my-courses" element={<MyCourses />} />
      <Route path="/instructor/courses/:courseId/analytics" element={<CourseAnalytics />} />
      <Route path="courses/:courseId/review/detailed-view" element={<DetailedView />} />
      <Route path="courses/${courseId}/InstrtructorCourseView" element={<InstrtructorCourseView />} />
      <Route path="courses/${course.id}/preview" element={<DetailedView />}/>
      <Route path="earnings" element={<div className="p-8"><h1 className="text-3xl font-bold">Earnings</h1></div>} />
      <Route path="messages" element={<InstructorChat />} />
      <Route path="topics" element={<Topics />} />

      {/* /instructor/courses/${courseId}/review/detailed-view */}
    </Route>
  );
}
