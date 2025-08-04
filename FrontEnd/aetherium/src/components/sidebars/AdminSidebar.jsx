import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FileBarChart } from 'lucide-react';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="w-64 bg-[#1a1b3a] text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-[#1a1b3a] font-bold">AE</span>
          </div>
          <span className="text-lg font-bold">AETHERIUM</span>
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>Users</span>
          </NavLink>
          <div className="text-sm text-gray-400 pl-3">Courses</div>
          <NavLink
            to="/admin/all-courses"
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
            <span>All Courses</span>
          </NavLink>
          <NavLink
            to="/admin/courses-to-verify"
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Courses to Verify</span>
          </NavLink>
          <div className="text-sm text-gray-400 pl-3">Categories & Reports</div>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 4a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H5zm0 2h10v6H5V6z" />
            </svg>
            <span>Categories</span>
          </NavLink>
          {/* <NavLink
            to="/admin/topics"
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6zM8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            </svg>
            <span>Topics</span> 
          </NavLink> */}
          <NavLink
      to="/admin/reports"
      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 text-left"
    >
      <FileBarChart className="h-5 w-5 text-white" />
      <span>Reports</span>
    </NavLink>
        </nav>

        <div className="mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H3zm10 4a1 1 0 100 2h4a1 1 0 100-2h-4zm0 4a1 1 0 100 2h4a1 1 0 100-2h-4zm-1 3a1 1 0 011-1h5a1 1 0 110 2h-5a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Sign-out</span>
          </button>
        </div>
        

      </div>
    </div>
  );
};

export default AdminSidebar;