"use client"

import { useState, useEffect, useRef } from "react"
import { userAPI } from "../../../../services/userApi"
import QuizComponent from "./QuizComponent"

const LessonContentDisplay = ({ lesson, onLessonComplete, onQuizComplete }) => {
  const [lessonProgress, setLessonProgress] = useState(null)
  const videoRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progress = await userAPI.getLessonProgress(lesson.id)
        setLessonProgress(progress)
      } catch (error) {
        console.error("Error fetching lesson progress:", error)
        setLessonProgress(null) // Reset if not found or error
      }
    }

    fetchProgress()

    // Cleanup for video interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [lesson.id])

  const handleMarkComplete = async () => {
    try {
      // Payload for updateLessonProgress: { progress_percentage: 100.0, is_completed: true }
      // Or use the dedicated completeLesson endpoint which does this automatically
      await userAPI.completeLesson(lesson.id)
      setLessonProgress((prev) => ({ ...prev, is_completed: true, progress_percentage: 100 }))
      onLessonComplete(lesson.id)
      alert(`Lesson "${lesson.name}" marked as complete!`)
    } catch (error) {
      console.error("Error marking lesson complete:", error)
      alert("Failed to mark lesson complete. Please try again.")
    }
  }

  const handleVideoPlay = () => {
    if (videoRef.current && lesson.content_type === "VIDEO") {
      // Start updating time spent every 5 seconds
      intervalRef.current = setInterval(async () => {
        const currentTime = videoRef.current.currentTime
        try {
          // Payload for updateLessonTime: { time_spent: int }
          await userAPI.updateLessonTime(lesson.id, Math.floor(currentTime))
        } catch (error) {
          console.error("Error updating video time:", error)
        }
      }, 5000) // Update every 5 seconds
    }
  }

  const handleVideoPause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const handleVideoEnded = async () => {
    if (!lessonProgress?.is_completed) {
      await handleMarkComplete()
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const renderContent = () => {
    if (!lesson) {
      return <p className="text-gray-600">Select a lesson to view its content.</p>
    }

    switch (lesson.content_type) {
      case "TEXT":
        return (
          <div className="prose max-w-none">
            <p>{lesson.lesson_content?.text_content || "No text content available."}</p>
            {!lessonProgress?.is_completed && (
              <button
                onClick={handleMarkComplete}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Mark as Complete
              </button>
            )}
          </div>
        )
      case "PDF":
        return (
          <div>
            {lesson.lesson_content?.file_url ? (
              <>
                {/* Use file_url directly as it's from Cloudinary */}
                <iframe
                  src={lesson.lesson_content.file_url}
                  className="w-full h-[600px] border rounded-lg"
                  title={lesson.name}
                ></iframe>
                <a
                  href={lesson.lesson_content.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm"
                >
                  Download PDF
                </a>
              </>
            ) : (
              <p>No PDF content available.</p>
            )}
            {!lessonProgress?.is_completed && (
              <button
                onClick={handleMarkComplete}
                className="mt-4 ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Mark as Complete
              </button>
            )}
          </div>
        )
      case "VIDEO":
        return (
          <div>
            {lesson.lesson_content?.file_url ? (
              <video
                ref={videoRef}
                src={lesson.lesson_content.file_url} // Use file_url directly as it's from Cloudinary
                controls
                className="w-full rounded-lg shadow-md"
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnded}
                // If you have a video thumbnail, you might use getImageUrl here:
                // poster={getImageUrl(lesson.lesson_content.video_thumbnail)}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <p>No video content available.</p>
            )}
            {lessonProgress?.is_completed && <p className="mt-4 text-green-600 font-medium">Video completed!</p>}
          </div>
        )
      case "ASSESSMENT":
        return (
          <QuizComponent
            assessment={lesson.assessments?.[0]} // Assuming one assessment per lesson
            onQuizComplete={(score, totalPoints) => {
              onQuizComplete(lesson.id, score, totalPoints)
              handleMarkComplete() // Mark lesson complete after quiz
            }}
            isCompleted={lessonProgress?.is_completed}
          />
        )
      default:
        return <p className="text-gray-600">Unsupported content type: {lesson.content_type}</p>
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{lesson?.name}</h2>
      <p className="text-gray-600 mb-6">{lesson?.description}</p>
      {renderContent()}
    </div>
  )
}

export default LessonContentDisplay
