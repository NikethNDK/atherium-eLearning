import { Link } from "react-router-dom"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-xl text-gray-600 mb-8">You don't have permission to access this resource.</p>
          </div>

          <div className="space-x-4">
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go Home
            </Link>
            <Link
              to="/login"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Unauthorized
