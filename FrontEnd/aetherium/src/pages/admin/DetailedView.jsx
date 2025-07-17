import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { adminAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { ArrowLeft, Play, FileText, Link as LinkIcon, CheckCircle, BookOpen } from "lucide-react"

const DetailedView = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const data = await adminAPI.getCourse(courseId)
      setCourse(data)
      // Set the first section and first lesson as active by default
      if (data.sections?.length > 0) {
        setActiveSection(data.sections[0].id)
        if (data.sections[0].lessons?.length > 0) {
          setSelectedLesson(data.sections[0].lessons[0])
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith("http")) return imagePath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    return `${baseUrl}/${imagePath}`
  }

  const renderAssessmentQuestions = () => {
    if (!selectedLesson.assessments?.[0]?.questions?.length) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No questions available for this assessment</p>
        </div>
      )
    }

    const assessment = selectedLesson.assessments[0]
    const questions = assessment.questions

    return (
      <div className="space-y-6">
        {/* Assessment Header */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-600 mb-2">
            <CheckCircle size={20} />
            <h3 className="text-xl font-semibold">{assessment.title}</h3>
          </div>
          {assessment.description && (
            <p className="text-gray-700 mb-3">{assessment.description}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-gray-500">Passing Score</div>
              <div className="font-medium text-red-600">
                {assessment.passing_score || "Not specified"}%
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-gray-500">Max Attempts</div>
              <div className="font-medium text-red-600">
                {assessment.max_attempts || "Unlimited"}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-gray-500">Total Questions</div>
              <div className="font-medium text-red-600">
                {questions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Questions and Solutions */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Questions & Solutions
          </h4>
          
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                      Question {index + 1}
                    </span>
                    <span className="text-sm text-gray-500">
                      {question.points} point{question.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <h5 className="text-lg font-medium text-gray-900 mb-4">
                    {question.question_text}
                  </h5>
                </div>
              </div>

              {/* Answer Options */}
              <div className="space-y-2 mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Options:</div>
                {question.options.map((option, optionIndex) => {
                  const isCorrect = option === question.correct_answer
                  return (
                    <div
                      key={optionIndex}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        isCorrect
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isCorrect
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {isCorrect && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className={`flex-1 ${
                        isCorrect
                          ? 'text-green-800 font-medium'
                          : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                      {isCorrect && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Solution/Explanation Section */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Solution</span>
                </div>
                <p className="text-green-700">
                  The correct answer is: <span className="font-semibold">"{question.correct_answer}"</span>
                </p>
                {/* You can add more explanation here if available in your data structure */}
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Assessment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Points:</span>
              <span className="ml-2 font-medium">
                {questions.reduce((total, q) => total + q.points, 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Time Limit:</span>
              <span className="ml-2 font-medium">
                {assessment.time_limit ? `${assessment.time_limit} minutes` : 'No limit'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-2 font-medium">
                {new Date(assessment.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-2 font-medium ${
                assessment.is_active ? 'text-green-600' : 'text-red-600'
              }`}>
                {assessment.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderLessonContent = () => {
    if (!selectedLesson) return null

    switch (selectedLesson.content_type) {
      case "TEXT":
        return (
          <div className="prose max-w-none p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">{selectedLesson.name}</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {selectedLesson.lesson_content?.text_content || "No content available"}
            </p>
          </div>
        )
      case "PDF":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">{selectedLesson.name}</h3>
            <div className="flex items-center space-x-2 text-blue-600 mb-4">
              <FileText size={20} />
              <span>PDF Document</span>
            </div>
            {selectedLesson.lesson_content?.file_url ? (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedLesson.lesson_content.file_url)}&embedded=true`}
                className="w-full h-96 border border-gray-200 rounded-lg"
                title={selectedLesson.name}
              />
            ) : (
              <p className="text-gray-500">No PDF file available</p>
            )}
          </div>
        )
      case "VIDEO":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">{selectedLesson.name}</h3>
            {selectedLesson.lesson_content?.file_url ? (
              <video
                controls
                className="w-full rounded-lg"
                poster={selectedLesson.lesson_content.video_thumbnail ? getImageUrl(selectedLesson.lesson_content.video_thumbnail) : undefined}
              >
                <source src={getImageUrl(selectedLesson.lesson_content.file_url)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                No video file available
              </div>
            )}
          </div>
        )
      case "REFERENCE_LINK":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">{selectedLesson.name}</h3>
            <div className="flex items-center space-x-2 text-green-600 mb-4">
              <LinkIcon size={20} />
              <span>External Resource</span>
            </div>
            {selectedLesson.lesson_content?.external_url ? (
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <a
                  href={selectedLesson.lesson_content.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <h4 className="font-medium">
                    {selectedLesson.lesson_content.link_title || selectedLesson.lesson_content.external_url}
                  </h4>
                  {selectedLesson.lesson_content.link_description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedLesson.lesson_content.link_description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2 break-all">
                    {selectedLesson.lesson_content.external_url}
                  </p>
                </a>
              </div>
            ) : (
              <p className="text-gray-500">No link available</p>
            )}
          </div>
        )
      case "ASSESSMENT":
        return (
          <div className="bg-white rounded-lg border border-gray-200">
            {renderAssessmentQuestions()}
          </div>
        )
      default:
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">{selectedLesson.name}</h3>
            <p className="text-gray-500">No content available for this lesson type</p>
          </div>
        )
    }
  }

  if (loading) return <LoadingSpinner size="large" />
  if (!course) return <div className="p-8">Course not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/admin/courses/${courseId}/review`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            <span>Back to Review</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{course.title} - Detailed Curriculum</h1>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">Curriculum</h2>
              <div className="text-sm text-gray-600 mt-1">
                {course.sections?.length || 0} sections •{" "}
                {course.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0) || 0} lessons
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
              {course.sections?.map((section) => (
                <div key={section.id} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                    className={`w-full px-4 py-3 text-left font-medium flex items-center justify-between ${
                      activeSection === section.id ? "bg-gray-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <span>{section.name}</span>
                    <span className="text-sm text-gray-500">
                      {section.lessons?.length || 0} lessons
                    </span>
                  </button>
                  {activeSection === section.id && section.lessons?.length > 0 && (
                    <div className="divide-y divide-gray-100">
                      {section.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full px-6 py-3 text-left flex items-start space-x-3 ${
                            selectedLesson?.id === lesson.id
                              ? "bg-blue-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="mt-1 flex-shrink-0">
                            {lesson.content_type === "VIDEO" && (
                              <Play className="w-4 h-4 text-blue-500" />
                            )}
                            {lesson.content_type === "PDF" && (
                              <FileText className="w-4 h-4 text-purple-500" />
                            )}
                            {lesson.content_type === "TEXT" && (
                              <span className="w-4 h-4 text-gray-500 block">T</span>
                            )}
                            {lesson.content_type === "ASSESSMENT" && (
                              <CheckCircle className="w-4 h-4 text-red-500" />
                            )}
                            {lesson.content_type === "REFERENCE_LINK" && (
                              <LinkIcon className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 truncate">{lesson.name}</h4>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 mt-1 truncate">{lesson.description}</p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {lesson.duration || 0} min
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3">
            {selectedLesson ? (
              <div className="space-y-4">
                {renderLessonContent()}
                
                {/* Lesson Details - Only show for non-assessment lessons */}
                {selectedLesson.content_type !== "ASSESSMENT" && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="font-medium mb-2">Lesson Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Content Type</div>
                        <div className="font-medium capitalize">
                          {selectedLesson.content_type.toLowerCase().replace("_", " ")}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Duration</div>
                        <div className="font-medium">
                          {selectedLesson.duration || 0} minutes
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Created At</div>
                        <div className="font-medium">
                          {new Date(selectedLesson.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Active</div>
                        <div className="font-medium">
                          {selectedLesson.is_active ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <BookOpen className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a lesson</h3>
                <p className="text-gray-600">Choose a lesson from the sidebar to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailedView