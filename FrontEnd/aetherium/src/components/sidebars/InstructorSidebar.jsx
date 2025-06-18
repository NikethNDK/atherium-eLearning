
// import { NavLink, useNavigate } from "react-router-dom"
// import { useAuth } from "../../context/AuthContext"

// const InstructorSidebar = () => {
//   const { logout } = useAuth()
//   const navigate = useNavigate()

//   const handleLogout = async () => {
//     await logout()
//     navigate("/")
//   }

//   return (
//     <div className="w-64 bg-[#1a1b3a] text-white min-h-screen">
//       <div className="p-6">
//         <div className="flex items-center space-x-2 mb-8">
//           <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
//             <span className="text-[#1a1b3a] font-bold">AE</span>
//           </div>
//           <span className="text-lg font-bold">AETHERIUM</span>
//         </div>

//         <nav className="space-y-2">
//           <NavLink
//             to="/instructor/dashboard"
//             className={({ isActive }) =>
//               `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
//             }
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
//             </svg>
//             <span>Dashboard</span>
//           </NavLink>

//           <NavLink
//             to="/instructor/courses/create"
//             className={({ isActive }) =>
//               `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
//             }
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path
//                 fillRule="evenodd"
//                 d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span>Create New Course</span>
//           </NavLink>

//           <NavLink
//             to="/instructor/courses"
//             className={({ isActive }) =>
//               `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
//             }
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
//             </svg>
//             <span>My Courses</span>
//           </NavLink>

//           <NavLink
//             to="/instructor/earnings"
//             className={({ isActive }) =>
//               `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
//             }
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span>Earning</span>
//           </NavLink>

//           <NavLink
//             to="/instructor/messages"
//             className={({ isActive }) =>
//               `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
//             }
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path
//                 fillRule="evenodd"
//                 d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span>Message</span>
//             <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-auto">3</span>
//           </NavLink>

//           <NavLink
//             to="/instructor/settings"
//             className={({ isActive }) =>
//               `flex items-center space-x-3 p-3 rounded-lg ${isActive ? "bg-purple-600" : "hover:bg-gray-700"}`
//             }
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path
//                 fillRule="evenodd"
//                 d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span>Settings</span>
//           </NavLink>
//         </nav>

//         <button
//           onClick={handleLogout}
//           className="absolute bottom-6 left-6 flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//             <path
//               fillRule="evenodd"
//               d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v1a1 1 0 102 0V9z"
//               clipRule="evenodd"
//             />
//           </svg>
//           <span>Sign-out</span>
//         </button>
//       </div>
//     </div>
//   )
// }

// export default InstructorSidebar


import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const InstructorSidebar = () => {
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
            to="/instructor/dashboard"
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
            to="/instructor/create-course"
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
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            <span>Create New Course</span>
          </NavLink>
          <div className="text-sm text-gray-400 pl-3">InProgress</div>
          <NavLink
            to="/instructor/drafts"
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
              <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
            </svg>
            <span>Drafts</span>
          </NavLink>
          <NavLink
            to="/instructor/pending-approval"
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
            <span>Pending Approval</span>
          </NavLink>
          <NavLink
            to="/instructor/my-courses"
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
            <span>My Courses</span>
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

export default InstructorSidebar;
