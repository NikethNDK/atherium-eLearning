// "use client"

// import { useState } from "react"
// import { Users, Star, ChevronDown, ChevronUp, Play, Lock } from "lucide-react"

// const CourseDetailTabs = ({ course, isPurchased, onPurchase }) => {
//   const [activeTab, setActiveTab] = useState("overview")
//   const [expandedSections, setExpandedSections] = useState({})
//   const [expandedFAQs, setExpandedFAQs] = useState({})

//   const tabs = [
//     { id: "overview", label: "Overview" },
//     { id: "curriculum", label: "Curriculum" },
//     { id: "instructor", label: "Instructor" },
//     { id: "faqs", label: "FAQs" },
//     { id: "reviews", label: "Reviews" },
//   ]

//   const toggleSection = (sectionId) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       [sectionId]: !prev[sectionId],
//     }))
//   }

//   const toggleFAQ = (faqId) => {
//     setExpandedFAQs((prev) => ({
//       ...prev,
//       [faqId]: !prev[faqId],
//     }))
//   }

//   const formatPrice = (price) => {
//     return `₹${price?.toFixed(2) || "0.00"}`
//   }

//   // Mock data for demonstration
//   const mockFAQs = [
//     {
//       id: 1,
//       question: "What Does Royalty Free Mean?",
//       answer:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio vitae duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in.",
//     },
//     {
//       id: 2,
//       question: "What Does Royalty Free Mean?",
//       answer:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilibus faucibus odio vitae duis dui, adipiscing facilisis.",
//     },
//     {
//       id: 3,
//       question: "What Does Royalty Free Mean?",
//       answer:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilibus faucibus odio vitae duis dui, adipiscing facilisis.",
//     },
//   ]

//   const mockReviews = [
//     {
//       id: 1,
//       user: "Laura Hipster",
//       date: "October 03, 2022",
//       rating: 5,
//       comment:
//         "Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in. Pulvinar sit ultrices mi ut eleifend luctus ut. Id sed faucibus bibendum augue id cras purus. At eget euismod cursus non. Molestie dignissim sed volutpat feugiat vel.",
//     },
//     {
//       id: 2,
//       user: "Laura Hipster",
//       date: "October 03, 2022",
//       rating: 5,
//       comment:
//         "Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in. Pulvinar sit ultrices mi ut eleifend luctus ut. Id sed faucibus bibendum augue id cras purus. At eget euismod cursus non. Molestie dignissim sed volutpat feugiat vel.",
//     },
//   ]

//   const renderOverview = () => (
//     <div className="space-y-6">
//       <div>
//         <h3 className="text-xl font-semibold mb-4">Description</h3>
//         <div className="prose max-w-none text-gray-700">
//           <p>
//             {course.description ||
//               "LearnPress is a comprehensive WordPress LMS Plugin for WordPress. This is one of the best WordPress LMS Plugins which can be used to easily create & sell courses online. You can create a course curriculum with lessons & quizzes included which is managed with an easy-to-use interface for users."}
//           </p>
//           <br />
//           <p>
//             {
//               "LearnPress is free and always will be, but it is still a premium high-quality WordPress Plugin that definitely helps you with making money from your WordPress Based LMS."
//             }
//           </p>
//         </div>
//       </div>

//       {course.learning_objectives && course.learning_objectives.length > 0 && (
//         <div>
//           <h3 className="text-xl font-semibold mb-4">What you'll learn</h3>
//           <ul className="space-y-2">
//             {course.learning_objectives.map((objective) => (
//               <li key={objective.id} className="flex items-start">
//                 <span className="text-green-500 mr-2">✓</span>
//                 <span className="text-gray-700">{objective.description}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {course.requirements && course.requirements.length > 0 && (
//         <div>
//           <h3 className="text-xl font-semibold mb-4">Requirements</h3>
//           <ul className="space-y-2">
//             {course.requirements.map((requirement) => (
//               <li key={requirement.id} className="flex items-start">
//                 <span className="text-gray-400 mr-2">•</span>
//                 <span className="text-gray-700">{requirement.description}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {course.target_audiences && course.target_audiences.length > 0 && (
//         <div>
//           <h3 className="text-xl font-semibold mb-4">Who this course is for</h3>
//           <ul className="space-y-2">
//             {course.target_audiences.map((audience) => (
//               <li key={audience.id} className="flex items-start">
//                 <span className="text-blue-500 mr-2">→</span>
//                 <span className="text-gray-700">{audience.description}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   )

