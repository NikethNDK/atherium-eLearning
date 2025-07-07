"use client"

import { CheckCircle, Circle, Award, Clock, FileText, Video, Link, FileQuestion } from "lucide-react"

const LessonRibbon = ({ lessons, progress, onLessonClick, currentLessonId }) => {
  const getContentIcon = (contentType) => {
    switch (contentType) {
      case "TEXT":
        return <FileText className="w-4 h-4" />
      case "PDF":
        return <FileText className="w-4 h-4" />
      case "VIDEO":
        return <Video className="w-4 h-4" />
      case "REFERENCE_LINK":
        return <Link className="w-4 h-4" />
      case "ASSESSMENT":
        return <FileQuestion className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getLessonProgress = (lessonId) => {
    return progress.find((p) => p.lesson_id === lessonId)
  }

  const getLessonScore = (lessonId) => {
    const lessonProgress = getLessonProgress(lessonId)
    return lessonProgress?.score || 0
  }

  return (
    <div className="bg-white border-r border-gray-200 w-80 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Course Content</h2>
      </div>

      <div className="p-2">
        {lessons.map((lesson, index) => {
          const lessonProgress = getLessonProgress(lesson.id)
          const isCompleted = lessonProgress?.is_completed || false
          const score = getLessonScore(lesson.id)
          const isCurrentLesson = lesson.id === currentLessonId

          return (
            <button
              key={lesson.id}
              onClick={() => onLessonClick(lesson.id)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-all ${
                isCurrentLesson ? "bg-blue-50 border-2 border-blue-200" : "hover:bg-gray-50 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="text-gray-500">{getContentIcon(lesson.content_type)}</div>
                    <span className="text-sm font-medium text-gray-900 truncate">{lesson.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="capitalize">{lesson.content_type.toLowerCase().replace("_", " ")}</span>
                      {lesson.duration && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{lesson.duration}m</span>
                          </div>
                        </>
                      )}
                    </div>

                    {lesson.content_type === "ASSESSMENT" && score > 0 && (
                      <div className="flex items-center space-x-1">
                        <Award className="w-3 h-3 text-yellow-500" />
                        <span className={`text-xs font-medium ${score >= 70 ? "text-green-600" : "text-red-600"}`}>
                          {score}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LessonRibbon
