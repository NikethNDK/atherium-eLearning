
import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"


const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

useEffect(() => {
  const fetchUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // only after the API call completes
    }
  };
 const timeout = setTimeout(fetchUser, 300)  // Wait 300ms after mount

  return () => clearTimeout(timeout)
  // fetchUser();
}, []);

  // useEffect(() => {
  //   checkAuthStatus()
  // }, [])

  const checkAuthStatus = async () => {
    try {
      const userData = await authAPI.getCurrentUser()
      console.log("Fetching current user")
      if (userData){
        setUser(userData)
        setIsAuthenticated(true)
      } else{
        setUser(null);
        setIsAuthenticated(false)
      }
      
    } catch (error){
      console.error("Auth status check error:",error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      await authAPI.login(credentials)
      await checkAuthStatus()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      }
    }
  }

  const register = async (userData) => {
    try {
      await authAPI.register(userData)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Registration failed",
      }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// import { createContext, useContext, useState, useEffect } from "react"
// import { authAPI } from "../services/api"

// const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const currentUser = await authAPI.getCurrentUser()
//         setUser(currentUser)
//       } catch (error) {
//         console.error("Auth check failed:", error)
//         setUser(null)
//       } finally {
//         setLoading(false)
//       }
//     }
//     checkAuth()
//   }, [])

//   const login = async (credentials) => {
//     await authAPI.login(credentials)
//     const currentUser = await authAPI.getCurrentUser()
//     setUser(currentUser)
//   }

//   const logout = async () => {
//     await authAPI.logout()
//     setUser(null)
//     window.location.href = "/login"
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => useContext(AuthContext)
