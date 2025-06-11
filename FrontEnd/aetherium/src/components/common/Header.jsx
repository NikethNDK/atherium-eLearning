// "use client"

// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { useAuth } from "../../context/AuthContext"

// const Header = () => {
//   const { user, isAuthenticated, logout } = useAuth()
//   const navigate = useNavigate()
//   const [isMenuOpen, setIsMenuOpen] = useState(false)

//   const handleLogout = async () => {
//     await logout()
//     navigate("/")
//   }

//   const getDashboardLink = () => {
//     if (!user) return "/"

//     switch (user.role.name) {
//       case "admin":
//         return "/admin/dashboard"
//       case "instructor":
//         return "/instructor/dashboard"
//       case "user":
//         return "/user/dashboard"
//       default:
//         return "/"
//     }
//   }

//   return (
//     <header className="bg-[#1a1b3a] text-white">
//       <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
//         <Link to="/" className="flex items-center space-x-2">
//           <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center">
//             <span className="text-[#1a1b3a] font-bold text-lg">AE</span>
//           </div>
//           <span className="text-xl font-bold">AETHERIUM</span>
//         </Link>

//         <div className="hidden md:flex items-center space-x-8">
//           <Link to="/" className="hover:text-cyan-400 transition-colors">
//             Home
//           </Link>
//           <Link to="/courses" className="hover:text-cyan-400 transition-colors">
//             Courses
//           </Link>
//           <Link to="/blog" className="hover:text-cyan-400 transition-colors">
//             Blog
//           </Link>
//           <Link to="/about" className="hover:text-cyan-400 transition-colors">
//             About Us
//           </Link>

//           {isAuthenticated ? (
//             <div className="flex items-center space-x-4">
//               <Link to={getDashboardLink()} className="hover:text-cyan-400 transition-colors">
//                 Dashboard
//               </Link>
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
//               >
//                 Logout
//               </button>
//             </div>
//           ) : (
//             <div className="flex items-center space-x-4">
//               <Link to="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-full transition-colors">
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-full transition-colors"
//               >
//                 Sign Up
//               </Link>
//             </div>
//           )}
//         </div>

//         <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//           </svg>
//         </button>
//       </nav>

//       {isMenuOpen && (
//         <div className="md:hidden bg-[#1a1b3a] border-t border-gray-700">
//           <div className="px-4 py-2 space-y-2">
//             <Link to="/" className="block py-2 hover:text-cyan-400">
//               Home
//             </Link>
//             <Link to="/courses" className="block py-2 hover:text-cyan-400">
//               Courses
//             </Link>
//             <Link to="/blog" className="block py-2 hover:text-cyan-400">
//               Blog
//             </Link>
//             <Link to="/about" className="block py-2 hover:text-cyan-400">
//               About Us
//             </Link>
//             {isAuthenticated ? (
//               <>
//                 <Link to={getDashboardLink()} className="block py-2 hover:text-cyan-400">
//                   Dashboard
//                 </Link>
//                 <button onClick={handleLogout} className="block py-2 text-red-400">
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link to="/login" className="block py-2 hover:text-cyan-400">
//                   Login
//                 </Link>
//                 <Link to="/register" className="block py-2 hover:text-cyan-400">
//                   Sign Up
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </header>
//   )
// }

// export default Header

"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { CircleUserRound } from "lucide-react"

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const getDashboardLink = () => {
    if (!user) return "/"

    switch (user.role.name) {
      case "admin":
        return "/admin/dashboard"
      case "instructor":
        return "/instructor/dashboard"
      case "user":
        return "/user/dashboard"
      default:
        return "/"
    }
  }

  const getProfileLink = () => {
    if (!user) return "/"

    switch (user.role.name) {
      case "admin":
        return "/admin/profile"
      case "instructor":
        return "/instructor/profile"
      case "user":
        return "/user/profile"
      default:
        return "/"
    }
  }

  return (
    <header className="bg-[#1a1b3a] text-white">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-[#1a1b3a] font-bold text-lg">AE</span>
          </div>
          <span className="text-xl font-bold">AETHERIUM</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <Link to="/courses" className="hover:text-cyan-400 transition-colors">
            Courses
          </Link>
          <Link to="/blog" className="hover:text-cyan-400 transition-colors">
            Blog
          </Link>
          <Link to="/about" className="hover:text-cyan-400 transition-colors">
            About Us
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to={getDashboardLink()} className="hover:text-cyan-400 transition-colors">
                Dashboard
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-700 transition-colors"
                >
                  {/* <img src="/placeholder.svg?height=32&width=32" alt="Profile" className="w-8 h-8 rounded-full" /> */}
                  <CircleUserRound />
                  <span className="text-sm">{user?.email?.split("@")[0] || "User"}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to={getProfileLink()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-full transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-full transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-[#1a1b3a] border-t border-gray-700">
          <div className="px-4 py-2 space-y-2">
            <Link to="/" className="block py-2 hover:text-cyan-400">
              Home
            </Link>
            <Link to="/courses" className="block py-2 hover:text-cyan-400">
              Courses
            </Link>
            <Link to="/blog" className="block py-2 hover:text-cyan-400">
              Blog
            </Link>
            <Link to="/about" className="block py-2 hover:text-cyan-400">
              About Us
            </Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="block py-2 hover:text-cyan-400">
                  Dashboard
                </Link>
                <Link to={getProfileLink()} className="block py-2 hover:text-cyan-400">
                  Profile
                </Link>
                <button onClick={handleLogout} className="block py-2 text-red-400">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 hover:text-cyan-400">
                  Login
                </Link>
                <Link to="/register" className="block py-2 hover:text-cyan-400">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
