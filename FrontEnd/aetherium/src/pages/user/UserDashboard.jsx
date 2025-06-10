"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const UserDashboard = () => {
  const { user } = useAuth()

  const recommendedCourses = [
    {
      id: 1,
      title: "AWS Certified Solutions Architect",
      instructor: "Lisa",
      price: "$99",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "AWS Certified Solutions Architect",
      instructor: "Lisa",
      price: "$99",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "AWS Certified Solutions Architect",
      instructor: "Lisa",
      price: "$99",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      title: "AWS Certified Solutions Architect",
      instructor: "Lisa",
      price: "$99",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const popularCourses = [
    {
      id: 1,
      title: "Learn With Shoaib",
      instructor: "Jerry Wilson",
      price: "$8.99",
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
      category: "Web Development",
    },
    {
      id: 2,
      title: "Building User Interface...",
      instructor: "Esther Howard",
      price: "$11.70",
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
      category: "UI/UX Design",
    },
    {
      id: 3,
      title: "Figma UI UX Design...",
      instructor: "Jane Cooper",
      price: "$17.84",
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=300",
      category: "UI/UX Design",
    },
    {
      id: 4,
      title: "Learn With Shoaib",
      instructor: "Jerry Wilson",
      price: "$8.99",
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
      category: "Web Development",
    },
  ]

  const news = [
    {
      id: 1,
      title: "Class Technologies Inc. Closes $30 Million Series A Financing to Meet High Demand",
      image: "/placeholder.svg?height=150&width=250",
      excerpt: "Class Technologies Inc., the company that created Class...",
    },
    {
      id: 2,
      title: "Zoom's earliest investors are betting millions on a better Zoom for schools",
      image: "/placeholder.svg?height=150&width=250",
      excerpt: "Zoom was never created to be a consumer product. Nevertheless, the...",
    },
    {
      id: 3,
      title: "Former Blackboard CEO Raises $16M to Bring LMS Features to Zoom Classrooms",
      image: "/placeholder.svg?height=150&width=250",
      excerpt: "This year, investors have poured big financial returns from betting on Zoom...",
    },
  ]

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Master Code,
                <br />
                Step by Step
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Skip the "what should I learn next?" confusion. Follow our structured paths, build awesome projects, and
                get expert help whenever you need it.
              </p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Become a Developer
              </button>
            </div>
            <div>
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Learning illustration"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Courses */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recommended for you</h2>
            <Link to="/courses" className="text-blue-600 hover:text-blue-700 font-semibold">
              See all
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img src={course.image || "/placeholder.svg"} alt={course.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{course.instructor}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">{course.price}</span>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600 ml-1">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2">Explore Programs</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Most Popular Courses</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Let's join our famous class, the knowledge provided will definitely be useful for you.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {popularCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {course.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <div className="flex items-center mb-2">
                    <img
                      src="/placeholder.svg?height=30&width=30"
                      alt={course.instructor}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <p className="text-gray-600 text-sm">{course.instructor}</p>
                  </div>
                  <div className="flex items-center text-yellow-500 mb-2">
                    {"★".repeat(Math.floor(course.rating))}
                    <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">{course.price}</span>
                    <button className="text-sm text-blue-600 hover:underline">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Latest News and Resources</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.excerpt}</p>
                  <Link to="#" className="text-blue-600 hover:underline font-medium">
                    Read more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default UserDashboard
