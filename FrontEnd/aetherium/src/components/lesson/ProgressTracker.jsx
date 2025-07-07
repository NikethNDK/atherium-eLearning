"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, Award, Target } from "lucide-react"

const LessonProgress = ({ lesson, progress, onUpdateProgress }) => {
  const isCompleted = progress?.is_completed || false
  const score = progress?.score || 0

  const handleToggleComplete = () => {
    onUpdateProgress(lesson.id, {
      is_completed: !isCompleted,
      progress_percentage: !isCompleted ? 100 : 0,
      completed_at: !isCompleted ? new Date().toISOString() : null,
    })
  }

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case "TEXT":
        return "📝"
      case "PDF":
        return "📄"
      case "VIDEO":
        return "🎥"
      case "REFERENCE_LINK":
        return "🔗"
      case "ASSESSMENT":
        return "📝"
      default:
        return "📚"
    }
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        isCompleted ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={handleToggleComplete}
          className={`flex-shrink-0 ${isCompleted ? "text-green-600" : "text-gray-400 hover:text-green-600"}`}
        >
          {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-lg">{getContentIcon(lesson.content_type)}</span>
          <div>
            <h4 className={`font-medium ${isCompleted ? "text-green-900" : "text-gray-900"}`}>{lesson.name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="capitalize">{lesson.content_type.toLowerCase()}</span>
              {lesson.duration && (
                <>
                  <span>•</span>
                  <span>{lesson.duration} min</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {lesson.content_type === "ASSESSMENT" && score > 0 && (
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-blue-600" />
          <span className={`text-sm font-medium ${score >= 70 ? "text-green-600" : "text-red-600"}`}>{score}%</span>
        </div>
      )}
    </div>
  )
}

const SectionProgress = ({ section, sectionProgress, onUpdateProgress }) => {
  const completedLessons = section.lessons.filter(
    (lesson) => sectionProgress.find((p) => p.lesson_id === lesson.id)?.is_completed,
  ).length

  const totalLessons = section.lessons.length
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{section.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>
              {completedLessons}/{totalLessons} completed
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {section.lessons.map((lesson) => {
          const lessonProgress = sectionProgress.find((p) => p.lesson_id === lesson.id)
          return (
            <LessonProgress
              key={lesson.id}
              lesson={lesson}
              progress={lessonProgress}
              onUpdateProgress={onUpdateProgress}
            />
          )
        })}
      </div>
    </div>
  )
}

const CourseProgressTracker = ({ course, userProgress, onUpdateProgress }) => {
  const [overallProgress, setOverallProgress] = useState(0)
  const [canGenerateCertificate, setCanGenerateCertificate] = useState(false)

  useEffect(() => {
    calculateOverallProgress()
  }, [userProgress, course.sections])

  const calculateOverallProgress = () => {
    const totalLessons = course.sections.reduce((total, section) => total + section.lessons.length, 0)

    const completedLessons = userProgress.filter((p) => p.is_completed).length
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

    setOverallProgress(progress)
    setCanGenerateCertificate(progress === 100)
  }

  const handleGenerateCertificate = async () => {
    try {
      // API call to generate certificate
      const response = await fetch(`/api/courses/${course.id}/certificate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${course.title}-certificate.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error generating certificate:", error)
    }
  }

  const getProgressColor = (progress) => {
    if (progress === 100) return "text-green-600"
    if (progress >= 70) return "text-blue-600"
    if (progress >= 30) return "text-yellow-600"
    return "text-gray-600"
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
            <p className="text-gray-600">Track your learning progress</p>
          </div>

          {canGenerateCertificate && (
            <button
              onClick={handleGenerateCertificate}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Award className="w-4 h-4 mr-2" />
              Get Certificate
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className={`text-sm font-medium ${getProgressColor(overallProgress)}`}>
                {Math.round(overallProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  overallProgress === 100 ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${getProgressColor(overallProgress)}`}>
              {Math.round(overallProgress)}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      </div>

      {/* Progress by Section */}
      <div className="space-y-4">
        {course.sections.map((section) => {
          const sectionProgress = userProgress.filter((p) =>
            section.lessons.some((lesson) => lesson.id === p.lesson_id),
          )

          return (
            <SectionProgress
              key={section.id}
              section={section}
              sectionProgress={sectionProgress}
              onUpdateProgress={onUpdateProgress}
            />
          )
        })}
      </div>

      {/* Completion Message */}
      {canGenerateCertificate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Award className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">Congratulations! 🎉</h3>
          <p className="text-green-700 mb-4">You have successfully completed all lessons in this course.</p>
          <button
            onClick={handleGenerateCertificate}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Download Your Certificate
          </button>
        </div>
      )}
    </div>
  )
}

export default CourseProgressTracker
