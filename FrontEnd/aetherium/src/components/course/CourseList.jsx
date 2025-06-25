// import CourseCard from "./CourseCard";
// import CoursePagination from "./CoursePagination";

// const CourseList = ({ courses, loading, error, currentPage, totalPages, onPageChange }) => {
//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
//         {error}
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {[...Array(8)].map((_, index) => (
//           <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
//             <div className="h-48 bg-gray-300"></div>
//             <div className="p-4">
//               <div className="h-4 bg-gray-300 rounded mb-2"></div>
//               <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
//               <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>
//               <div className="h-8 bg-gray-300 rounded"></div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (courses.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <div className="text-gray-500 text-lg mb-4">No courses found</div>
//         <p className="text-gray-400">Try adjusting your filters or search terms.</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {courses.map((course) => (
//           <CourseCard key={course.id} course={course} />
//         ))}
//       </div>
//       {totalPages > 1 && (
//         <CoursePagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={onPageChange}
//         />
//       )}
//     </>
//   );
// };

// export default CourseList;

import CourseCard from "./CourseCard";
import CoursePagination from "./CoursePagination";

const CourseList = ({ courses, loading, error, currentPage, totalPages, onPageChange }) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No courses found</div>
        <p className="text-gray-400">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      {totalPages > 1 && (
        <CoursePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default CourseList;