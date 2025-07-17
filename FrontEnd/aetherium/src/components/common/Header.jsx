import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { userAPI } from "../../services/userApi"

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user?.role?.name === "user") {
      fetchCounts()
    }
  }, [isAuthenticated, user])

  const fetchCounts = async () => {
    try {
      const [cart, wishlist] = await Promise.all([userAPI.getCartCount(), userAPI.getWishlistCount()])
      setCartCount(cart)
      setWishlistCount(wishlist)
    } catch (error) {
      console.error("Error fetching counts:", error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    switch (user.role?.name) {
      case "admin":
        return "/admin/dashboard"
      case "instructor":
        return "/instructor/dashboard"
      case "user":
        return "/user/dashboard"
      default:
        return "/login"
    }
  }

  const getHomeLink = () => {
    if (isAuthenticated) {
      return getDashboardLink()
    }
    return "/"
  }

  const getProfileLink = () => {
    if (!user) return "/login"
    switch (user.role?.name) {
      case "admin":
        return "/admin/profile"
      case "instructor":
        return "/instructor/profile"
      case "user":
        return "/user/profile"
      default:
        return "/login"
    }
  }

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { to: "/", label: "Home" },
      { to: "/contact", label: "Contact" }
    ]

    if (user?.role?.name === "user") {
      return [
        { to: getHomeLink(), label: "Home" },
        { to: "/courses", label: "Courses" },
        { to: "/my-learning", label: "My Learning" },
        { to: "/contact", label: "Contact" }
      ]
    }

    // For admin and instructor, show dashboard
    if (user?.role?.name === "admin" || user?.role?.name === "instructor") {
      return [
        { to: getHomeLink(), label: "Home" },
        { to: getDashboardLink(), label: "Dashboard" },
        { to: "/contact", label: "Contact" }
      ]
    }

    // For unauthenticated users
    return [
      { to: "/", label: "Home" },
      { to: "/courses", label: "Courses" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" }
    ]
  }

  return (
    <header className="bg-[#1a1b3a] text-white">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={getHomeLink()} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-[#1a1b3a] font-bold text-lg">AE</span>
            </div>
            <span className="text-xl font-bold">AETHERIUM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {getNavigationItems().map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="hover:text-cyan-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* User-specific icons (only for users) */}
            {isAuthenticated && user?.role?.name === "user" && (
              <>
                {/* Wishlist */}
                <Link to="/wishlist" className="relative hover:text-cyan-400 transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative hover:text-cyan-400 transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 005 16h12M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-[#1a1b3a] text-sm font-medium">
                      {user?.firstname?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="text-sm">{user?.email?.split("@")[0] || "User"}</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to={getProfileLink()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {user?.role?.name === "user" && (
                      <Link
                        to="/user/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Order History
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
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

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#1a1b3a] border-t border-gray-700 mt-4">
            <div className="px-4 py-2 space-y-2">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block py-2 hover:text-cyan-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Cart and Wishlist for Users */}
              {isAuthenticated && user?.role?.name === "user" && (
                <>
                  {cartCount > 0 && (
                    <Link 
                      to="/cart" 
                      className="flex items-center justify-between py-2 hover:text-cyan-400"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Cart</span>
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {cartCount}
                      </span>
                    </Link>
                  )}
                  {wishlistCount > 0 && (
                    <Link 
                      to="/wishlist" 
                      className="flex items-center justify-between py-2 hover:text-cyan-400"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Wishlist</span>
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {wishlistCount}
                      </span>
                    </Link>
                  )}
                </>
              )}

              {isAuthenticated ? (
                <>
                  <Link 
                    to={getProfileLink()} 
                    className="block py-2 hover:text-cyan-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  {/* Order History for Mobile - Users Only */}
                  {user?.role?.name === "user" && (
                    <Link 
                      to="/user/orders" 
                      className="block py-2 hover:text-cyan-400"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Order History
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }} 
                    className="block py-2 text-red-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block py-2 hover:text-cyan-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block py-2 hover:text-cyan-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header