"use client"

import { useState } from "react"
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

const LessonItem = ({ lesson, onEdit, onDelete, sectionIndex, lessonIndex }) => {
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
        <div className="text-blue-600">{getContentIcon(lesson.content_type)}</div>
        <div>
          <h4 className="font-medium text-gray-900">{lesson.name}</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {getContentTypeLabel(lesson.content_type)}
            </span>
            {lesson.duration && <span>{lesson.duration} min</span>}
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
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [sectionName, setSectionName] = useState(section.name)

  const handleSaveSection = () => {
    if (sectionName.trim()) {
      onEditSection(sectionIndex, sectionName.trim())
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setSectionName(section.name)
    setIsEditing(false)
  }

  const isExpanded = expandedSections.includes(sectionIndex)
  const lessonCount = section.lessons?.length || 0

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
              {section.lessons.map((lesson, lessonIndex) => (
                <LessonItem
                  key={lessonIndex}
                  lesson={lesson}
                  sectionIndex={sectionIndex}
                  lessonIndex={lessonIndex}
                  onEdit={onEditLesson}
                  onDelete={onDeleteLesson}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SectionManager = ({ sections, onChange }) => {
  const [expandedSections, setExpandedSections] = useState([0])
  const [editingLesson, setEditingLesson] = useState(null)
  const [isLessonEditorOpen, setIsLessonEditorOpen] = useState(false)

  const toggleSection = (sectionIndex) => {
    setExpandedSections((prev) =>
      prev.includes(sectionIndex) ? prev.filter((index) => index !== sectionIndex) : [...prev, sectionIndex],
    )
  }

  const addSection = () => {
    const newSection = {
      name: `Section ${sections.length + 1}`,
      lessons: [],
    }
    onChange([...sections, newSection])
    setExpandedSections((prev) => [...prev, sections.length])
  }

  const editSection = (sectionIndex, newName) => {
    const updatedSections = sections.map((section, index) =>
      index === sectionIndex ? { ...section, name: newName } : section,
    )
    onChange(updatedSections)
  }

  const deleteSection = (sectionIndex) => {
    if (window.confirm("Are you sure you want to delete this section and all its lessons?")) {
      const updatedSections = sections.filter((_, index) => index !== sectionIndex)
      onChange(updatedSections)
      setExpandedSections((prev) =>
        prev.filter((index) => index !== sectionIndex).map((index) => (index > sectionIndex ? index - 1 : index)),
      )
    }
  }

  const addLesson = (sectionIndex) => {
    setEditingLesson({ sectionIndex, lessonIndex: null, lesson: null })
    setIsLessonEditorOpen(true)
  }

  const editLesson = (sectionIndex, lessonIndex) => {
    setEditingLesson({
      sectionIndex,
      lessonIndex,
      lesson: sections[sectionIndex].lessons[lessonIndex],
    })
    setIsLessonEditorOpen(true)
  }

  const deleteLesson = (sectionIndex, lessonIndex) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      const updatedSections = sections.map((section, index) =>
        index === sectionIndex
          ? { ...section, lessons: section.lessons.filter((_, lIndex) => lIndex !== lessonIndex) }
          : section,
      )
      onChange(updatedSections)
    }
  }

  const saveLesson = (lessonData) => {
    const { sectionIndex, lessonIndex } = editingLesson

    const updatedSections = sections.map((section, index) => {
      if (index === sectionIndex) {
        const updatedLessons =
          lessonIndex !== null
            ? section.lessons.map((lesson, lIndex) => (lIndex === lessonIndex ? lessonData : lesson))
            : [...section.lessons, lessonData]

        return { ...section, lessons: updatedLessons }
      }
      return section
    })

    onChange(updatedSections)
    setIsLessonEditorOpen(false)
    setEditingLesson(null)
  }

  const cancelLessonEdit = () => {
    setIsLessonEditorOpen(false)
    setEditingLesson(null)
  }

  // Validation
  const hasValidSections = sections.length > 0
  const allSectionsHaveLessons = sections.every((section) => section.lessons && section.lessons.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Course Curriculum</h3>
          <p className="text-sm text-gray-600">Organize your course content into sections and lessons</p>
        </div>
        <button
          onClick={addSection}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Section
        </button>
      </div>

      {!hasValidSections && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium mb-1">No sections created yet</p>
          <p className="text-sm mb-4">Start building your course by adding your first section</p>
          <button
            onClick={addSection}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Section
          </button>
        </div>
      )}

      {hasValidSections && (
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <SectionItem
              key={sectionIndex}
              section={section}
              sectionIndex={sectionIndex}
              onEditSection={editSection}
              onDeleteSection={deleteSection}
              onAddLesson={addLesson}
              onEditLesson={editLesson}
              onDeleteLesson={deleteLesson}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
            />
          ))}
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

      <LessonEditor
        lesson={editingLesson?.lesson}
        onSave={saveLesson}
        onCancel={cancelLessonEdit}
        isOpen={isLessonEditorOpen}
      />
    </div>
  )
}

export default SectionManager
