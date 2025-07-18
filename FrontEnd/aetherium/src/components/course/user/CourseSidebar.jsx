import { CheckCircle, Lock } from "lucide-react";

// const CourseSidebar = ({ course, progress, currentLesson, setCurrentLesson }) => {
//   const isSectionComplete = (sectionId) => {
//     return progress?.sections_completed?.includes(sectionId);
//   };

//   const isLessonComplete = (lessonId) => {
//     return progress?.lessons_completed?.includes(lessonId);
//   };

//   const canAccessLesson = (section, lesson) => {
//     // First lesson of first section is always accessible
//     if (course.sections[0].id === section.id && 
//         section.lessons[0].id === lesson.id) {
//       return true;
//     }
    
//     // Check if previous lesson is completed
//     const prevLesson = findPreviousLesson(section, lesson);
//     return !prevLesson || isLessonComplete(prevLesson.id);
//   };

//   const findPreviousLesson = (section, lesson) => {
//     const lessonIndex = section.lessons.findIndex(l => l.id === lesson.id);
//     if (lessonIndex > 0) {
//       return section.lessons[lessonIndex - 1];
//     }
    
//     // Check previous section's last lesson
//     const sectionIndex = course.sections.findIndex(s => s.id === section.id);
//     if (sectionIndex > 0) {
//       const prevSection = course.sections[sectionIndex - 1];
//       return prevSection.lessons[prevSection.lessons.length - 1];
//     }
    
//     return null;
//   };

//   return (
//     <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-120px)] overflow-y-auto">
//       <div className="p-4">
//         <h2 className="font-bold text-lg mb-4">Course Content</h2>
//         <div className="space-y-4">
//           {course.sections?.map((section) => (
//             <div key={section.id} className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-medium">{section.name}</h3>
//                 {isSectionComplete(section.id) && (
//                   <span className="text-green-500 text-sm">Completed</span>
//                 )}
//               </div>
//               <ul className="space-y-1 pl-2">
//                 {section.lessons?.map((lesson) => {
//                   const canAccess = canAccessLesson(section, lesson);
//                   const isCurrent = currentLesson?.id === lesson.id;
//                   const isComplete = isLessonComplete(lesson.id);
                  
//                   return (
//                     <li key={lesson.id}>
//                       <button
//                         onClick={() => canAccess && setCurrentLesson(lesson)}
//                         className={`w-full text-left px-2 py-1 rounded flex items-center ${
//                           isCurrent 
//                             ? "bg-blue-100 text-blue-700" 
//                             : "hover:bg-gray-100"
//                         } ${
//                           !canAccess ? "text-gray-400" : ""
//                         }`}
//                         disabled={!canAccess}
//                       >
//                         <span className="mr-2">
//                           {isComplete ? (
//                             <CheckCircle className="w-4 h-4 text-green-500" />
//                           ) : !canAccess ? (
//                             <Lock className="w-4 h-4" />
//                           ) : null}
//                         </span>
//                         {lesson.name}
//                       </button>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CourseSidebar;

const CourseSidebar = ({ course, progress, currentLesson, setCurrentLesson }) => {
  const isSectionComplete = (sectionId) => {
    return progress.sections[sectionId]?.is_completed;
  };

  const isLessonComplete = (lessonId) => {
    return progress.lessons[lessonId]?.is_completed;
  };

  const canAccessLesson = (section, lesson, index) => {
    // First lesson of course is always accessible
    if (course.sections[0].id === section.id && index === 0) return true;
    
    // Previous lesson must be completed
    const prevLesson = section.lessons[index - 1];
    return prevLesson ? isLessonComplete(prevLesson.id) : true;
  };

  return (
    <div className="course-sidebar">
      {course.sections?.map(section => (
        <div key={section.id}>
          <h3>{section.name} {isSectionComplete(section.id) && "✓"}</h3>
          <ul>
            {section.lessons?.map((lesson, idx) => (
              <li key={lesson.id}>
                <button
                  onClick={() => setCurrentLesson(lesson)}
                  disabled={!canAccessLesson(section, lesson, idx)}
                  className={currentLesson?.id === lesson.id ? 'active' : ''}
                >
                  {lesson.name}
                  {isLessonComplete(lesson.id) && " ✓"}
                  {!canAccessLesson(section, lesson, idx) && <LockIcon />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
export default CourseSidebar;