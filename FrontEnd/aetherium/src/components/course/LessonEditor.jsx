"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, FileText, Paperclip, ImageIcon, Volume2, Video, Link } from "lucide-react"

const LessonEditor = ({ sectionId, lessons, onAddLesson, onEditLesson, onDeleteLesson }) => {
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [newLesson, setNewLesson] = useState({
    name: "",
    type: "text",
    content: "",
    file: null,
  })

  const lessonTypes = [
    { value: "text", label: "Text", icon: FileText },
    { value: "file", label: "File Attachment", icon: Paperclip },
    { value: "image", label: "Image", icon: ImageIcon },
    { value: "audio", label: "Audio File", icon: Volume2 },
    { value: "video", label: "Video File", icon: Video },
    { value: "link", label: "Reference Link", icon: Link },
  ]

  const handleAddLesson = () => {
    if (newLesson.name.trim()) {
      onAddLesson(sectionId, newLesson)
      setNewLesson({ name: "", type: "text", content: "", file: null })
      setShowAddLesson(false)
    }
  }

  const handleFileChange = (e) => {
    setNewLesson((prev) => ({ ...prev, file: e.target.files[0] }))
  }

  const getLessonIcon = (type) => {
    const lessonType = lessonTypes.find((t) => t.value === type)
    return lessonType ? lessonType.icon : FileText
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson, index) => {
        const IconComponent = getLessonIcon(lesson.type)
        return (
          <div
            key={lesson.id || index}
            className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0"
          >
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <IconComponent size={14} className="text-gray-600" />
            </div>
            <span className="flex-1 text-gray-700">{lesson.name}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{lesson.type}</span>
            <span className="text-sm text-gray-500">07:31</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => onEditLesson(sectionId, lesson.id || index)}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                <Edit size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteLesson(sectionId, lesson.id || index)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )
      })}

      {showAddLesson ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Name</label>
              <input
                type="text"
                value={newLesson.name}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter lesson name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
              <select
                value={newLesson.type}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {lessonTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {newLesson.type === "text" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newLesson.content}
                  onChange={(e) => setNewLesson((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter lesson content"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}

            {newLesson.type === "link" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={newLesson.content}
                  onChange={(e) => setNewLesson((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}

            {["file", "image", "audio", "video"].includes(newLesson.type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    newLesson.type === "image"
                      ? "image/*"
                      : newLesson.type === "audio"
                        ? "audio/*"
                        : newLesson.type === "video"
                          ? "video/*"
                          : "*/*"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddLesson(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLesson}
                className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Add Lesson
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddLesson(true)}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
        >
          <Plus size={16} className="inline mr-2" />
          Add Lesson
        </button>
      )}
    </div>
  )
}

export default LessonEditor
