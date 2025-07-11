
// import { useState } from "react"
// import { ContentTypeSelector, LessonContentEditor } from "./LessonContentEditor"
// import AssessmentEditor from "./AssessmentEditor"
// import { Save, X } from "lucide-react"
// import { instructorAPI } from "../../services/instructorAPI"

// const LessonEditor = ({ lesson, onSave, onCancel, isOpen }) => {
//   const [lessonData, setLessonData] = useState(
//      {
//       name: "",
//       content_type: "TEXT",
//       duration: "",
//       description: "",
//       content: {},
//       assessment: null,
//     },
//   )

//   const [errors, setErrors] = useState({})

//   const handleInputChange = (field, value) => {
//     setLessonData((prev) => ({ ...prev, [field]: value }))
//     if (errors[field]) {
//       setErrors((prev) => ({ ...prev, [field]: "" }))
//     }
//   }

//   const handleContentTypeChange = (contentType) => {
//     setLessonData((prev) => ({
//       ...prev,
//       content_type: contentType,
//       content: {},
//       assessment:
//         contentType === "ASSESSMENT"
//           ? {
//               title: "",
//               description: "",
//               passing_score: 70,
//               questions: [],
//             }
//           : null,
//     }))
//   }

//   const handleContentChange = (content) => {
//     setLessonData((prev) => ({ ...prev, content }))
//   }

//   const handleAssessmentChange = (assessment) => {
//     setLessonData((prev) => ({ ...prev, assessment }))
//   }

//   const validateLesson = () => {
//     const newErrors = {}

//     if (!lessonData.name.trim()) {
//       newErrors.name = "Lesson name is required"
//     }

//     if (lessonData.content_type === "ASSESSMENT") {
//       if (!lessonData.assessment?.title?.trim()) {
//         newErrors.assessment_title = "Assessment title is required"
//       }
//       if (!lessonData.assessment?.questions?.length) {
//         newErrors.assessment_questions = "At least one question is required"
//       }
//       // Validate each question has correct answer
//       lessonData.assessment?.questions?.forEach((question, index) => {
//         const hasCorrectAnswer = question.options?.some((option) => option.is_correct)
//         if (!hasCorrectAnswer) {
//           newErrors[`question_${index}`] = `Question ${index + 1} must have a correct answer`
//         }
//       })
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSave = async () => {
//     if (validateLesson()) {
//       onSave(lessonData)
//       // console.log(lessonData,'jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj',lesson)
//       // await instructorAPI.updateStep3Lesson(12,lessonData)
//     }
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//           <h2 className="text-xl font-semibold text-gray-900">{lesson ? "Edit Lesson" : "Add New Lesson"}</h2>
//           <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Name *</label>
//               <input
//                 type="text"
//                 value={lessonData.name}
//                 onChange={(e) => handleInputChange("name", e.target.value)}
//                 placeholder="Enter lesson name"
//                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                   errors.name ? "border-red-500" : "border-gray-300"
//                 }`}
//               />
//               {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
//               <input
//                 type="number"
//                 value={lessonData.duration}
//                 onChange={(e) => handleInputChange("duration", Number.parseInt(e.target.value))}
//                 placeholder="Estimated duration"
//                 min="1"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//             <textarea
//               value={lessonData.description}
//               onChange={(e) => handleInputChange("description", e.target.value)}
//               placeholder="Brief description of the lesson"
//               rows={3}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">Content Type *</label>
//             <ContentTypeSelector selectedType={lessonData.content_type} onTypeChange={handleContentTypeChange} />
//           </div>

//           {lessonData.content_type === "ASSESSMENT" ? (
//             <div>
//               <AssessmentEditor assessment={lessonData.assessment} onChange={handleAssessmentChange} />
//               {errors.assessment_title && <p className="text-red-500 text-sm mt-1">{errors.assessment_title}</p>}
//               {errors.assessment_questions && (
//                 <p className="text-red-500 text-sm mt-1">{errors.assessment_questions}</p>
//               )}
//               {Object.keys(errors)
//                 .filter((key) => key.startsWith("question_"))
//                 .map((key) => (
//                   <p key={key} className="text-red-500 text-sm mt-1">
//                     {errors[key]}
//                   </p>
//                 ))}
//             </div>
//           ) : (
//             <LessonContentEditor
//               contentType={lessonData.content_type}
//               content={lessonData.content}
//               onChange={handleContentChange}
//             />
//           )}
//         </div>

//         <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSave}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
//           >
//             <Save className="w-4 h-4 mr-2" />
//             Save Lesson
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default LessonEditor


"use client"

import { useState } from "react"
import { ContentTypeSelector, LessonContentEditor } from "./LessonContentEditor"
import AssessmentEditor from "./AssessmentEditor"
import { Save, X } from "lucide-react"

const LessonEditor = ({ lesson, onSave, onCancel, isOpen }) => {
  const [lessonData, setLessonData] = useState(
    lesson || {
      name: "",
      content_type: "TEXT",
      duration: "",
      description: "",
      content: {},
      assessment: null,
    },
  )

  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setLessonData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleContentTypeChange = (contentType) => {
    setLessonData((prev) => ({
      ...prev,
      content_type: contentType,
      content: {},
      assessment:
        contentType === "ASSESSMENT"
          ? {
              title: "",
              description: "",
              passing_score: 70,
              questions: [],
            }
          : null,
    }))
  }

  const handleContentChange = (content) => {
    setLessonData((prev) => ({ ...prev, content }))
  }

  const handleAssessmentChange = (assessment) => {
    setLessonData((prev) => ({ ...prev, assessment }))
  }

  const validateLesson = () => {
    const newErrors = {}

    if (!lessonData.name.trim()) {
      newErrors.name = "Lesson name is required"
    }

    if (lessonData.content_type === "ASSESSMENT") {
      if (!lessonData.assessment?.title?.trim()) {
        newErrors.assessment_title = "Assessment title is required"
      }
      if (!lessonData.assessment?.questions?.length) {
        newErrors.assessment_questions = "At least one question is required"
      }
      // Validate each question has correct answer
      lessonData.assessment?.questions?.forEach((question, index) => {
        const hasCorrectAnswer = question.options?.some((option) => option.is_correct)
        if (!hasCorrectAnswer) {
          newErrors[`question_${index}`] = `Question ${index + 1} must have a correct answer`
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateLesson()) {
      // Ensure duration is a number or null
      const processedLessonData = {
        ...lessonData,
        duration: lessonData.duration ? Number.parseInt(lessonData.duration) : null,
        order_index: lessonData.order_index || 0,
      }
      onSave(processedLessonData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{lesson ? "Edit Lesson" : "Add New Lesson"}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Name *</label>
              <input
                type="text"
                value={lessonData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter lesson name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={lessonData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="Estimated duration"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={lessonData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the lesson"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Content Type *</label>
            <ContentTypeSelector selectedType={lessonData.content_type} onTypeChange={handleContentTypeChange} />
          </div>

          {lessonData.content_type === "ASSESSMENT" ? (
            <div>
              <AssessmentEditor assessment={lessonData.assessment} onChange={handleAssessmentChange} />
              {errors.assessment_title && <p className="text-red-500 text-sm mt-1">{errors.assessment_title}</p>}
              {errors.assessment_questions && (
                <p className="text-red-500 text-sm mt-1">{errors.assessment_questions}</p>
              )}
              {Object.keys(errors)
                .filter((key) => key.startsWith("question_"))
                .map((key) => (
                  <p key={key} className="text-red-500 text-sm mt-1">
                    {errors[key]}
                  </p>
                ))}
            </div>
          ) : (
            <LessonContentEditor
              contentType={lessonData.content_type}
              content={lessonData.content}
              onChange={handleContentChange}
            />
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Lesson
          </button>
        </div>
      </div>
    </div>
  )
}

export default LessonEditor
