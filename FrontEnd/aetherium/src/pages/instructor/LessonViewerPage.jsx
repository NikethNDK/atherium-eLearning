
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import LessonRibbon from "../../components/lesson/LessonRibbon"
import AssessmentTaker from "../../components/lesson/AssessmentTaker"

const LessonContent = ({ lesson, onComplete }) => {
  const renderContent = () => {
    switch (lesson.content_type) {
      case "TEXT":
        return (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{lesson.content?.text}</div>
          </div>
        )

      case "PDF":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">PDF Document</h3>
            {lesson.content?.description && <p className="text-gray-600">{lesson.content.description}</p>}
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-600">PDF viewer would be implemented here</p>
              <p className="text-sm text-gray-500 mt-2">File: {lesson.content?.fileName}</p>
            </div>
          </div>
        )

      case "VIDEO":
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-white">Video player would be implemented here</p>
            </div>
            {lesson.content?.description && <p className="text-gray-600">{lesson.content.description}</p>}
          </div>
        )

      case "REFERENCE_LINK":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{lesson.content?.title}</h3>
            {lesson.content?.description && <p className="text-gray-600">{lesson.content.description}</p>}
            <a
              href={lesson.content?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Visit Link
            </a>
          </div>
        )

      default:
        return <p className="text-gray-500">Content type not supported</p>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{lesson.name}</h2>
        {lesson.description && <p className="text-gray-600">{lesson.description}</p>}
      </div>

      {renderContent()}

      {lesson.content_type !== "ASSESSMENT" && (
        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={() => onComplete(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Mark as Complete
          </button>
        </div>
      )}
    </div>
  )
}

const LessonViewerPage = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [currentLessonId, setCurrentLessonId] = useState(null)
  const [userProgress, setUserProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
    fetchUserProgress()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      // Mock API call - replace with actual API
      const mockCourse = {
        id: courseId,
        title: "Complete Web Development Course",
        sections: [
          {
            id: 1,
            name: "Introduction to HTML",
            lessons: [
              {
                id: 1,
                name: "HTML Basics",
                content_type: "TEXT",
                duration: 15,
                description: "Learn the fundamentals of HTML",
                content: { text: "HTML is the standard markup language for creating web pages..." },
              },
              {
                id: 2,
                name: "HTML Quiz",
                content_type: "ASSESSMENT",
                duration: 10,
                description: "Test your HTML knowledge",
                assessment: {
                  title: "HTML Basics Quiz",
                  description: "Test your understanding of HTML fundamentals",
                  passing_score: 70,
                  questions: [
                    {
                      question_text: "What does HTML stand for?",
                      options: [
                        { text: "HyperText Markup Language", is_correct: true },
                        { text: "High Tech Modern Language", is_correct: false },
                        { text: "Home Tool Markup Language", is_correct: false },
                        { text: "Hyperlink and Text Markup Language", is_correct: false },
                      ],
                      points: 1,
                      time_limit: 30,
                    },
                  ],
                },
              },
            ],
          },
        ],
      }
      setCourse(mockCourse)
      setCurrentLessonId(mockCourse.sections[0]?.lessons[0]?.id)
    } catch (error) {
      console.error("Error fetching course:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProgress = async () => {
    try {
      // Mock progress data
      setUserProgress([])
    } catch (error) {
      console.error("Error fetching progress:", error)
    }
  }

  const handleLessonClick = (lessonId) => {
    setCurrentLessonId(lessonId)
  }

  const handleUpdateProgress = async (lessonId, progressData) => {
    try {
      // Update progress in backend
      const updatedProgress = userProgress.filter((p) => p.lesson_id !== lessonId)
      updatedProgress.push({
        lesson_id: lessonId,
        ...progressData,
      })
      setUserProgress(updatedProgress)
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const handleUpdateScore = async (score) => {
    if (currentLessonId) {
      await handleUpdateProgress(currentLessonId, {
        is_completed: score >= 70,
        progress_percentage: 100,
        score: score,
        completed_at: new Date().toISOString(),
      })
    }
  }

  const handleLessonComplete = async (completed) => {
    if (currentLessonId) {
      await handleUpdateProgress(currentLessonId, {
        is_completed: completed,
        progress_percentage: completed ? 100 : 0,
        completed_at: completed ? new Date().toISOString() : null,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Course not found</p>
      </div>
    )
  }

  const allLessons = course.sections.flatMap((section) => section.lessons)
  const currentLesson = allLessons.find((lesson) => lesson.id === currentLessonId)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LessonRibbon
        lessons={allLessons}
        progress={userProgress}
        onLessonClick={handleLessonClick}
        currentLessonId={currentLessonId}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {currentLesson ? (
            currentLesson.content_type === "ASSESSMENT" ? (
              <AssessmentTaker
                assessment={currentLesson.assessment}
                onComplete={handleLessonComplete}
                onUpdateScore={handleUpdateScore}
              />
            ) : (
              <LessonContent lesson={currentLesson} onComplete={handleLessonComplete} />
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Select a lesson to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LessonViewerPage
