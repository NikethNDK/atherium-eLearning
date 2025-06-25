import CourseCard from "./CourseCard";

const RelatedCourses = ({ relatedCourses }) => {
  if (relatedCourses.length === 0) return null;

  return (
    <div className="bg-gray-100 py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          Others are also Viewing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {relatedCourses.map((relatedCourse) => (
            <CourseCard key={relatedCourse.id} course={relatedCourse} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedCourses;