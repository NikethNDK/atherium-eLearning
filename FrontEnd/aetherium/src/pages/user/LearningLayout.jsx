import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI } from "../../services/userApi";
import { useAuth } from "../../context/AuthContext";
import CourseSidebar from "../../components/course/user/CourseSidebar";
import LessonContent from "../../components/course/user/LessonContent";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

const LearningLayout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, progressData] = await Promise.all([
          userAPI.getCourseDetails(courseId),
          userAPI.getCourseProgress(courseId),
        ]);
        
        setCourse(courseData);
        setProgress(progressData);
        
        // Find the first incomplete lesson or default to first lesson
        const firstSection = courseData.sections?.[0];
        const firstLesson = firstSection?.lessons?.[0];
        setCurrentLesson(firstLesson);
      } catch (err) {
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <LoadingSpinner />
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            {error || "Course not found"}
          </h1>
          <button
            onClick={() => navigate("/my-learning")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to My Learning
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <CourseSidebar 
          course={course} 
          progress={progress}
          currentLesson={currentLesson}
          setCurrentLesson={setCurrentLesson}
        />
        <LessonContent 
          lesson={currentLesson} 
          courseId={courseId}
          onLessonComplete={() => {
            // Refresh progress after completion
            userAPI.getCourseProgress(courseId).then(setProgress);
          }}
        />
      </div>
      <Footer />
    </div>
  );
};

export default LearningLayout;