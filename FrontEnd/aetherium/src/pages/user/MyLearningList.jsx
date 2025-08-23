import { Link } from "react-router-dom";
import { Play, Clock, BookOpen, Award } from "lucide-react";
import { useState } from "react";
import { getImageUrl } from "../../components/common/ImageURL";

const MyLearningList = ({ courses, filter, getProgressPercentage }) => {
  const [hoveredCourse, setHoveredCourse] = useState(null);

  const filteredCourses = courses.filter((course) => {
    const progress = getProgressPercentage(course);
    if (filter === "in-progress") return progress > 0 && progress < 100;
    if (filter === "completed") return progress === 100;
    return true;
  });

  const formatPrice = (price) => `₹${price?.toFixed(2) || "0.00"}`;

  // Function to get instructor initials
  const getInstructorInitials = (instructor) => {
    if (!instructor?.firstname) return "?";
    return instructor.firstname.charAt(0).toUpperCase();
  };

  if (filteredCourses.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-4" />
        <div className="text-gray-500 text-base sm:text-lg mb-4">
          {filter === "all" ? "No courses purchased yet" : `No ${filter.replace("-", " ")} courses`}
        </div>
        <p className="text-gray-400 mb-8 text-sm sm:text-base">
          {filter === "all"
            ? "Start learning by purchasing your first course!"
            : "Check back later as you progress through your courses."}
        </p>
        {filter === "all" && (
          <Link
            to="/courses"
            className="bg-[#1a1b3a] hover:bg-[#2a2b4a] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-colors"
          >
            Browse Courses
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {filteredCourses.map((course) => {
        const progress = getProgressPercentage(course);
        const isHovered = hoveredCourse === course.id;
        
        return (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            onMouseEnter={() => setHoveredCourse(course.id)}
            onMouseLeave={() => setHoveredCourse(null)}
          >
            <div className="relative">
              {/* Course Image */}
              <img
              // src={getImageUrl(course.cover_image) || "/placeholder.svg"}
                src={getImageUrl(course.cover_image) || "/placeholder.svg?height=200&width=300"}
                alt={course.title}
                className={`w-full h-32 sm:h-48 object-cover transition-opacity duration-300 ${
                  isHovered && getImageUrl(course.trailer_video) ? 'opacity-0' : 'opacity-100'
                }`}
              />
              
              {/* Trailer Video - Only show if available and hovered */}
              {course.trailer_video && (
                <video
                  src={getImageUrl(course.trailer_video)}
                  className={`absolute inset-0 w-full h-32 sm:h-48 object-cover transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                  muted
                  autoPlay={isHovered}
                  loop
                  playsInline
                />
              )}
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Link
                  to={`/my-learning/${course.id}`}
                  className="bg-white bg-opacity-20 rounded-full p-3 sm:p-4 hover:bg-opacity-30 transition-colors"
                >
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </Link>
              </div>
              
              {/* Completion Badge */}
              {progress === 100 && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 sm:p-2 rounded-full">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base line-clamp-2">
                {course.title}
              </h3>
              
              {/* Instructor Info */}
              <div className="flex items-center mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600">
                {course.instructor?.profile_picture ? (
                  <img
                    src={getImageUrl(course.instructor.profile_picture)}
                    alt={course.instructor?.firstname}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full mr-1 sm:mr-2 object-cover"
                  />
                ) : (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full mr-1 sm:mr-2 bg-[#1a1b3a] text-white flex items-center justify-center text-xs font-medium">
                    {getInstructorInitials(course.instructor)}
                  </div>
                )}
                <span>
                  {course.instructor?.firstname} {course.instructor?.lastname}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3 sm:mb-4">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">Progress</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-[#1a1b3a] h-1.5 sm:h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Course Details */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>
                    {course.duration || 0} {course.duration_unit || "hours"}
                  </span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{course.sections?.length || 0} sections</span>
                </div>
              </div>
              
              {/* Action Button */}
              <Link
                to={`/my-learning/${course.id}`}
                className="w-full bg-[#1a1b3a] hover:bg-[#2a2b4a] text-white py-2 px-3 sm:px-4 rounded-lg font-medium transition-colors duration-200 block text-center text-xs sm:text-sm"
              >
                {progress === 0 ? "Start Learning" : progress === 100 ? "Review Course" : "Continue Learning"}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyLearningList;