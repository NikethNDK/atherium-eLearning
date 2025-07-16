// import { useState } from "react"
// import SectionManager from "../lesson/SectionManager"
// import { instructorAPI } from "../../services/instructorAPI"

// const EnhancedSectionEditor = ({ sections, onSectionsChange, courseId, errors }) => {
//   const [loading, setLoading] = useState(false)

//   const handleSectionsChange = async (updatedSections) => {
//     try {
//       setLoading(true)

//       // Transform sections data for API - ensure proper data types and validation
//       const sectionsData = updatedSections.map((section) => ({
//         name: section.name,
//         lessons:
//           section.lessons?.map((lesson) => {
//             // Validate required fields
//             if (!lesson.name || !lesson.content_type) {
//               throw new Error(`Lesson "${lesson.name || "Unnamed"}" is missing required fields`)
//             }

//             return {
//               name: lesson.name,
//               content_type: lesson.content_type, // Ensure this is not undefined
//               content_url: lesson.content_url || null,
//               duration: lesson.duration ? Number.parseInt(lesson.duration) : null,
//               description: lesson.description || null,
//               content_data: lesson.content ? JSON.stringify(lesson.content) : null,
//               order_index: lesson.order_index || 0,
//               assessment: lesson.content_type === "ASSESSMENT" ? lesson.assessment : null,
//             }
//           }) || [],
//       }))

//       // Update sections via API if courseId exists
//       if (courseId) {
//         console.log("Sending sections data:", sectionsData)
//         const response = await instructorAPI.updateStep3(courseId, { sections: sectionsData })

//         // Transform response data to match frontend expectations
//         const transformedSections =
//           response.sections?.map((section) => ({
//             id: section.id,
//             name: section.name,
//             lessons:
//               section.lessons?.map((lesson) => ({
//                 id: lesson.id,
//                 name: lesson.name,
//                 content_type: lesson.content_type || "TEXT", // Provide default
//                 content_url: lesson.content_url,
//                 duration: lesson.duration,
//                 description: lesson.description,
//                 content: lesson.content_data ? JSON.parse(lesson.content_data) : {},
//                 order_index: lesson.order_index || 0,
//                 assessment: lesson.assessment || null,
//               })) || [],
//           })) || []

//         // Update local state with transformed data
//         onSectionsChange(transformedSections)
//       } else {
//         // Update local state directly if no courseId
//         onSectionsChange(updatedSections)
//       }
//     } catch (error) {
//       console.error("Error updating sections:", error)
//       console.error("Error details:", error.response?.data)

//       // More specific error messages
//       let errorMessage = "Error saving sections. Please check your data and try again."
//       if (error.response?.data?.detail) {
//         if (Array.isArray(error.response.data.detail)) {
//           errorMessage = `Validation error: ${error.response.data.detail.map((e) => e.msg || e).join(", ")}`
//         } else {
//           errorMessage = `Error: ${error.response.data.detail}`
//         }
//       } else if (error.message) {
//         errorMessage = error.message
//       }

//       alert(errorMessage)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <SectionManager sections={sections} onChange={handleSectionsChange} loading={loading} />

//       {errors?.sections && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <p className="text-red-700 text-sm">{errors.sections}</p>
//         </div>
//       )}

//       {loading && (
//         <div className="text-center py-4">
//           <div className="inline-flex items-center">
//             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
//             <span className="text-sm text-gray-600">Saving changes...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default EnhancedSectionEditor


import SectionList from "../lesson/SectionList" 

const EnhancedSectionEditor = ({ sections, onSectionsChange, courseId, errors }) => {
  // This component now primarily acts as a wrapper and passes props to SectionList.
  // It does not manage its own loading state for saving sections, as SectionList
  // and LessonEditor handle granular API calls.
  // The `onSectionsChange` prop is still used to update the parent CreateCourse's state.

  return (
    <div className="space-y-6">
      <SectionList sections={sections} onChange={onSectionsChange} courseId={courseId} />

      {errors?.sections && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{errors.sections}</p>
        </div>
      )}
    </div>
  )
}

export default EnhancedSectionEditor
