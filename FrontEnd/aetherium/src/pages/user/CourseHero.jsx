import { Clock, BookOpen } from "lucide-react";
import { getImageUrl } from "../../components/common/ImageURL";


const CourseHero = ({ course }) => {
  // Calculate total lessons
  const totalLessons = course.sections?.reduce(
    (acc, section) => acc + (section.lessons?.length || 0),
    0
  );

  return (
    <div className="bg-gradient-to-r from-purple-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <span className="bg-blue-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded">
              {course.category?.name || "Category"}
            </span>
            <span className="ml-2 text-xs sm:text-sm text-gray-300">
              by {course.instructor?.firstname} {course.instructor?.lastname}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-4 sm:mb-6">
              {course.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-cyan-400" />
              <span>
                {course.duration || 0} {course.duration_unit?.toLowerCase() || "hours"}
              </span>
            </div>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-cyan-400" />
              <span>{totalLessons || 0} Lessons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHero;