"use client"

import { useState } from "react"
import SectionManager from "../lesson/SectionManager"
import { lessonAPI } from "../../services/lessonAPI"
import { instructorAPI } from "../../services/instructorAPI"

const EnhancedSectionEditor = ({ sections, onSectionsChange, courseId, errors }) => {
  const [loading, setLoading] = useState(false)

  const handleSectionsChange = async (updatedSections) => {
    try {
      setLoading(true)

      // Transform sections data for API
      const sectionsData = updatedSections.map((section) => ({
        name: section.name,
        lessons:
          section.lessons?.map((lesson) => ({
            name: lesson.name,
            content_type: lesson.content_type,
            content_url: lesson.content_url,
            duration: lesson.duration,
            description: lesson.description,
            content_data: lesson.content,
            order_index: lesson.order_index || 0,
            assessment: lesson.content_type === "ASSESSMENT" ? lesson.assessment : null,
          })) || [],
      }))

      // Update sections via API if courseId exists
      if (courseId) {
        await instructorAPI.updateStep3(courseId, { sections: sectionsData })
      }

      // Update local state
      onSectionsChange(updatedSections)
    } catch (error) {
      console.error("Error updating sections:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    try {
      const result = await lessonAPI.uploadLessonContent(file)
      return result.content_url
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <SectionManager
        sections={sections}
        onChange={handleSectionsChange}
        onFileUpload={handleFileUpload}
        loading={loading}
      />

      {errors?.sections && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{errors.sections}</p>
        </div>
      )}
    </div>
  )
}

export default EnhancedSectionEditor
