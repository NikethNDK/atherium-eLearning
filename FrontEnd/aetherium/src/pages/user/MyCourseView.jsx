import { useState, useEffect } from "react"
import { useParams, useNavigate,Link } from "react-router-dom"
import { userAPI} from '../../services/userApi'
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { ArrowLeft, CheckCircle, XCircle, User, Clock, BookOpen, Play, ChevronDown, ChevronRight } from "lucide-react"
import Header from "../../components/common/Header"


const MyCourseView = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")


  const [expandedSections, setExpandedSections] = useState({})

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const data = await userAPI.getCourseDetails(courseId)
      setCourse(data)
       const expanded = {}
      data.sections?.forEach(section => {
        expanded[section.id] = true
      })
      setExpandedSections(expanded)
    } catch (error) {
      console.error("Error fetching course:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith("http")) return imagePath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    return `${baseUrl}/${imagePath}`
  }

  if (loading) return <LoadingSpinner size="large" />
  if (!course) return <div className="p-8">Course not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate("/my-learning")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
              <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <BookOpen size={16} />
                  <span>{course.sections?.length || 0} Sections</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>
                    {course.duration || 0} {course.duration_unit || "hours"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <User size={16} />
                  <span>
                    {course.instructor?.firstname} {course.instructor?.lastname}
                  </span>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </div>

      {/* Course Preview */}
      <div className="px-4 sm:px-6 py-6">
        <div className="bg-gradient-to-r from-teal-400 to-teal-600 rounded-lg overflow-hidden mb-6">
          <div className="aspect-video relative">
            {course.trailer_video ? (
              <video
                className="w-full h-full object-cover"
                controls
                poster={getImageUrl(course.cover_image)}
                crossOrigin="anonymous"
              >
                <source src={getImageUrl(course.trailer_video)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : course.cover_image ? (
              <div className="relative w-full h-full">
                <img
                  src={getImageUrl(course.cover_image) || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Play className="text-white ml-1" size={24} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-2xl sm:text-4xl font-bold mb-2">{course.title}</h2>
                  <p className="text-lg sm:text-xl">{course.subtitle}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {["overview", "curriculum", "instructor"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{course.description || "No description provided"}</p>
                  </div>
                </div>

                {course.learning_objectives && course.learning_objectives.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">What you will learn in this course</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.learning_objectives.map((objective, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                          <span className="text-gray-700">{objective.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.target_audiences && course.target_audiences.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Who this course is for:</h3>
                    <div className="space-y-2">
                      {course.target_audiences.map((audience, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{audience.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.requirements && course.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Course requirements</h3>
                    <div className="space-y-2">
                      {course.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{requirement.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Curriculum</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      <span>{course.sections?.length || 0} Sections</span>
                      <span className="mx-2">•</span>
                      <span>
                        {course.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0) || 0}{" "}
                        Lessons
                      </span>
                    </div>
<button
  onClick={() => navigate(`/my-learning/course-curriculum/${courseId}`)}
  className="bg-[#4f46e5] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#6366f1] transition duration-200"
>
  Start / Continue Learning
</button>

                  </div>
                </div>

                {course.sections && course.sections.length > 0 ? (
                  course.sections.map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          {expandedSections[section.id] ? (
                            <ChevronDown className="text-gray-500 mr-2" size={18} />
                          ) : (
                            <ChevronRight className="text-gray-500 mr-2" size={18} />
                          )}
                          <h4 className="font-medium text-gray-900">{section.name}</h4>
                        </div>
                        <div className="text-sm text-gray-600">
                          {section.lessons?.length || 0} lessons • {section.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0} min
                        </div>
                      </button>
                      {expandedSections[section.id] && section.lessons && section.lessons.length > 0 && (
                        <div className="divide-y divide-gray-200">
                          {section.lessons.map((lesson) => (
                            <div key={lesson.id} className="p-4 hover:bg-gray-50">
                              <div className="flex items-start space-x-3">
                                <div className="mt-1">
                                  {lesson.content_type === "VIDEO" && (
                                    <Play className="w-4 h-4 text-blue-500" />
                                  )}
                                  {lesson.content_type === "PDF" && (
                                    <BookOpen className="w-4 h-4 text-purple-500" />
                                  )}
                                  {lesson.content_type === "TEXT" && (
                                    <span className="w-4 h-4 text-gray-500">T</span>
                                  )}
                                  {lesson.content_type === "ASSESSMENT" && (
                                    <span className="w-4 h-4 text-red-500">Q</span>
                                  )}
                                  {lesson.content_type === "REFERENCE_LINK" && (
                                    <span className="w-4 h-4 text-green-500">L</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-800">{lesson.name}</h5>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 whitespace-nowrap">
                                  {lesson.duration || 0} min
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No curriculum sections available</div>
                )}
              </div>
            )}

            {activeTab === "instructor" && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Course instructor</h3>
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {course.instructor?.profile_picture ? (
                      <img
                        src={getImageUrl(course.instructor.profile_picture) || "/placeholder.svg"}
                        alt="Instructor"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="text-white" size={32} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-1">
                      {course.instructor?.firstname} {course.instructor?.lastname}
                    </h4>
                    <p className="text-gray-600 mb-3">{course.instructor?.title || "Instructor"}</p>

                    <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span>4.9 Course rating</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User size={16} />
                        <span>Students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen size={16} />
                        <span>Courses</span>
                      </div>
                    </div>

                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {course.instructor?.bio || "No bio available for this instructor."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        
      </div>
    </div>
  )
}

export default MyCourseView
