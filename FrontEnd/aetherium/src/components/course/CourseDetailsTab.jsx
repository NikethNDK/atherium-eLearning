


import { useState, useEffect, useContext } from "react";
import { Lock } from "lucide-react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import { userAPI } from "../../services/userApi";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../common/ImageURL";
const CourseDetailsTab = ({ course, isPurchased, onPurchase }) => {
  const { user } = useAuth();
  console.log('CourseDetailsTab rendered with course:', course);
  console.log('Course ID:', course?.id);
  console.log('isPurchased:', isPurchased);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ total: 0, average_rating: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userHasReview, setUserHasReview] = useState(false);
  const [userExistingReview, setUserExistingReview] = useState(null);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Curriculum" },
    { id: "instructor", label: "Instructor" },
    { id: "reviews", label: "Reviews" },
  ];

  // Fetch reviews when reviews tab is active
  useEffect(() => {
    console.log('useEffect triggered - activeTab:', activeTab, 'course.id:', course.id);
    if (activeTab === "reviews") {
      console.log('Reviews tab active, fetching reviews...');
      fetchReviews();
    }
  }, [activeTab, course.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('Fetching reviews for course:', course.id, 'page:', currentPage);
      const response = await userAPI.getCourseReviews(course.id, currentPage);
      console.log('Reviews API response:', response);
      console.log('Response structure:', {
        reviews: response.reviews,
        total: response.total,
        average_rating: response.average_rating,
        hasReviews: !!response.reviews,
        reviewsLength: response.reviews?.length
      });
      
      setReviews(response.reviews || []);
      setReviewStats({
        total: response.total || 0,
        average_rating: response.average_rating || 0
      });
      
      // Check if current user already has a review
      if (response.reviews && response.reviews.length > 0 && user) {
        const currentUserReview = response.reviews.find(review => review.user_id === user.id);
        setUserHasReview(!!currentUserReview);
        setUserExistingReview(currentUserReview || null);
        console.log('User has review:', !!currentUserReview, 'User ID:', user.id);
      }
      
      console.log('Reviews state updated:', response.reviews);
      console.log('Review stats updated:', response.total, response.average_rating);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      // Set empty reviews on error for debugging
      setReviews([]);
      setReviewStats({ total: 0, average_rating: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await userAPI.createCourseReview(course.id, reviewData);
      setShowReviewForm(false);
      // Refresh reviews
      await fetchReviews();
      console.log('Review submitted successfully');
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  };

  const handleReviewUpdate = async (reviewData) => {
    try {
      await userAPI.updateCourseReview(course.id, reviewData);
      setShowReviewForm(false);
      // Refresh reviews
      await fetchReviews();
      console.log('Review submitted successfully');
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  };  

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <nav className="flex flex-wrap gap-2 sm:gap-3 justify-start min-w-full">
          {tabs.map((tab, index) => {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  console.log('Tab clicked:', tab.id);
                  if (tab.id === 'reviews') {
                    console.log('Reviews tab clicked, will trigger useEffect');
                  }
                  setActiveTab(tab.id);
                }}
                className={`py-2 px-3 sm:px-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="text-sm sm:text-base text-gray-700">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Course Description</h2>
            <p>{course.description || "No description available."}</p>
            <h2 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">
              What You'll Learn
            </h2>
            <ul className="list-disc pl-4 sm:pl-5">
              {course.learning_objectives?.map((obj, index) => (
                <li key={index} className="mb-1 sm:mb-2">{obj.description}</li>
              ))}
            </ul>
            <h2 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">
              Requirements
            </h2>
            <ul className="list-disc pl-4 sm:pl-5">
              {course.requirements?.map((req, index) => (
                <li key={index} className="mb-1 sm:mb-2">{req.description}</li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === "curriculum" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Course Curriculum</h2>
            {isPurchased ? (
              course.sections?.length > 0 ? (
                course.sections.map((section, index) => (
                  <div key={index} className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">
                      {section.name}
                    </h3>
                    <ul className="list-disc pl-4 sm:pl-5 mt-2">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <li key={lessonIndex} className="mb-1 sm:mb-2">
                          {lesson.name} {lesson.duration && `(${lesson.duration})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p>No sections available.</p>
              )
            ) : (
              <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                <Lock className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 mb-3 sm:mb-4">
                  Purchase the course to access the full curriculum and lessons.
                </p>
                <button
                  onClick={onPurchase}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                >
                  Purchase Now
                </button>
              </div>
            )}
          </div>
        )}
        {activeTab === "instructor" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">About the Instructor</h2>
            <div className="flex items-center mb-3 sm:mb-4">
              {course.instructor?.profile_picture ? (
                <img
                  src={getImageUrl(course.instructor.profile_picture)}
                  alt={course.instructor?.firstname}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex items-center justify-center bg-[#1a1b3a] text-white font-semibold text-sm sm:text-base uppercase">
                  {course.instructor?.firstname?.[0] || "?"}
                </div>
              )}
              <div>
                <p className="font-medium">
                  {course.instructor?.firstname} {course.instructor?.lastname}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">{course.instructor?.title}</p>
              </div>
            </div>
            <p>{course.instructor?.bio || "No bio available."}</p>
          </div>
        )}
        {activeTab === "reviews" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Course Reviews</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading reviews...</p>
              </div>
            ) : (
              <>
                {!showReviewForm && isPurchased && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        userHasReview 
                          ? "bg-orange-600 hover:bg-orange-700 text-white" 
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {userHasReview ? "Edit Review" : "Write a Review"}
                    </button>
                  </div>
                )}

                {userHasReview && !showReviewForm && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      ✓ You have already submitted a review for this course. Click "Edit Review" to modify it.
                    </p>
                  </div>
                )}

                {showReviewForm && (
                  <div className="mb-6">
                    <ReviewForm
                      onCreate={handleReviewSubmit}
                      onUpdate={handleReviewUpdate}
                      onCancel={() => setShowReviewForm(false)}
                      existingReview={userExistingReview}
                    />
                  </div>
                )}

                <ReviewList
                  reviews={reviews}
                  stats={reviewStats}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailsTab;