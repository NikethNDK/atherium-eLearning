

// "use client"

// import { useState, useCallback } from "react"
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   ChevronDown,
//   ChevronRight,
//   BookOpen,
//   FileText,
//   Video,
//   Link,
//   FileQuestion,
// } from "lucide-react"
// import LessonEditor from "./LessonEditor"
// import { instructorAPI } from "../../services/instructorApi"

// const LessonItem = ({ lesson, onEdit, onDelete, sectionIndex, lessonIndex }) => {
//   const safeLesson = {
//     name: lesson?.name || "Unnamed Lesson",
//     content_type: lesson?.content_type || "TEXT",
//     duration: lesson?.duration,
//     ...lesson,
//   }

//   const getContentIcon = (contentType) => {
//     switch (contentType) {
//       case "TEXT":
//         return <FileText className="w-4 h-4" />
//       case "PDF":
//         return <FileText className="w-4 h-4" />
//       case "VIDEO":
//         return <Video className="w-4 h-4" />
//       case "REFERENCE_LINK":
//         return <Link className="w-4 h-4" />
//       case "ASSESSMENT":
//         return <FileQuestion className="w-4 h-4" />
//       default:
//         return <BookOpen className="w-4 h-4" />
//     }
//   }

//   const getContentTypeLabel = (contentType) => {
//     switch (contentType) {
//       case "TEXT":
//         return "Text"
//       case "PDF":
//         return "PDF"
//       case "VIDEO":
//         return "Video"
//       case "REFERENCE_LINK":
//         return "Link"
//       case "ASSESSMENT":
//         return "Quiz"
//       default:
//         return "Content"
//     }
//   }

//   return (
//     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//       <div className="flex items-center space-x-3">
//         <div className="text-blue-600">{getContentIcon(safeLesson.content_type)}</div>
//         <div>
//           <h4 className="font-medium text-gray-900">{safeLesson.name}</h4>
//           <div className="flex items-center space-x-2 text-sm text-gray-500">
//             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
//               {getContentTypeLabel(safeLesson.content_type)}
//             </span>
//             {safeLesson.duration && <span>{safeLesson.duration} min</span>}
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center space-x-2">
//         <button onClick={() => onEdit(sectionIndex, lessonIndex)} className="text-gray-400 hover:text-blue-600 p-1">
//           <Edit2 className="w-4 h-4" />
//         </button>
//         <button onClick={() => onDelete(sectionIndex, lessonIndex)} className="text-gray-400 hover:text-red-600 p-1">
//           <Trash2 className="w-4 h-4" />
//         </button>
//       </div>
//     </div>
//   )
// }

// const SectionItem = ({
//   section,
//   sectionIndex,
//   onEditSection,
//   onDeleteSection,
//   onAddLesson,
//   onEditLesson,
//   onDeleteLesson,
//   expandedSections,
//   toggleSection,
//   apiError,
// }) => {
//   const [isEditing, setIsEditing] = useState(false)
//   const [sectionName, setSectionName] = useState(section.name)
//   const [editError, setEditError] = useState("")

//   const handleSaveSection = async () => {
//     setEditError("")
//     if (!sectionName.trim()) {
//       setEditError("Section name cannot be empty.")
//       return
//     }
//     await onEditSection(sectionIndex, sectionName.trim())
//     setIsEditing(false)
//   }

//   const handleCancelEdit = () => {
//     setSectionName(section.name)
//     setIsEditing(false)
//     setEditError("")
//   }

//   const isExpanded = expandedSections.includes(sectionIndex)
//   const lessonCount = section.lessons?.length || 0

//   return (
//     <div className="border border-gray-200 rounded-lg">
//       <div className="p-4 bg-white">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3 flex-1">
//             <button onClick={() => toggleSection(sectionIndex)} className="text-gray-400 hover:text-gray-600">
//               {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
//             </button>

