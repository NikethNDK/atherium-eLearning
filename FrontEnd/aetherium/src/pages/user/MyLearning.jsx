

// import { useState, useEffect } from "react";
// import Header from "../../components/common/Header";
// import Footer from "../../components/common/Footer";
// import LoadingSpinner from "../../components/common/LoadingSpinner";
// import MyLearningList from "./MyLearningList"
// import { userAPI } from "../../services/userApi";
// import { useAuth } from "../../context/AuthContext";

// const MyLearning = () => {
//   const { isAuthenticated } = useAuth();
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState("all");

//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchMyCourses();
//     }
//   }, [isAuthenticated]);

//   const fetchMyCourses = async () => {
//     try {
//       setLoading(true);
//       const data = await userAPI.getMyCourses();
//       setCourses(data);
//     } catch (error) {
//       console.error("Error fetching my courses:", error);
//       setError(
//         error.response?.status === 404
//           ? "No purchased courses found."
//           : "Failed to load your courses."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getProgressPercentage = (course) => {
    
//     return course.progress?.progress_percentage || 0;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <LoadingSpinner />
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//             My Learning
//           </h1>
//           <p className="text-gray-600 text-sm sm:text-base">
//             Continue your learning journey
//           </p>
//         </div>
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
//             {error}
//           </div>
//         )}
//         <div className="mb-6">
//           <div className="border-b border-gray-200">
//             <nav className="flex flex-wrap gap-4 sm:gap-8">
//               {[
//                 { id: "all", label: "All Courses", count: courses.length },
//                 {
//                   id: "in-progress",
//                   label: "In Progress",
//                   count: courses.filter((c) => {
//                     const p = getProgressPercentage(c);
//                     return p > 0 && p < 100;
//                   }).length,
//                 },
//                 {
//                   id: "completed",
//                   label: "Completed",
//                   count: courses.filter((c) => getProgressPercentage(c) === 100)
//                     .length,
//                 },
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setFilter(tab.id)}
//                   className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
//                     filter === tab.id
//                       ? "border-blue-500 text-blue-600"
//                       : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                   }`}
//                 >
//                   {tab.label} ({tab.count})
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </div>
//         <MyLearningList
//           courses={courses}
//           filter={filter}
//           getProgressPercentage={getProgressPercentage}
//         />
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default MyLearning;

import { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import BookLoader from "../../components/common/BookLoader";
import MyLearningList from "./MyLearningList"
import { userAPI } from "../../services/userApi";
import { useAuth } from "../../context/AuthContext";

const MyLearning = () => {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({}); // Store progress data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyCoursesWithProgress();
    }
  }, [isAuthenticated]);

  const fetchMyCoursesWithProgress = async () => {
    try {
      setLoading(true);
      
      // Step 1: Fetch courses
      const coursesData = await userAPI.getMyCourses();
      setCourses(coursesData);
      
      // Step 2: Fetch progress for each course
      const progressPromises = coursesData.map(async (course) => {
        try {
          const progressData = await userAPI.getCourseProgress(course.id);
          return {
            courseId: course.id,
            progress: progressData
          };
        } catch (error) {
          console.error(`Error fetching progress for course ${course.id}:`, error);
          // Return default progress if API call fails
          return {
            courseId: course.id,
            progress: { progress_percentage: 0 }
          };
        }
      });
      
      // Step 3: Wait for all progress data and store in state
      const progressResults = await Promise.all(progressPromises);
      const progressMap = {};
      progressResults.forEach(({ courseId, progress }) => {
        progressMap[courseId] = progress;
      });
      setCourseProgress(progressMap);
      
    } catch (error) {
      console.error("Error fetching my courses:", error);
      setError(
        error.response?.status === 404
          ? "No purchased courses found."
          : "Failed to load your courses."
      );
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (course) => {
    // First check the new progress API data
    const apiProgress = courseProgress[course.id];
    if (apiProgress) {
      return apiProgress.progress_percentage || 0;
    }
    
    // Fallback to existing course progress data
    return course.progress?.progress_percentage || 0;
  };

  // Optional: Function to refresh progress for a specific course
  const refreshCourseProgress = async (courseId) => {
    try {
      const progressData = await userAPI.getCourseProgress(courseId);
      setCourseProgress(prev => ({
        ...prev,
        [courseId]: progressData
      }));
    } catch (error) {
      console.error(`Error refreshing progress for course ${courseId}:`, error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <BookLoader message="Loading your courses..." />
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
            My Learning
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Continue your learning journey
          </p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap gap-4 sm:gap-8">
              {[
                { id: "all", label: "All Courses", count: courses.length },
                {
                  id: "in-progress",
                  label: "In Progress",
                  count: courses.filter((c) => {
                    const p = getProgressPercentage(c);
                    return p > 0 && p < 100;
                  }).length,
                },
                {
                  id: "completed",
                  label: "Completed",
                  count: courses.filter((c) => getProgressPercentage(c) === 100)
                    .length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    filter === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>
        <MyLearningList
          courses={courses}
          filter={filter}
          getProgressPercentage={getProgressPercentage}
          refreshCourseProgress={refreshCourseProgress} // Optional: pass refresh function
        />
      </div>
      <Footer />
    </div>
  );
};

export default MyLearning;