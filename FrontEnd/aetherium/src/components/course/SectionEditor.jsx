"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import LessonEditor from "./LessonEditor"

const SectionEditor = ({
  sections,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}) => {
  const [newSectionName, setNewSectionName] = useState("")
  const [editingSectionId, setEditingSectionId] = useState(null)
  const [editSectionName, setEditSectionName] = useState("")
  const [expandedSections, setExpandedSections] = useState(new Set())

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      onAddSection(newSectionName.trim())
      setNewSectionName("")
    }
  }

  const handleEditSection = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId)
    setEditingSectionId(sectionId)
    setEditSectionName(section.name)
  }

  const handleSaveEdit = (sectionId) => {
    if (editSectionName.trim()) {
      onEditSection(sectionId, editSectionName.trim())
      setEditingSectionId(null)
      setEditSectionName("")
    }
  }

  const handleCancelEdit = () => {
    setEditingSectionId(null)
    setEditSectionName("")
  }

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={section.id || index} className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id || index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {expandedSections.has(section.id || index) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs">≡</div>
                <span className="font-medium">Section {String(index + 1).padStart(2, "0")}:</span>

                {editingSectionId === (section.id || index) ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editSectionName}
                      onChange={(e) => setEditSectionName(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleSaveEdit(section.id || index)
                        if (e.key === "Escape") handleCancelEdit()
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(section.id || index)}
                      className="text-green-600 hover:text-green-700 text-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-700 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span>{section.name}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onAddLesson(section.id || index)}
                  className="p-1 text-gray-400 hover:text-green-600"
                  title="Add Lesson"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleEditSection(section.id || index)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Edit Section"
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSection(index)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete Section"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {expandedSections.has(section.id || index) && (
            <div className="p-4">
              <LessonEditor
                sectionId={section.id || index}
                lessons={section.lessons || []}
                onAddLesson={onAddLesson}
                onEditLesson={onEditLesson}
                onDeleteLesson={onDeleteLesson}
              />
            </div>
          )}
        </div>
      ))}

      {/* Add New Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Section name"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAddSection()
            }}
          />
          <button
            type="button"
            onClick={handleAddSection}
            disabled={!newSectionName.trim()}
            className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  )
}

export default SectionEditor