//             {isEditing ? (
//               <div className="flex items-center space-x-2 flex-1">
//                 <input
//                   type="text"
//                   value={sectionName}
//                   onChange={(e) => setSectionName(e.target.value)}
//                   className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   onKeyPress={(e) => e.key === "Enter" && handleSaveSection()}
//                 />
//                 <button onClick={handleSaveSection} className="text-green-600 hover:text-green-800 px-2 py-1">
//                   Save
//                 </button>
//                 <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800 px-2 py-1">
//                   Cancel
//                 </button>
//               </div>
//             ) : (
//               <div className="flex-1">
//                 <h3 className="font-medium text-gray-900">{section.name}</h3>
//                 <p className="text-sm text-gray-500">
//                   {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
//                 </p>
//               </div>
//             )}
//           </div>

//           {!isEditing && (
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => onAddLesson(sectionIndex)}
//                 className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//               >
//                 <Plus className="w-4 h-4 inline mr-1" />
//                 Add Lesson
//               </button>
//               <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-600 p-1">
//                 <Edit2 className="w-4 h-4" />
//               </button>
//               <button onClick={() => onDeleteSection(sectionIndex)} className="text-gray-400 hover:text-red-600 p-1">
//                 <Trash2 className="w-4 h-4" />
//               </button>
//             </div>
//           )}
//         </div>
//         {editError && <p className="text-red-500 text-sm mt-2">{editError}</p>}
//       </div>

