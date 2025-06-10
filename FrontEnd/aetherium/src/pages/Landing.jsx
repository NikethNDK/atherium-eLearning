import { Link } from "react-router-dom"
import Header from "../components/common/Header"
import Footer from "../components/common/Footer"

const Landing = () => {
  const courses = [
    {
      id: 1,
      title: "Learn With Shoaib",
      instructor: "John Wilson",
      price: "$8.99",
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Building User Interface...",
      instructor: "Adam Howard",
      price: "$11.70",
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "Figma UI UX Design...",
      instructor: "Jane Cooper",
      price: "$17.84",
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      title: "Learn With Shoaib",
      instructor: "John Wilson",
      price: "$8.99",
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
            {courses.slice(0, 4).map((course) => (
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
                      <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
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
            {courses.map((course) => (
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
                      <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                    </div>
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

      <Footer />
    </div>
  )
}

export default Landing
