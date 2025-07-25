"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { userAPI } from "../../services/userApi"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import LessonContentDisplay from "../../components/course/user/learning/LessonContentDisplay"
import CertificateDisplay from "../../components/course/user/learning/CertificateDisplay"
import { ChevronLeft, ChevronRight, CheckCircle, Lock, ArrowLeft } from "lucide-react"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"

const MyLearningCoursePage = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [courseProgress, setCourseProgress] = useState(null)
  const [sectionProgressMap, setSectionProgressMap] = useState({}) 
  const [lessonProgressMap, setLessonProgressMap] = useState({}) 
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const allLessons = course?.sections?.flatMap((section) => section.lessons) || []

  // Show notification with auto-dismiss
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: '', type: '' }), 3000)
  }

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

      const { newLessonProgressMap } = await fetchProgressData(courseData)

      // Set initial active lesson if not already set
      if (!activeLessonId && courseData.sections.length > 0) {
        const allCourseLessons = courseData.sections.flatMap((section) => section.lessons)
        // Find the first incomplete lesson, or the first lesson if all are complete
        const firstIncompleteLesson = allCourseLessons.find((lesson) => !newLessonProgressMap[lesson.id]?.is_completed)
        setActiveLessonId(firstIncompleteLesson ? firstIncompleteLesson.id : allCourseLessons[0].id)
      }
    } catch (err) {
      console.error("Error fetching course data:", err)
      setError("Failed to load course details.")
    } finally {
      setLoading(false)
    }
  }, [courseId, fetchProgressData, activeLessonId])

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

  const handleLessonComplete = useCallback(
    async (lessonId) => {
      // Only refresh progress data, not the entire course
      await refreshProgressData()
      const lessonName = allLessons.find(l => l.id === lessonId)?.name
      showNotification(`Lesson "${lessonName}" completed successfully!`, 'success')
    },
    [refreshProgressData, allLessons],
  )

  const handleQuizComplete = useCallback(
    async (lessonId, score, totalPoints) => {
      const lessonName = allLessons.find((l) => l.id === lessonId)?.name
      showNotification(`Quiz for "${lessonName}" completed! Score: ${score}/${totalPoints}`, 'success')
      await handleLessonComplete(lessonId)
    },
    [allLessons, handleLessonComplete],
  )

  const getLessonIndex = (lessonId) => {
    return allLessons.findIndex((lesson) => lesson.id === lessonId)
  }

  const getCurrentSectionIndex = (lessonId) => {
    if (!course?.sections || !lessonId) return -1
    
    for (let i = 0; i < course.sections.length; i++) {
      if (course.sections[i].lessons.some(lesson => lesson.id === lessonId)) {
        return i
      }
    }
    return -1
  }

  const isCurrentSectionCompleted = (lessonId) => {
    if (!course?.sections || !lessonId) return false
    
    const currentSectionIndex = getCurrentSectionIndex(lessonId)
    if (currentSectionIndex === -1) return false
    
    const currentSection = course.sections[currentSectionIndex]
    return currentSection.lessons.every(lesson => isLessonCompleted(lesson.id))
  }

  const getNextAvailableLesson = (currentLessonId) => {
    if (!course?.sections || !currentLessonId) return null
    
    const currentIndex = getLessonIndex(currentLessonId)
    const currentSectionIndex = getCurrentSectionIndex(currentLessonId)
    
    // Check if there's a next lesson in the current section
    const currentSection = course.sections[currentSectionIndex]
    const currentLessonIndexInSection = currentSection.lessons.findIndex(l => l.id === currentLessonId)
    
    // If there's a next lesson in the current section
    if (currentLessonIndexInSection < currentSection.lessons.length - 1) {
      return currentSection.lessons[currentLessonIndexInSection + 1]
    }
    
    // If this is the last lesson in the section and section is completed
    if (isCurrentSectionCompleted(currentLessonId)) {
      // Move to the first lesson of the next section
      if (currentSectionIndex < course.sections.length - 1) {
        const nextSection = course.sections[currentSectionIndex + 1]
        return nextSection.lessons[0]
      }
    }
    
    return null
  }

  const goToNextLesson = () => {
    if (!activeLessonId || !course?.sections) return
    
    const currentLessonCompleted = isLessonCompleted(activeLessonId)
    
    if (!currentLessonCompleted) {
      showNotification('Please complete the current lesson before proceeding to the next one.', 'warning')
      return
    }

    const nextLesson = getNextAvailableLesson(activeLessonId)
    
    if (nextLesson) {
      setActiveLessonId(nextLesson.id)
      const nextSectionIndex = getCurrentSectionIndex(nextLesson.id)
      const currentSectionIndex = getCurrentSectionIndex(activeLessonId)
      
      if (nextSectionIndex !== currentSectionIndex) {
        showNotification(`Section completed! Moving to: ${course.sections[nextSectionIndex].name}`, 'success')
      } else {
        showNotification(`Moved to next lesson: ${nextLesson.name}`, 'success')
      }
    } else {
      const currentSectionIndex = getCurrentSectionIndex(activeLessonId)
      if (currentSectionIndex < course.sections.length - 1) {
        if (isCurrentSectionCompleted(activeLessonId)) {
          // This shouldn't happen if getNextAvailableLesson works correctly
          showNotification('Moving to next section...', 'success')
        } else {
          showNotification('Complete all lessons in this section to unlock the next section.', 'warning')
        }
      } else {
        showNotification('Congratulations! You have completed all lessons in this course.', 'success')
      }
    }
  }

  const goToPreviousLesson = () => {
    const currentIndex = getLessonIndex(activeLessonId)
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1]
      setActiveLessonId(prevLesson.id)
      showNotification(`Moved to previous lesson: ${prevLesson.name}`, 'success')
    }
  }

  const isSectionUnlocked = (sectionIndex) => {
    if (!course?.sections || sectionIndex === 0) return true // First section is always unlocked
    
    const prevSection = course.sections[sectionIndex - 1]
    if (!prevSection) return false
    
    return prevSection.lessons.every(lesson => isLessonCompleted(lesson.id))
  }

  const isLessonCompleted = (lessonId) => {
    return lessonProgressMap[lessonId]?.is_completed || false
  }

  const canAccessNextLesson = (currentLessonId) => {
    if (!currentLessonId || !course?.sections) return false
    
    const currentLessonCompleted = isLessonCompleted(currentLessonId)
    if (!currentLessonCompleted) return false
    
    const nextLesson = getNextAvailableLesson(currentLessonId)
    return nextLesson !== null
  }

  const activeLesson = allLessons.find((lesson) => lesson.id === activeLessonId)
  const currentSectionIndex = activeLessonId ? getCurrentSectionIndex(activeLessonId) : -1

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
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center justify-between ${
                              activeLessonId === lesson.id
                                ? "bg-blue-50 border-blue-300 text-blue-900"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              {isLessonCompleted(lesson.id) ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                              )}
                              <span className="font-medium">{lesson.name}</span>
                            </span>
                            <span className="text-sm text-gray-500">
                              {lesson.duration} {lesson.content_type === "VIDEO" ? "mins" : "min"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Lesson Content Display for Completed Course */}
            {activeLesson && (
              <div className="mt-8">
                <LessonContentDisplay
                  lesson={activeLesson}
                  onLessonComplete={handleLessonComplete}
                  onQuizComplete={handleQuizComplete}
                />
                <div className="mt-8 flex justify-between items-center">
                  <button
                    onClick={goToPreviousLesson}
                    disabled={getLessonIndex(activeLessonId) === 0}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous Lesson
                  </button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Lesson {getLessonIndex(activeLessonId) + 1} of {allLessons.length}
                    </p>
                    {currentSectionIndex !== -1 && (
                      <p className="text-xs text-gray-500">
                        Section: {course.sections[currentSectionIndex].name}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={goToNextLesson}
                    disabled={getLessonIndex(activeLessonId) === allLessons.length - 1}
                    className="bg-[#1a1b3a] hover:bg-[#2a2b4a] text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
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

      {/* Sidebar for Curriculum */}
      <aside className="w-full lg:w-80 bg-[#1a1b3a] shadow-lg p-4 lg:p-6 border-b lg:border-r border-gray-700 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white hover:text-gray-300 mb-4 transition-colors duration-200 py-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course Overview
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Course Curriculum</h2>
        <nav className="space-y-4">
          {course?.sections?.map((section, sectionIndex) => (
            <div key={section.id} className="border-b border-gray-600 pb-4 last:border-b-0">
              <h3 className="font-semibold text-white mb-2 flex items-center">
                {isSectionUnlocked(sectionIndex) ? (
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                )}
                {section.name}
                <span className="ml-auto text-sm text-gray-300">
                  {sectionProgressMap[section.id]?.progress_percentage?.toFixed(0) || 0}%
                </span>
              </h3>
              <ul className="space-y-2 pl-2">
                {section.lessons?.map((lesson) => (
                  <li key={lesson.id}>
                    <button
                      onClick={() => {
                        if (isSectionUnlocked(sectionIndex)) {
                          setActiveLessonId(lesson.id)
                        }
                      }}
                      disabled={!isSectionUnlocked(sectionIndex)}
                      className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between transition-colors duration-200
                        ${
                          activeLessonId === lesson.id
                            ? "bg-blue-600 text-white font-medium"
                            : isSectionUnlocked(sectionIndex) 
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-500"
                        }
                        ${!isSectionUnlocked(sectionIndex) && "opacity-60 cursor-not-allowed"}
                      `}
                    >
                      <span className="flex items-center">
                        {isLessonCompleted(lesson.id) ? (
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        ) : (
                          <span className="w-4 h-4 mr-2 border border-gray-400 rounded-full flex-shrink-0"></span>
                        )}
                        {lesson.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {lesson.duration} {lesson.content_type === "VIDEO" ? "mins" : "min"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-300">
              No curriculum sections available
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {activeLesson ? (
          <>
            <LessonContentDisplay
              lesson={activeLesson}
              onLessonComplete={handleLessonComplete}
              onQuizComplete={handleQuizComplete}
            />
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={goToPreviousLesson}
                disabled={getLessonIndex(activeLessonId) === 0}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous Lesson
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Lesson {getLessonIndex(activeLessonId) + 1} of {allLessons.length}
                </p>
                {currentSectionIndex !== -1 && (
                  <p className="text-xs text-gray-500">
                    Section: {course.sections[currentSectionIndex].name}
                  </p>
                )}
              </div>

              <button
                onClick={goToNextLesson}
                disabled={!canAccessNextLesson(activeLessonId)}
                className="bg-[#1a1b3a] hover:bg-[#2a2b4a] text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Please select a lesson from the sidebar to begin.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default MyLearningCoursePage