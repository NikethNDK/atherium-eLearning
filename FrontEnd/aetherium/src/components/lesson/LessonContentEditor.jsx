import { FileText, Link, Video, FileQuestion, Type } from "lucide-react"

const ContentTypeSelector = ({ selectedType, onTypeChange }) => {
  const contentTypes = [
    { type: "TEXT", label: "Text Content", icon: Type },
    { type: "PDF", label: "PDF Document", icon: FileText },
    { type: "VIDEO", label: "Video", icon: Video },
    { type: "REFERENCE_LINK", label: "Reference Link", icon: Link },
    { type: "ASSESSMENT", label: "Assessment", icon: FileQuestion },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
      {contentTypes.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`p-3 rounded-lg border-2 transition-all ${
            selectedType === type ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Icon className="w-5 h-5 mx-auto mb-1" />
          <div className="text-xs font-medium">{label}</div>
        </button>
      ))}
    </div>
  )
}

const TextContentEditor = ({ content, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
      <textarea
        value={content.text || ""}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Enter your lesson content here..."
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
)

const PDFContentEditor = ({ content, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">PDF Document</label>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          const file = e.target.files[0]
          onChange({ ...content, file, fileName: file?.name })
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {content.fileName && <p className="text-sm text-gray-600 mt-1">Selected: {content.fileName}</p>}
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
      <textarea
        value={content.description || ""}
        onChange={(e) => onChange({ ...content, description: e.target.value })}
        placeholder="Brief description of the PDF content..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
)

const VideoContentEditor = ({ content, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files[0]
          onChange({ ...content, file, fileName: file?.name })
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {content.fileName && <p className="text-sm text-gray-600 mt-1">Selected: {content.fileName}</p>}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
        <input
          type="number"
          value={content.duration || ""}
          onChange={(e) => onChange({ ...content, duration: Number.parseInt(e.target.value) })}
          placeholder="Duration in minutes"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Video Quality</label>
        <select
          value={content.quality || "HD"}
          onChange={(e) => onChange({ ...content, quality: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="HD">HD (720p)</option>
          <option value="FHD">Full HD (1080p)</option>
          <option value="4K">4K (2160p)</option>
        </select>
      </div>
    </div>
  </div>
)

const ReferenceLinkEditor = ({ content, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Reference URL</label>
      <input
        type="url"
        value={content.url || ""}
        onChange={(e) => onChange({ ...content, url: e.target.value })}
        placeholder="https://example.com"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Link Title</label>
      <input
        type="text"
        value={content.title || ""}
        onChange={(e) => onChange({ ...content, title: e.target.value })}
        placeholder="Enter a descriptive title for the link"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
      <textarea
        value={content.description || ""}
        onChange={(e) => onChange({ ...content, description: e.target.value })}
        placeholder="Why is this resource useful?"
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
)

const LessonContentEditor = ({ contentType, content, onChange }) => {
  const renderEditor = () => {
    switch (contentType) {
      case "TEXT":
        return <TextContentEditor content={content} onChange={onChange} />
      case "PDF":
        return <PDFContentEditor content={content} onChange={onChange} />
      case "VIDEO":
        return <VideoContentEditor content={content} onChange={onChange} />
      case "REFERENCE_LINK":
        return <ReferenceLinkEditor content={content} onChange={onChange} />
      default:
        return null
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-4">Content Details</h4>
      {renderEditor()}
    </div>
  )
}

export { ContentTypeSelector, LessonContentEditor }
