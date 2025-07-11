

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { CircleUserRound, ShoppingCart, Heart } from "lucide-react"
import { userAPI } from "../../services/userApi" // Adjust the import path as needed

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  // Fetch cart and wishlist counts when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role?.name === "user") {
      fetchCartCount()
      fetchWishlistCount()
    } else {
      setCartCount(0)
      setWishlistCount(0)
    }
  }, [isAuthenticated, user])

  const fetchCartCount = async () => {
    try {
      const cartData = await userAPI.getCart()
      setCartCount(cartData.total_items || 0)
    } catch (error) {
      console.error("Error fetching cart count:", error)
      setCartCount(0)
    }
  }

  const fetchWishlistCount = async () => {
    try {
      // Assuming you have a wishlist API endpoint
      const wishlistData = await userAPI.getWishlist()
      setWishlistCount(wishlistData.total_items || 0)
    } catch (error) {
      console.error("Error fetching wishlist count:", error)
      setWishlistCount(0)
    }
  }

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

              {/* Cart and Wishlist Icons for Users Only */}
              {user?.role?.name === "user" && (
                <>
                  {/* Cart Icon with Count */}
                  {cartCount >=0 && (
                    <Link to="/cart" className="relative hover:text-cyan-400 transition-colors">
                      <ShoppingCart className="w-6 h-6" />
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    </Link>
                  )}

                  {/* Wishlist Icon with Count */}
                  {wishlistCount >= 0 && (
                    <Link to="/wishlist" className="relative hover:text-cyan-400 transition-colors">
                      <Heart className="w-6 h-6" />
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    </Link>
                  )}
                </>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-700 transition-colors"
                >
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
                    
                    {/* Order History - Only for users */}
                    {user?.role?.name === "user" && (
                      <Link
                        to="/user/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Order History
                      </Link>
                    )}
                    
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

      {/* Mobile Menu */}
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
                
                {/* Mobile Cart and Wishlist for Users */}
                {user?.role?.name === "user" && (
                  <>
                    {cartCount > 0 && (
                      <Link to="/cart" className="flex items-center justify-between py-2 hover:text-cyan-400">
                        <span>Cart</span>
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {cartCount}
                        </span>
                      </Link>
                    )}
                    {wishlistCount > 0 && (
                      <Link to="/wishlist" className="flex items-center justify-between py-2 hover:text-cyan-400">
                        <span>Wishlist</span>
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {wishlistCount}
                        </span>
                      </Link>
                    )}
                  </>
                )}
                
                <Link to={getProfileLink()} className="block py-2 hover:text-cyan-400">
                  Profile
                </Link>
                
                {/* Order History for Mobile - Users Only */}
                {user?.role?.name === "user" && (
                  <Link to="/user/orders" className="block py-2 hover:text-cyan-400">
                    Order History
                  </Link>
                )}
                
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



// "use client"

// import { useState, useEffect } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { useAuth } from "../../context/AuthContext"
// import { userAPI } from "../../services/userApi"

// const Header = () => {
//   const { user, logout, isAuthenticated } = useAuth()
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//   const [cartCount, setCartCount] = useState(0)
//   const [wishlistCount, setWishlistCount] = useState(0)
//   const navigate = useNavigate()

//   useEffect(() => {
//     if (isAuthenticated && user?.role?.name === "user") {
//       fetchCounts()
//     }
//   }, [isAuthenticated, user])

//   const fetchCounts = async () => {
//     try {
//       const [cart, wishlist] = await Promise.all([userAPI.getCartCount(), userAPI.getWishlistCount()])
//       setCartCount(cart)
//       setWishlistCount(wishlist)
//     } catch (error) {
//       console.error("Error fetching counts:", error)
//     }
//   }

//   const handleLogout = () => {
//     logout()
//     navigate("/")
//   }

//   const getDashboardLink = () => {
//     if (!user) return "/login"
//     switch (user.role?.name) {
//       case "admin":
//         return "/admin/dashboard"
//       case "instructor":
//         return "/instructor/dashboard"
//       case "user":
//         return "/dashboard"
//       default:
//         return "/login"
//     }
//   }

//   return (
//     <header className="bg-white shadow-sm border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex-shrink-0">
//             <Link to="/" className="flex items-center">
//               <span className="text-2xl font-bold text-purple-600">EduPlatform</span>
//             </Link>
//           </div>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center space-x-8">
//             <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
//               Home
//             </Link>
//             <Link to="/courses" className="text-gray-700 hover:text-purple-600 transition-colors">
//               Courses
//             </Link>

//             {/* Show My Learning for authenticated users, About for others */}
//             {isAuthenticated && user?.role?.name === "user" ? (
//               <Link to="/my-learning" className="text-gray-700 hover:text-purple-600 transition-colors">
//                 My Learning
//               </Link>
//             ) : (
//               <Link to="/about" className="text-gray-700 hover:text-purple-600 transition-colors">
//                 About
//               </Link>
//             )}

//             <Link to="/contact" className="text-gray-700 hover:text-purple-600 transition-colors">
//               Contact
//             </Link>
//           </nav>

//           {/* Right side actions */}
//           <div className="flex items-center space-x-4">
//             {/* User-specific icons */}
//             {isAuthenticated && user?.role?.name === "user" && (
//               <>
//                 {/* Wishlist */}
//                 <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors">
//                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
//                     />
//                   </svg>
//                   {wishlistCount > 0 && (
//                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                       {wishlistCount}
//                     </span>
//                   )}
//                 </Link>

//                 {/* Cart */}
//                 <Link to="/cart" className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors">
//                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 005 16h12M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"
//                     />
//                   </svg>
//                   {cartCount > 0 && (
//                     <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                       {cartCount}
//                     </span>
//                   )}
//                 </Link>
//               </>
//             )}

//             {/* Auth buttons */}
//             {isAuthenticated ? (
//               <div className="relative">
//                 <button
//                   onClick={() => setIsMenuOpen(!isMenuOpen)}
//                   className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
//                 >
//                   <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
//                     <span className="text-white text-sm font-medium">
//                       {user?.firstname?.charAt(0) || user?.email?.charAt(0) || "U"}
//                     </span>
//                   </div>
//                   <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>

//                 {/* Dropdown Menu */}
//                 {isMenuOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
//                     <Link
//                       to={getDashboardLink()}
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       onClick={() => setIsMenuOpen(false)}
//                     >
//                       Dashboard
//                     </Link>
//                     <Link
//                       to="/profile"
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       onClick={() => setIsMenuOpen(false)}
//                     >
//                       Profile
//                     </Link>
//                     {user?.role?.name === "user" && (
//                       <Link
//                         to="/user/orders"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         onClick={() => setIsMenuOpen(false)}
//                       >
//                         Order History
//                       </Link>
//                     )}
//                     <button
//                       onClick={() => {
//                         handleLogout()
//                         setIsMenuOpen(false)
//                       }}
//                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="flex items-center space-x-4">
//                 <Link to="/login" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
//                   Login
//                 </Link>
//                 <Link
//                   to="/register"
//                   className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium"
//                 >
//                   Sign Up
//                 </Link>
//               </div>
//             )}

//             {/* Mobile menu button */}
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="md:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
//             >
//               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {isMenuOpen && (
//           <div className="md:hidden py-4 border-t border-gray-200">
//             <div className="flex flex-col space-y-4">
//               <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
//                 Home
//               </Link>
//               <Link to="/courses" className="text-gray-700 hover:text-purple-600 transition-colors">
//                 Courses
//               </Link>
//               {isAuthenticated && user?.role?.name === "user" ? (
//                 <Link to="/my-learning" className="text-gray-700 hover:text-purple-600 transition-colors">
//                   My Learning
//                 </Link>
//               ) : (
//                 <Link to="/about" className="text-gray-700 hover:text-purple-600 transition-colors">
//                   About
//                 </Link>
//               )}
//               <Link to="/contact" className="text-gray-700 hover:text-purple-600 transition-colors">
//                 Contact
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   )
// }

// export default Header
