// "use client"

// import { useState, useEffect } from "react"
// import { useSearchParams } from "react-router-dom"
// import Header from "../../components/common/Header"
// import Footer from "../../components/common/Footer"
// import CourseCard from "../../components/course/CourseCard"
// import CourseFilters from "../../components/course/CourseFilters"
// import CoursePagination from "../../components/course/CoursePagination"
// import LoadingSpinner from "../../components/common/LoadingSpinner"
// import { userAPI } from "../../services/userApi"

// const Courses = () => {
//   const [courses, setCourses] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const [searchParams, setSearchParams] = useSearchParams()

//   const [filters, setFilters] = useState({
//     search: searchParams.get("search") || "",
//     category: searchParams.get("category") || "",
//     level: searchParams.get("level") || "",
//     language: searchParams.get("language") || "",
//   })

//   useEffect(() => {
//     fetchCourses()
//   }, [filters, currentPage])

//   const fetchCourses = async () => {
//     try {
//       setLoading(true)
//       const data = await userAPI.getPublishedCourses({
//         ...filters,
//         page: currentPage,
//       })

//       setCourses(data.courses || data)
//       setTotalPages(data.total_pages || Math.ceil((data.length || 0) / 12))
//     } catch (error) {
//       console.error("Error fetching courses:", error)
//       setError("Failed to load courses. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleFiltersChange = (newFilters) => {
//     setFilters(newFilters)
//     setCurrentPage(1)

//     // Update URL params
//     const params = new URLSearchParams()
//     Object.entries(newFilters).forEach(([key, value]) => {
//       if (value) params.set(key, value)
//     })
//     setSearchParams(params)
//   }

//   const handlePageChange = (page) => {
//     setCurrentPage(page)
//     window.scrollTo({ top: 0, behavior: "smooth" })
//   }

//   if (loading && courses.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <LoadingSpinner />
//         <Footer />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
//           <p className="text-gray-600">
//             Discover our comprehensive collection of courses designed to help you learn and grow.
//           </p>
//         </div>

//         <CourseFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />

//         {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

//         {loading ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {[...Array(8)].map((_, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
//                 <div className="h-48 bg-gray-300"></div>
//                 <div className="p-4">
//                   <div className="h-4 bg-gray-300 rounded mb-2"></div>
//                   <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
//                   <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>
//                   <div className="h-8 bg-gray-300 rounded"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : courses.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-gray-500 text-lg mb-4">No courses found</div>
//             <p className="text-gray-400">Try adjusting your filters or search terms.</p>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {courses.map((course) => (
//                 <CourseCard key={course.id} course={course} />
//               ))}
//             </div>

//             {totalPages > 1 && (
//               <CoursePagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
//             )}
//           </>
//         )}
//       </div>

//       <Footer />
//     </div>
//   )
// }

// export default Courses


import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import CourseFilters from "../../components/course/CourseFilters";
import CourseList from "../../components/course/CourseList";
import BookLoader from "../../components/common/BookLoader";
import { userAPI } from "../../services/userApi";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    level: searchParams.get("level") || "",
    language: searchParams.get("language") || "",
  });

  useEffect(() => {
    fetchCourses();
  }, [filters, currentPage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getPublishedCourses({
        ...filters,
        page: currentPage,
      });
      setCourses(data.courses || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError(
        error.response?.status === 404
          ? "No courses found."
          : "Failed to load courses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <BookLoader message="Loading courses..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            All Courses
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Discover our comprehensive collection of courses designed to help you
            learn and grow.
          </p>
        </div>
        <CourseFilters
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />
        <CourseList
          courses={courses}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Courses;