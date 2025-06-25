import { Clock, Users, BookOpen, BarChart3, Globe } from "lucide-react";

const CourseHero = ({ course }) => {
  return (
    <div className="bg-gradient-to-r from-purple-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <span className="bg-blue-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded">
                {course.category?.name || "Photography"}
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
                <span>7 Weeks</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-cyan-400" />
                <span>156 Students</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-cyan-400" />
                <span>All levels</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-cyan-400" />
                <span>20 Lessons</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-cyan-400" />
                <span>3 Quizzes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHero;