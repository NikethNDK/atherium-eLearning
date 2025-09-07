import { useState, useEffect } from "react";
import { userAPI } from "../../../services/userApi"
import TextContent from "./lesson-types/TextContent";
import VideoContent from "./lesson-types/VideoContent";
import PdfContent from "./lesson-types/VideoContent";
import AssessmentContent from "./lesson-types/AssessmentContent";
import CompletionMessage from "./CompletionMessage";

const LessonContent = ({ lesson, courseId, onLessonComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lesson) {
      // Check if this lesson is already completed
      userAPI.getLessonProgress(lesson.id).then((progress) => {
        setIsCompleted(progress?.is_completed || false);
      });
    }
  }, [lesson]);

  const handleCompleteLesson = async () => {
    try {
      setLoading(true);
      await userAPI.completeLesson(lesson.id);
      setIsCompleted(true);
      setShowCompletion(true);
      onLessonComplete();
    } catch (error) {
      console.error("Error completing lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!lesson) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <p className="text-gray-500">Select a lesson to begin</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (lesson.content_type) {
      case "TEXT":
        return <TextContent content={lesson.lesson_content} />;
      case "VIDEO":
        return <VideoContent content={lesson.lesson_content} lessonId={lesson.id} />;
      case "PDF":
        return <PdfContent content={lesson.lesson_content} />;
      case "ASSESSMENT":
        return (
          <AssessmentContent 
            assessment={lesson.assessments?.[0]} 
            onComplete={handleCompleteLesson}
          />
        );
      default:
        return <p>Unsupported content type</p>;
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {showCompletion && (
        <CompletionMessage 
          onClose={() => setShowCompletion(false)}
          courseId={courseId}
          isCourseComplete={false} // You would check this from course progress
        />
      )}
      
      <h2 className="text-2xl font-bold mb-4">{lesson.name}</h2>
      {lesson.description && (
        <p className="text-gray-600 mb-6">{lesson.description}</p>
      )}
      
      <div className="mb-8">
        {renderContent()}
      </div>
      
      {lesson.content_type !== "ASSESSMENT" && !isCompleted && (
        <button
          onClick={handleCompleteLesson}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Marking..." : "Mark as Complete"}
        </button>
      )}
    </div>
  );
};

export default LessonContent;