//   const renderCurriculum = () => (
//     <div className="space-y-4">
//       <div className="mb-6">
//         <p className="text-gray-600">
//           LearnPress is a comprehensive WordPress LMS Plugin for WordPress. This is one of the best WordPress LMS
//           Plugins which can be used to easily create & sell courses online.
//         </p>
//       </div>

//       {course.sections &&
//         course.sections.map((section) => (
//           <div key={section.id} className="border border-gray-200 rounded-lg">
//             <button
//               onClick={() => toggleSection(section.id)}
//               className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
//             >
//               <div className="flex items-center space-x-3">
//                 {expandedSections[section.id] ? (
//                   <ChevronDown className="w-5 h-5 text-cyan-500" />
//                 ) : (
//                   <ChevronDown className="w-5 h-5 text-gray-400 transform -rotate-90" />
//                 )}
//                 <span className="font-medium text-gray-900">{section.name}</span>
//               </div>
//               <div className="text-sm text-gray-500">{section.lessons?.length || 0} Lessons • 45 Mins</div>
//             </button>

//             {expandedSections[section.id] && (
//               <div className="border-t border-gray-200">
//                 {section.lessons &&
//                   section.lessons.map((lesson, index) => (
//                     <div
//                       key={lesson.id}
//                       className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
//                     >
//                       <div className="flex items-center space-x-3">
//                         {isPurchased ? (
//                           <Play className="w-4 h-4 text-green-500" />
//                         ) : (
//                           <Lock className="w-4 h-4 text-gray-400" />
//                         )}
//                         <span className="text-gray-700">{lesson.name}</span>
//                       </div>
//                       <div className="flex items-center space-x-4">
//                         {index < 3 && !isPurchased && (
//                           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Preview</span>
//                         )}
//                         <span className="text-sm text-gray-500">{lesson.duration || "10:30"}</span>
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             )}
//           </div>
//         ))}
//     </div>
//   )

//   const renderInstructor = () => (
//     <div className="space-y-6">
//       <div className="flex items-start space-x-6">
//         <img
//           src={course.instructor?.profile_picture || "/placeholder.svg?height=120&width=120"}
//           alt={course.instructor?.firstname}
//           className="w-24 h-24 rounded-full object-cover"
//         />
//         <div className="flex-1">
//           <h3 className="text-2xl font-bold text-gray-900 mb-2">
//             {course.instructor?.firstname} {course.instructor?.lastname}
//           </h3>
//           {course.instructor?.title && <p className="text-gray-600 mb-4">{course.instructor.title}</p>}

//           <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
//             <div className="flex items-center">
//               <Users className="w-4 h-4 mr-2 text-cyan-500" />
//               <span>156 Students</span>
//             </div>
//             <div className="flex items-center">
//               <Star className="w-4 h-4 mr-2 text-cyan-500" />
//               <span>20 Lessons</span>
//             </div>
//           </div>

//           {course.instructor?.bio && <p className="text-gray-700 leading-relaxed">{course.instructor.bio}</p>}

//           <div className="flex space-x-4 mt-4">
//             <span className="text-gray-500">Follow:</span>
//             <div className="flex space-x-2">
//               <a href="#" className="text-blue-600 hover:text-blue-700">
//                 f
//               </a>
//               <a href="#" className="text-blue-400 hover:text-blue-500">
//                 t
//               </a>
//               <a href="#" className="text-gray-600 hover:text-gray-700">
//                 in
//               </a>
//               <a href="#" className="text-red-600 hover:text-red-700">
//                 yt
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )

//   const renderFAQs = () => (
//     <div className="space-y-4">
//       {mockFAQs.map((faq) => (
//         <div key={faq.id} className="border border-gray-200 rounded-lg">
//           <button
//             onClick={() => toggleFAQ(faq.id)}
//             className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
//           >
//             <span className="font-medium text-gray-900">{faq.question}</span>
//             {expandedFAQs[faq.id] ? (
//               <ChevronUp className="w-5 h-5 text-gray-400" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-gray-400" />
//             )}
//           </button>

