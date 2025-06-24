import { Link } from "react-router-dom"
import { Clock, Star, BookOpen } from "lucide-react"

const CourseCard = ({ course, showAddToCart = true }) => {
  const formatPrice = (price) => {
    return `₹${price?.toFixed(2) || "0.00"}`
  }

  const formatDuration = (duration, unit) => {
    if (!duration) return "N/A"
    return `${duration} ${unit || "hours"}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={course.cover_image || "/placeholder.svg?height=200&width=300"}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">{course.category?.name || "General"}</span>
        </div>
        {course.level && (
          <div className="absolute top-2 right-2">
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">{course.level}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>

        {course.subtitle && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.subtitle}</p>}

        <div className="flex items-center mb-3">
          <img
            src={course.instructor?.profile_picture || "/placeholder.svg?height=24&width=24"}
            alt={course.instructor?.firstname}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-gray-600 text-sm">
            {course.instructor?.firstname} {course.instructor?.lastname}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatDuration(course.duration, course.duration_unit)}</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-1" />
            <span>{course.sections?.length || 0} sections</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {course.discount_price && course.discount_price < course.price ? (
              <>
                <span className="text-lg font-bold text-red-600">{formatPrice(course.discount_price)}</span>
                <span className="text-sm text-gray-500 line-through">{formatPrice(course.price)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-blue-600">{formatPrice(course.price)}</span>
            )}
          </div>

          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600 ml-1">4.8</span>
          </div>
        </div>

        <div className="mt-4">
          <Link
            to={`/courses/${course.id}`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 block text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
