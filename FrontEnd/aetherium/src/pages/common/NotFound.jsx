import { Link } from "react-router-dom"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
          </div>

          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default NotFound