//           {expandedFAQs[faq.id] && (
//             <div className="px-4 pb-4 border-t border-gray-200 pt-4">
//               <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   )

//   const renderReviews = () => (
//     <div className="space-y-6">
//       <div className="bg-gray-50 p-6 rounded-lg">
//         <div className="flex items-center space-x-6 mb-6">
//           <div className="text-center">
//             <div className="text-4xl font-bold text-gray-900 mb-2">4.0</div>
//             <div className="flex items-center justify-center mb-2">
//               {[...Array(4)].map((_, i) => (
//                 <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
//               ))}
//               <Star className="w-5 h-5 text-gray-300" />
//             </div>
//             <div className="text-sm text-gray-600">Based on 146,951 ratings</div>
//           </div>

//           <div className="flex-1 space-y-2">
//             {[5, 4, 3, 2, 1].map((rating) => (
//               <div key={rating} className="flex items-center space-x-3">
//                 <div className="flex items-center space-x-1">
//                   {[...Array(rating)].map((_, i) => (
//                     <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
//                   ))}
//                 </div>
//                 <div className="flex-1 bg-gray-200 rounded-full h-2">
//                   <div
//                     className="bg-yellow-500 h-2 rounded-full"
//                     style={{
//                       width: `${rating === 5 ? 90 : rating === 4 ? 5 : rating === 3 ? 2 : rating === 2 ? 2 : 1}%`,
//                     }}
//                   ></div>
//                 </div>
//                 <span className="text-sm text-gray-600 w-8">{rating === 5 ? "90%" : rating === 4 ? "5%" : "2%"}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="space-y-6">
//         <h3 className="text-xl font-semibold">Comments</h3>
//         {mockReviews.map((review) => (
//           <div key={review.id} className="flex space-x-4 pb-6 border-b border-gray-200 last:border-b-0">
//             <img
//               src="/placeholder.svg?height=48&width=48"
//               alt={review.user}
//               className="w-12 h-12 rounded-full object-cover"
//             />
//             <div className="flex-1">
//               <div className="flex items-center justify-between mb-2">
//                 <h4 className="font-medium text-gray-900">{review.user}</h4>
//                 <span className="text-sm text-gray-500">{review.date}</span>
//               </div>
//               <div className="flex items-center mb-3">
//                 {[...Array(review.rating)].map((_, i) => (
//                   <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
//                 ))}
//               </div>
//               <p className="text-gray-700 leading-relaxed">{review.comment}</p>
//               <button className="text-sm text-blue-600 hover:text-blue-700 mt-2">Reply</button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="flex justify-center">
//         <nav className="flex space-x-2">
//           <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">&lt;</button>
//           <button className="px-3 py-2 text-sm bg-gray-900 text-white rounded">1</button>
//           <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">2</button>
//           <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">3</button>
//           <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">&gt;</button>
//         </nav>
//       </div>
//     </div>
//   )

//   return (
//     <div className="bg-white">
//       {/* Tab Navigation */}
//       <div className="border-b border-gray-200">
//         <nav className="flex space-x-8">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === tab.id
//                   ? "border-cyan-500 text-cyan-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Tab Content */}
//       <div className="py-8">
//         {activeTab === "overview" && renderOverview()}
//         {activeTab === "curriculum" && renderCurriculum()}
//         {activeTab === "instructor" && renderInstructor()}
//         {activeTab === "faqs" && renderFAQs()}
//         {activeTab === "reviews" && renderReviews()}
//       </div>
//     </div>
//   )
// }

// export default CourseDetailTabs


import { useState } from "react";
import { Lock } from "lucide-react";

const CourseDetailsTab = ({ course, isPurchased, onPurchase }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Curriculum" },
    { id: "instructor", label: "Instructor" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <nav className="flex flex-wrap gap-2 sm:gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="text-sm sm:text-base text-gray-700">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Course Description</h2>
            <p>{course.description || "No description available."}</p>
            <h2 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">
              What You’ll Learn
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
              <img
                src={course.instructor?.profile_picture || "/placeholder.svg?height=40&width=40"}
                alt={course.instructor?.firstname}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3"
              />
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
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Reviews</h2>
            <p>Reviews section coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailsTab;