"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { userAPI } from "../../services/userApi"
import { chatAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import CertificateDisplay from "../../components/course/user/learning/CertificateDisplay"
import { CheckCircle, Lock, ArrowLeft, MessageCircle, BookOpen, Award } from "lucide-react"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"

const MyLearningCoursePage = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [courseProgress, setCourseProgress] = useState(null)
  const [sectionProgressMap, setSectionProgressMap] = useState({}) 
  const [lessonProgressMap, setLessonProgressMap] = useState({}) 
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isOpeningChat, setIsOpeningChat] = useState(false)

  // Show notification with auto-dismiss
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: '', type: '' }), 3000)
  }

  // Handle opening chat
  const handleOpenChat = async () => {
    try {
      setIsOpeningChat(true);
      const conversation = await chatAPI.getCourseConversation(courseId);
      navigate(`/chat?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Error opening chat:", error);
      showNotification("Failed to open chat. Please try again.", "error");
    } finally {
      setIsOpeningChat(false);
    }
  };

  // Fetch progress data with better error handling
  const fetchProgressData = useCallback(async (courseData) => {
    try {
      const [courseProg, sectionsProgRaw, lessonsProgRaw] = await Promise.all([
        userAPI.getCourseProgress(courseId).catch((err) => {
          console.warn('Course progress not found:', err)
          return null
        }),
        
        Promise.all(
          courseData.sections.map(async (section) => {
            try {
              return await userAPI.getSectionProgress(section.id)
            } catch (err) {
              console.warn(`Section progress not found for section ${section.id}:`, err)
              return null
            }
          })
        ),
        Promise.all(
          courseData.sections.flatMap((section) =>
            section.lessons.map(async (lesson) => {
              try {
                return await userAPI.getLessonProgress(lesson.id)
              } catch (err) {
                console.warn(`Lesson progress not found for lesson ${lesson.id}:`, err)
                return null
              }
            })
          )
        ),
      ])

      setCourseProgress(courseProg)

      const newSectionProgressMap = {}
      sectionsProgRaw.forEach((sp) => {
        if (sp) newSectionProgressMap[sp.section_id] = sp
      })
      setSectionProgressMap(newSectionProgressMap)

      const newLessonProgressMap = {}
      lessonsProgRaw.forEach((lp) => {
        if (lp) newLessonProgressMap[lp.lesson_id] = lp
      })
      setLessonProgressMap(newLessonProgressMap)

      return { courseProg, newSectionProgressMap, newLessonProgressMap }
    } catch (err) {
      console.error("Error fetching progress data:", err)
      throw err
    }
  }, [courseId])

  const fetchCourseAndProgressData = useCallback(async () => {
    try {
      setLoading(true)
      const courseData = await userAPI.getCourseDetails(courseId)
      setCourse(courseData)

      await fetchProgressData(courseData)
    } catch (err) {
      console.error("Error fetching course data:", err)
      setError("Failed to load course details.")
    } finally {
      setLoading(false)
    }
  }, [courseId, fetchProgressData])

  // Separate function to refresh progress data only
  const refreshProgressData = useCallback(async () => {
    if (!course || isRefreshing) return
    
    try {
      setIsRefreshing(true)
      await fetchProgressData(course)
    } catch (err) {
      console.error("Error refreshing progress data:", err)
    } finally {
      setIsRefreshing(false)
    }
  }, [course, fetchProgressData, isRefreshing])

  useEffect(() => {
    fetchCourseAndProgressData()
  }, []) // Remove fetchCourseAndProgressData from dependencies to prevent infinite loop

  const isLessonCompleted = (lessonId) => {
    return lessonProgressMap[lessonId]?.is_completed || false
  }

  const isSectionUnlocked = (sectionIndex) => {
    if (!course?.sections || sectionIndex === 0) return true // First section is always unlocked
    
    const prevSection = course.sections[sectionIndex - 1]
    if (!prevSection) return false
    
    return prevSection.lessons.every(lesson => isLessonCompleted(lesson.id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <LoadingSpinner />
        <Footer />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Error Loading Course</h1>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#1a1b3a] hover:bg-[#2a2b4a] text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  if (courseProgress?.is_completed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          {/* Certificate Generation Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <CertificateDisplay course={course} />
          </div>
          
          {/* Course Curriculum Section */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                Course Completed - You can now revisit any lesson
              </h2>
              <p className="text-gray-600 mb-6">
                Congratulations on completing the course! You can now revisit any lesson to refresh your knowledge.
              </p>
              
              {/* Action Buttons for Completed Course */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(`/my-learning/course-curriculum/${courseId}`)}
                  className="bg-[#1a1b3a] hover:bg-[#2a2b4a] text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Review Course Content
                </button>
                
                <button
                  onClick={() => navigate(`/my-learning/${courseId}?tab=certificate`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                >
                  <Award className="w-5 h-5 mr-2" />
                  View Certificate
                </button>
              </div>
            </div>
            
            {/* Curriculum Content */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Course Curriculum</h3>
                <p className="text-gray-600 mt-1">All lessons are now unlocked for review</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {course?.sections?.map((section, sectionIndex) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        {section.name}
                        <span className="ml-auto text-sm text-gray-500 bg-green-100 px-2 py-1 rounded">
                          {sectionProgressMap[section.id]?.progress_percentage?.toFixed(0) || 0}% Complete
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {section.lessons?.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="w-full p-3 rounded-lg border bg-gray-50 border-gray-200 flex items-center justify-between"
                          >
                            <span className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="font-medium">{lesson.name}</span>
                            </span>
                            <span className="text-sm text-gray-500">
                              {lesson.duration} {lesson.content_type === "VIDEO" ? "mins" : "min"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 
          notification.type === 'warning' ? 'bg-yellow-500 text-white' : 
          'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course Overview
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-gray-600 mb-6">{course.description}</p>
          
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Course Progress</h3>
              <p className="text-2xl font-bold text-blue-600">
                {courseProgress?.progress_percentage?.toFixed(0) || 0}%
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Lessons Completed</h3>
              <p className="text-2xl font-bold text-green-600">
                {Object.values(lessonProgressMap).filter(lp => lp?.is_completed).length} / {course?.sections?.flatMap(s => s.lessons).length || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Sections Unlocked</h3>
              <p className="text-2xl font-bold text-purple-600">
                {course?.sections?.filter((_, index) => isSectionUnlocked(index)).length || 0} / {course?.sections?.length || 0}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate(`/my-learning/course-curriculum/${courseId}`)}
              className="bg-[#1a1b3a] hover:bg-[#2a2b4a] text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Continue Learning
            </button>
            
            <button
              onClick={handleOpenChat}
              disabled={isOpeningChat}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center transition-colors duration-200"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {isOpeningChat ? "Opening..." : "Chat with Instructor"}
            </button>
          </div>
        </div>

        {/* Course Curriculum Overview */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
            <p className="text-gray-600 mt-1">Overview of what you'll learn</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {course?.sections?.map((section, sectionIndex) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    {isSectionUnlocked(sectionIndex) ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                    {section.name}
                    <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {sectionProgressMap[section.id]?.progress_percentage?.toFixed(0) || 0}% Complete
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {section.lessons?.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="w-full p-3 rounded-lg border flex items-center justify-between"
                      >
                        <span className="flex items-center gap-3">
                          {isLessonCompleted(lesson.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <span className="w-5 h-5 border-2 border-gray-300 rounded-full"></span>
                          )}
                          <span className="font-medium">{lesson.name}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {lesson.duration} {lesson.content_type === "VIDEO" ? "mins" : "min"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No curriculum sections available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default MyLearningCoursePage