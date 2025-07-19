
import SectionList from "../lesson/SectionList" 

const EnhancedSectionEditor = ({ sections, onSectionsChange, courseId, errors }) => {

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
