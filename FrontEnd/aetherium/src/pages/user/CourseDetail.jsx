import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import CourseHero from "./CourseHero";
import CoursePurchaseCard from "./CoursePurchaseCard";
import CourseContent from "../../components/course/CourseContent";
import RelatedCourses from "../../components/course/RelatedCourses";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { userAPI } from "../../services/userApi";
import { useAuth } from "../../context/AuthContext";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      if (isAuthenticated) {
        checkPurchaseStatus();
      }
    }
  }, [courseId, isAuthenticated]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getCourseDetails(courseId);
      setCourse(data);
      const relatedData = await userAPI.getPublishedCourses({
        category: data.category_id,
        limit: 4,
      });
      setRelatedCourses(relatedData.courses || []);
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError(
        error.response?.status === 404
          ? "Course not found."
          : "Failed to load course details."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const status = await userAPI.checkCoursePurchase(courseId);
      setIsPurchased(status.is_purchased);
    } catch (error) {
      console.error("Error checking purchase status:", error);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setPurchasing(true);
  };

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
            Course Not Found
          </h1>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            {error || "The course you are looking for does not exist."}
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
          >
            Browse All Courses
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CourseHero course={course} />
      <p></p>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <CourseContent course={course} isPurchased={isPurchased} onPurchase={handlePurchase} />
          </div>
          <CoursePurchaseCard
            course={course}
            isPurchased={isPurchased}
            purchasing={purchasing}
            setPurchasing={setPurchasing}
            setIsPurchased={setIsPurchased}
          />
        </div>
      </div>
      <RelatedCourses relatedCourses={relatedCourses} />
      <Footer />
    </div>
  );
};

export default CourseDetail;