//       {isExpanded && (
//         <div className="border-t border-gray-200 p-4 bg-gray-50">
//           {lessonCount === 0 ? (
//             <div className="text-center py-6 text-gray-500">
//               <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
//               <p className="text-sm">No lessons in this section yet.</p>
//               <button
//                 onClick={() => onAddLesson(sectionIndex)}
//                 className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
//               >
//                 Add your first lesson
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {section.lessons.map((lesson, lessonIndex) => (
//                 <LessonItem
//                   key={lesson.id || `${section.id}-${lessonIndex}`} // Use section.id for key
//                   lesson={lesson}
//                   sectionIndex={sectionIndex}
//                   lessonIndex={lessonIndex}
//                   onEdit={onEditLesson}
//                   onDelete={onDeleteLesson}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// const SectionList = ({ sections, onChange, courseId }) => {
//   const [expandedSections, setExpandedSections] = useState([0])
//   const [editingLesson, setEditingLesson] = useState(null)
//   const [isLessonEditorOpen, setIsLessonEditorOpen] = useState(false)
//   const [apiError, setApiError] = useState("")
//   const [loading, setLoading] = useState(false) // For section operations

//   const toggleSection = useCallback((sectionIndex) => {
//     setExpandedSections((prev) =>
//       prev.includes(sectionIndex) ? prev.filter((index) => index !== sectionIndex) : [...prev, sectionIndex],
//     )
//   }, [])

//   const addSection = useCallback(async () => {
//     setApiError("")
//     if (!courseId) {
//       setApiError("Please save basic course information first (Step 1).")
//       return
//     }
//     setLoading(true)
//     try {
//       const newSectionName = `Section ${sections.length + 1}`
//       const response = await instructorAPI.createSection(courseId, newSectionName)
//       const newSection = { ...response, lessons: [] } // Backend returns section without lessons
//       onChange([...sections, newSection])
//       setExpandedSections((prev) => [...prev, sections.length])
//     } catch (error) {
//       console.error("Error creating section:", error)
//       setApiError(error.response?.data?.detail || "Failed to create section.")
//     } finally {
//       setLoading(false)
//     }
//   }, [sections, onChange, courseId])

//   const editSection = useCallback(
//     async (sectionIndex, newName) => {
//       setApiError("")
//       const sectionToUpdate = sections[sectionIndex]
//       if (!sectionToUpdate || !sectionToUpdate.id) {
//         setApiError("Cannot update unsaved section. Please save the course first.")
//         return
//       }
//       setLoading(true)
//       try {
//         const response = await instructorAPI.updateSection(sectionToUpdate.id, newName)
//         const updatedSections = sections.map((section, index) =>
//           index === sectionIndex ? { ...section, name: response.name } : section,
//         )
//         onChange(updatedSections)
//       } catch (error) {
//         console.error("Error updating section:", error)
//         setApiError(error.response?.data?.detail || "Failed to update section.")
//       } finally {
//         setLoading(false)
//       }
//     },
//     [sections, onChange],
//   )

//   const deleteSection = useCallback(
//     async (sectionIndex) => {
//       if (!window.confirm("Are you sure you want to delete this section and all its lessons?")) {
//         return
//       }
//       setApiError("")
//       const sectionToDelete = sections[sectionIndex]
//       if (!sectionToDelete || !sectionToDelete.id) {
//         // If section doesn't have an ID, it's not yet saved to backend, just remove locally
//         const updatedSections = sections.filter((_, index) => index !== sectionIndex)
//         onChange(updatedSections)
//         setExpandedSections((prev) =>
//           prev.filter((index) => index !== sectionIndex).map((index) => (index > sectionIndex ? index - 1 : index)),
//         )
//         return
//       }

//       setLoading(true)
//       try {
//         await instructorAPI.deleteSection(sectionToDelete.id)
//         const updatedSections = sections.filter((_, index) => index !== sectionIndex)
//         onChange(updatedSections)
//         setExpandedSections((prev) =>
//           prev.filter((index) => index !== sectionIndex).map((index) => (index > sectionIndex ? index - 1 : index)),
//         )
//       } catch (error) {
//         console.error("Error deleting section:", error)
//         setApiError(error.response?.data?.detail || "Failed to delete section.")
//       } finally {
//         setLoading(false)
//       }
//     },
//     [sections, onChange],
//   )

//   const addLesson = useCallback(
//     (sectionIndex) => {
//       setApiError("")
//       const section = sections[sectionIndex]
//       if (!section || !section.id) {
//         setApiError("Please save the section first before adding lessons to it.")
//         return
//       }
//       setEditingLesson({ sectionIndex, lessonIndex: null, lesson: null })
//       setIsLessonEditorOpen(true)
//     },
//     [sections],
//   )

//   const editLesson = useCallback(
//     (sectionIndex, lessonIndex) => {
//       setApiError("")
//       setEditingLesson({
//         sectionIndex,
//         lessonIndex,
//         lesson: sections[sectionIndex].lessons[lessonIndex],
//       })
//       setIsLessonEditorOpen(true)
//     },
//     [sections],
//   )

//   const deleteLesson = useCallback(
//     async (sectionIndex, lessonIndex) => {
//       if (!window.confirm("Are you sure you want to delete this lesson?")) {
//         return
//       }

//       setApiError("")
//       const lessonToDelete = sections[sectionIndex].lessons[lessonIndex]
//       if (!lessonToDelete || !lessonToDelete.id) {
//         // If lesson doesn't have an ID, it's not yet saved to backend, just remove locally
//         const updatedSections = sections.map((section, index) =>
//           index === sectionIndex
//             ? { ...section, lessons: section.lessons.filter((_, lIndex) => lIndex !== lessonIndex) }
//             : section,
//         )
//         onChange(updatedSections)
//         return
//       }

//       setLoading(true)
//       try {
//         await instructorAPI.deleteLesson(lessonToDelete.id)
//         const updatedSections = sections.map((section, index) =>
//           index === sectionIndex
//             ? { ...section, lessons: section.lessons.filter((_, lIndex) => lIndex !== lessonIndex) }
//             : section,
//         )
//         onChange(updatedSections)
//       } catch (error) {
//         console.error("Error deleting lesson:", error)
//         setApiError(error.response?.data?.detail || "Failed to delete lesson.")
//       } finally {
//         setLoading(false)
//       }
//     },
//     [sections, onChange],
//   )

//   const handleLessonSave = useCallback(
//     (savedLesson) => {
//       const { sectionIndex, lessonIndex } = editingLesson
//       const updatedSections = sections.map((section, index) => {
//         if (index === sectionIndex) {
//           const updatedLessons =
//             lessonIndex !== null
//               ? section.lessons.map((lesson, lIndex) => (lIndex === lessonIndex ? savedLesson : lesson))
//               : [...section.lessons, savedLesson]

//           return { ...section, lessons: updatedLessons }
//         }
//         return section
//       })

//       onChange(updatedSections)
//       setIsLessonEditorOpen(false)
//       setEditingLesson(null)
//     },
//     [editingLesson, sections, onChange],
//   )

//   const cancelLessonEdit = useCallback(() => {
//     setIsLessonEditorOpen(false)
//     setEditingLesson(null)
//     setApiError("")
//   }, [])

//   const hasValidSections = sections.length > 0
//   const allSectionsHaveLessons = sections.every((section) => section.lessons && section.lessons.length > 0)

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h3 className="text-lg font-medium text-gray-900">Course Curriculum</h3>
//           <p className="text-sm text-gray-600">Organize your course content into sections and lessons</p>
//         </div>
//         <button
//           onClick={addSection}
//           disabled={loading || !courseId}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? (
//             <span className="flex items-center">
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//               Adding...
//             </span>
//           ) : (
//             <>
//               <Plus className="w-4 h-4 inline mr-2" />
//               Add Section
//             </>
//           )}
//         </button>
//       </div>

//       {apiError && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{apiError}</div>
//       )}

//       {!hasValidSections && (
//         <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
//           <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
//           <p className="text-lg font-medium mb-1">No sections created yet</p>
//           <p className="text-sm mb-4">Start building your course by adding your first section</p>
//           <button
//             onClick={addSection}
//             disabled={loading || !courseId}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Create First Section
//           </button>
//         </div>
//       )}

//       {hasValidSections && (
//         <div className="space-y-4">
//           {sections.map((section, sectionIndex) => (
//             <SectionItem
//               key={section.id || sectionIndex}
//               section={section}
//               sectionIndex={sectionIndex}
//               onEditSection={editSection}
//               onDeleteSection={deleteSection}
//               onAddLesson={addLesson}
//               onEditLesson={editLesson}
//               onDeleteLesson={deleteLesson}
//               expandedSections={expandedSections}
//               toggleSection={toggleSection}
//               apiError={apiError} // Pass down for display
//             />
//           ))}
//         </div>
//       )}

//       {hasValidSections && !allSectionsHaveLessons && (
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <div className="text-yellow-600 mr-3">⚠️</div>
//             <div>
//               <h4 className="font-medium text-yellow-800">Incomplete Sections</h4>
//               <p className="text-sm text-yellow-700">
//                 Each section must have at least one lesson before you can proceed.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       <LessonEditor
//         lesson={editingLesson?.lesson}
//         onSave={handleLessonSave}
//         onCancel={cancelLessonEdit}
//         isOpen={isLessonEditorOpen}
//         courseId={courseId}
//         // sectionId={editingLesson?.sectionIndex !== null ? sections[editingLesson.sectionIndex]?.id : null}
//         sectionId={typeof editingLesson?.sectionIndex === 'number' &&sections[editingLesson.sectionIndex]? sections[editingLesson.sectionIndex].id: null}
//       />
//     </div>
//   )
// }

// export default SectionList


import { useState, useCallback } from "react"
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  Video,
  Link,
  FileQuestion,
} from "lucide-react"
import LessonEditor from "./LessonEditor"
import { instructorAPI } from "../../services/instructorApi"

const LessonItem = ({ lesson, onEdit, onDelete, sectionIndex, lessonIndex }) => {
  const safeLesson = {
    name: lesson?.name || "Unnamed Lesson",
    content_type: lesson?.content_type || "TEXT",
    duration: lesson?.duration,
    ...lesson,
  }

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case "TEXT":
        return <FileText className="w-4 h-4" />
      case "PDF":
        return <FileText className="w-4 h-4" />
      case "VIDEO":
        return <Video className="w-4 h-4" />
      case "REFERENCE_LINK":
        return <Link className="w-4 h-4" />
      case "ASSESSMENT":
        return <FileQuestion className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getContentTypeLabel = (contentType) => {
    switch (contentType) {
      case "TEXT":
        return "Text"
      case "PDF":
        return "PDF"
      case "VIDEO":
        return "Video"
      case "REFERENCE_LINK":
        return "Link"
      case "ASSESSMENT":
        return "Quiz"
      default:
        return "Content"
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="text-blue-600">{getContentIcon(safeLesson.content_type)}</div>
        <div>
          <h4 className="font-medium text-gray-900">{safeLesson.name}</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {getContentTypeLabel(safeLesson.content_type)}
            </span>
            {safeLesson.duration && <span>{safeLesson.duration} min</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button onClick={() => onEdit(sectionIndex, lessonIndex)} className="text-gray-400 hover:text-blue-600 p-1">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(sectionIndex, lessonIndex)} className="text-gray-400 hover:text-red-600 p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const SectionItem = ({
  section,
  sectionIndex,
  onEditSection,
  onDeleteSection,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  expandedSections,
  toggleSection,
  apiError,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [sectionName, setSectionName] = useState(section.name)
  const [editError, setEditError] = useState("")

  const handleSaveSection = async () => {
    setEditError("")
    if (!sectionName.trim()) {
      setEditError("Section name cannot be empty.")
      return
    }
    await onEditSection(sectionIndex, sectionName.trim())
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setSectionName(section.name)
    setIsEditing(false)
    setEditError("")
  }

  const isExpanded = expandedSections.includes(sectionIndex)
  const lessonCount = section.lessons?.length || 0

  // Sort lessons 
  const sortedLessons = section.lessons ? [...section.lessons].sort((a, b) => {
  // First sort by order_index
  if (a.order_index !== b.order_index) {
    return (a.order_index || 0) - (b.order_index || 0)
  }
  // If order_index is the same, sort by created_at (properly convert to Date)
  const dateA = new Date(a.created_at)
  const dateB = new Date(b.created_at)
  return dateA - dateB
}) : []

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <button onClick={() => toggleSection(sectionIndex)} className="text-gray-400 hover:text-gray-600">
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && handleSaveSection()}
                />
                <button onClick={handleSaveSection} className="text-green-600 hover:text-green-800 px-2 py-1">
                  Save
                </button>
                <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800 px-2 py-1">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{section.name}</h3>
                <p className="text-sm text-gray-500">
                  {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAddLesson(sectionIndex)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add Lesson
              </button>
              <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-600 p-1">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDeleteSection(sectionIndex)} className="text-gray-400 hover:text-red-600 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {editError && <p className="text-red-500 text-sm mt-2">{editError}</p>}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {lessonCount === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No lessons in this section yet.</p>
              <button
                onClick={() => onAddLesson(sectionIndex)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Add your first lesson
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedLessons.map((lesson, originalIndex) => {
                // Find the original index in the unsorted array
                const actualIndex = section.lessons.findIndex(l => l.id === lesson.id)
                return (
                  <LessonItem
                    key={lesson.id || `${section.id}-${originalIndex}`}
                    lesson={lesson}
                    sectionIndex={sectionIndex}
                    lessonIndex={actualIndex} // Use actual index for editing
                    onEdit={onEditLesson}
                    onDelete={onDeleteLesson}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SectionList = ({ sections, onChange, courseId }) => {
  const [expandedSections, setExpandedSections] = useState([0])
  const [editingLesson, setEditingLesson] = useState(null)
  const [isLessonEditorOpen, setIsLessonEditorOpen] = useState(false)
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)

  // Sort sections by ID (created order) or by a custom order field if you have one
  const getInitialContent = (contentType) => {
  switch (contentType) {
    case "TEXT":
      return { text_content: "" };
    case "PDF":
      return {
        file_url: "",
        file_public_id: "",
        file_type: "",
        file_size: null
      };
    case "VIDEO":
      return {
        file_url: "",
        file_public_id: "",
        file_type: "",
        file_size: null,
        video_duration: null,
        video_thumbnail: ""
      };
    case "REFERENCE_LINK":
      return {
        external_url: "",
        link_title: "",
        link_description: ""
      };
    case "ASSESSMENT":
      return {
        title: "",
        description: "",
        passing_score: 70,
        questions: []
      };
    default:
      return {};
  }
};
  const sortedSections = sections ? [...sections].sort((a, b) => {
    // If you have an order field, use it, otherwise sort by ID
    if (a.order_index !== undefined && b.order_index !== undefined) {
      return a.order_index - b.order_index
    }
    return a.id - b.id
  }) : []

  const toggleSection = useCallback((sectionIndex) => {
    setExpandedSections((prev) =>
      prev.includes(sectionIndex) ? prev.filter((index) => index !== sectionIndex) : [...prev, sectionIndex]
    )
  }, [])

  const addSection = useCallback(async () => {
    setApiError("")
    if (!courseId) {
      setApiError("Please save basic course information first (Step 1).")
      return
    }
    setLoading(true)
    try {
      const newSectionName = `Section ${sections.length + 1}`
      const response = await instructorAPI.createSection(courseId, newSectionName)
      const newSection = { ...response, lessons: [] }
      onChange([...sections, newSection])
      setExpandedSections((prev) => [...prev, sections.length])
    } catch (error) {
      console.error("Error creating section:", error)
      setApiError(error.response?.data?.detail || "Failed to create section.")
    } finally {
      setLoading(false)
    }
  }, [sections, onChange, courseId])

  const editSection = useCallback(
    async (sectionIndex, newName) => {
      setApiError("")
      // Use the original sections array index to find the section
      const originalSection = sections[sectionIndex]
      if (!originalSection || !originalSection.id) {
        setApiError("Cannot update unsaved section. Please save the course first.")
        return
      }
      setLoading(true)
      try {
        const response = await instructorAPI.updateSection(originalSection.id, newName)
        const updatedSections = sections.map((section, index) =>
          index === sectionIndex ? { ...section, name: response.name } : section
        )
        onChange(updatedSections)
      } catch (error) {
        console.error("Error updating section:", error)
        setApiError(error.response?.data?.detail || "Failed to update section.")
      } finally {
        setLoading(false)
      }
    },
    [sections, onChange]
  )

  const deleteSection = useCallback(
    async (sectionIndex) => {
      if (!window.confirm("Are you sure you want to delete this section and all its lessons?")) {
        return
      }
      setApiError("")
      const sectionToDelete = sections[sectionIndex]
      if (!sectionToDelete || !sectionToDelete.id) {
        const updatedSections = sections.filter((_, index) => index !== sectionIndex)
        onChange(updatedSections)
        setExpandedSections((prev) =>
          prev.filter((index) => index !== sectionIndex).map((index) => (index > sectionIndex ? index - 1 : index))
        )
        return
      }

      setLoading(true)
      try {
        await instructorAPI.deleteSection(sectionToDelete.id)
        const updatedSections = sections.filter((_, index) => index !== sectionIndex)
        onChange(updatedSections)
        setExpandedSections((prev) =>
          prev.filter((index) => index !== sectionIndex).map((index) => (index > sectionIndex ? index - 1 : index))
        )
      } catch (error) {
        console.error("Error deleting section:", error)
        setApiError(error.response?.data?.detail || "Failed to delete section.")
      } finally {
        setLoading(false)
      }
    },
    [sections, onChange]
  )

  const addLesson = useCallback(
    (sectionIndex) => {
      setApiError("")
      const section = sections[sectionIndex]
      if (!section || !section.id) {
        setApiError("Please save the section first before adding lessons to it.")
        return
      }
      setEditingLesson({ sectionIndex, lessonIndex: null, lesson: null })
      setIsLessonEditorOpen(true)
    },
    [sections]
  )

  // const editLesson = useCallback(
  //   (sectionIndex, lessonIndex) => {
  //     setApiError("")
  //     const lesson = sections[sectionIndex].lessons[lessonIndex]
      
  //     // Transform lesson data to match editor expectations
  //     const transformedLesson = {
  //       ...lesson,
  //       // Map lesson_content to content for the editor
  //       content: lesson.lesson_content ? {
  //         text_content: lesson.lesson_content.text_content || "",
  //         file_url: lesson.lesson_content.file_url || "",
  //         file_public_id: lesson.lesson_content.file_public_id || "",
  //         file_type: lesson.lesson_content.file_type || "",
  //         file_size: lesson.lesson_content.file_size || null,
  //         video_duration: lesson.lesson_content.video_duration || null,
  //         video_thumbnail: lesson.lesson_content.video_thumbnail || "",
  //         external_url: lesson.lesson_content.external_url || "",
  //         link_title: lesson.lesson_content.link_title || "",
  //         link_description: lesson.lesson_content.link_description || ""
  //       } : {}
  //     }
      
  //     setEditingLesson({
  //       sectionIndex,
  //       lessonIndex,
  //       lesson: transformedLesson
  //     })
  //     setIsLessonEditorOpen(true)
  //   },
  //   [sections]
  // )
const editLesson = useCallback((sectionIndex, lessonIndex) => {
  setApiError("");
  const section = sections[sectionIndex];
  
  if (!section || !section.lessons) {
    console.error("Section or lessons not found");
    return;
  }

  const lesson = section.lessons[lessonIndex];
  console.log("Original lesson data:", lesson);

  if (!lesson) {
    console.error("Lesson not found at index:", lessonIndex);
    return;
  }

  // Use lesson.content if it exists, otherwise use lesson.lesson_content
  const content = lesson.content || lesson.lesson_content || getInitialContent(lesson.content_type || "TEXT");

  const transformedLesson = {
    ...lesson,
    content: {
      // Text content
      text_content: content.text_content || "",
      
      // File content
      file_url: content.file_url || "",
      file_public_id: content.file_public_id || "",
      file_type: content.file_type || "",
      file_size: content.file_size || null,
      
      // Video specific
      video_duration: content.video_duration || null,
      video_thumbnail: content.video_thumbnail || "",
      
      // Reference link
      external_url: content.external_url || "",
      link_title: content.link_title || "",
      link_description: content.link_description || "",
      
      // For new uploads
      file: null,
      fileName: null
    }
  };

  console.log("Transformed lesson:", transformedLesson);
  
  setEditingLesson({
    sectionIndex,
    lessonIndex,
    lesson: transformedLesson
  });
  setIsLessonEditorOpen(true);
}, [sections]);

  const deleteLesson = useCallback(
    async (sectionIndex, lessonIndex) => {
      if (!window.confirm("Are you sure you want to delete this lesson?")) {
        return
      }

      setApiError("")
      const lessonToDelete = sections[sectionIndex].lessons[lessonIndex]
      if (!lessonToDelete || !lessonToDelete.id) {
        const updatedSections = sections.map((section, index) =>
          index === sectionIndex
            ? { ...section, lessons: section.lessons.filter((_, lIndex) => lIndex !== lessonIndex) }
            : section
        )
        onChange(updatedSections)
        return
      }

      setLoading(true)
      try {
        await instructorAPI.deleteLesson(lessonToDelete.id)
        const updatedSections = sections.map((section, index) =>
          index === sectionIndex
            ? { ...section, lessons: section.lessons.filter((_, lIndex) => lIndex !== lessonIndex) }
            : section
        )
        onChange(updatedSections)
      } catch (error) {
        console.error("Error deleting lesson:", error)
        setApiError(error.response?.data?.detail || "Failed to delete lesson.")
      } finally {
        setLoading(false)
      }
    },
    [sections, onChange]
  )

const handleLessonSave = useCallback((savedLesson) => {
  console.log('Saving lesson:', savedLesson);
  console.log('Current editingLesson:', editingLesson);
  
  if (!editingLesson) {
    console.error('No editingLesson state found');
    return;
  }

  const { sectionIndex, lessonIndex } = editingLesson;
  const updatedSections = sections.map((section, index) => {
    if (index === sectionIndex) {
      const updatedLessons = lessonIndex !== null
        ? section.lessons.map((lesson, lIndex) => 
            lIndex === lessonIndex ? savedLesson : lesson)
        : [...section.lessons, savedLesson];

      return { ...section, lessons: updatedLessons };
    }
    return section;
  });

  console.log('Updated sections:', updatedSections);
  onChange(updatedSections);
  setIsLessonEditorOpen(false);
  setEditingLesson(null);
}, [editingLesson, sections, onChange]);

  const cancelLessonEdit = useCallback(() => {
    setIsLessonEditorOpen(false)
    setEditingLesson(null)
    setApiError("")
  }, [])

  const hasValidSections = sortedSections.length > 0
  const allSectionsHaveLessons = sortedSections.every((section) => section.lessons && section.lessons.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Course Curriculum</h3>
          <p className="text-sm text-gray-600">Organize your course content into sections and lessons</p>
        </div>
        <button
          onClick={addSection}
          disabled={loading || !courseId}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </span>
          ) : (
            <>
              <Plus className="w-4 h-4 inline mr-2" />
              Add Section
            </>
          )}
        </button>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{apiError}</div>
      )}

      {!hasValidSections && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium mb-1">No sections created yet</p>
          <p className="text-sm mb-4">Start building your course by adding your first section</p>
          <button
            onClick={addSection}
            disabled={loading || !courseId}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create First Section
          </button>
        </div>
      )}

      {hasValidSections && (
        <div className="space-y-4">
          {sortedSections.map((section, displayIndex) => {
            // Find the original index in the unsorted sections array
            const originalIndex = sections.findIndex(s => s.id === section.id)
            return (
              <SectionItem
                key={section.id || displayIndex}
                section={section}
                sectionIndex={originalIndex} // Use original index for operations
                onEditSection={editSection}
                onDeleteSection={deleteSection}
                onAddLesson={addLesson}
                onEditLesson={editLesson}
                onDeleteLesson={deleteLesson}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                apiError={apiError}
              />
            )
          })}
        </div>
      )}

      {hasValidSections && !allSectionsHaveLessons && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-3">⚠️</div>
            <div>
              <h4 className="font-medium text-yellow-800">Incomplete Sections</h4>
              <p className="text-sm text-yellow-700">
                Each section must have at least one lesson before you can proceed.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* <LessonEditor
        lesson={editingLesson?.lesson}
        onSave={handleLessonSave}
        onCancel={cancelLessonEdit}
        isOpen={isLessonEditorOpen}
        courseId={courseId}
        sectionId={typeof editingLesson?.sectionIndex === 'number' && sections[editingLesson.sectionIndex] ? sections[editingLesson.sectionIndex].id : null}
      /> */}
{isLessonEditorOpen && (
  <LessonEditor
    key={editingLesson?.lesson?.id || 'new-lesson'}
    lesson={editingLesson?.lesson}
    onSave={handleLessonSave}
    onCancel={cancelLessonEdit}
    isOpen={isLessonEditorOpen}
    courseId={courseId}
    sectionId={sections[editingLesson?.sectionIndex]?.id}
  />
)}
    </div>
  )
}

export default SectionList