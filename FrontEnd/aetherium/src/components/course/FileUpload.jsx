"use client"

import { Upload, FileText } from "lucide-react"

const FileUpload = ({ label, description, accept, onChange, selectedFile, existingFileUrl, icon }) => {
  const inputId = `file-upload-${label.replace(/\s+/g, "-").toLowerCase()}`
  const isVideo = accept?.includes("video")
  const isImage = accept?.includes("image")

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {/* Show existing file preview */}
        {existingFileUrl && !selectedFile && (
          <div className="mb-4">
            {isImage ? (
              <img
                src={existingFileUrl || "/placeholder.svg"}
                alt="Current file"
                className="w-full h-32 object-cover rounded-lg"
              />
            ) : isVideo ? (
              <video src={existingFileUrl} className="w-full h-32 object-cover rounded-lg" controls />
            ) : (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <FileText size={20} />
                <span className="text-sm">Current file uploaded</span>
              </div>
            )}
            <p className="text-xs text-green-600 mt-2">Current file</p>
          </div>
        )}

        {/* Show selected file preview */}
        {selectedFile && (
          <div className="mb-4">
            {isImage ? (
              <img
                src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                alt="Selected file"
                className="w-full h-32 object-cover rounded-lg"
              />
            ) : isVideo ? (
              <video src={URL.createObjectURL(selectedFile)} className="w-full h-32 object-cover rounded-lg" controls />
            ) : (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <FileText size={20} />
                <span className="text-sm">{selectedFile.name}</span>
              </div>
            )}
            <p className="text-xs text-blue-600 mt-2">New file selected</p>
          </div>
        )}

        {/* Upload area */}
        {!existingFileUrl && !selectedFile && (
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            {icon || <Upload className="text-gray-400" size={24} />}
          </div>
        )}

        <p className="text-sm text-gray-600 mb-2">{description}</p>

        <input type="file" onChange={onChange} accept={accept} className="hidden" id={inputId} />
        <label
          htmlFor={inputId}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <Upload size={16} className="mr-2" />
          {existingFileUrl || selectedFile ? "Change" : "Upload"} {label.includes("Image") ? "Image" : "Video"}
        </label>
      </div>
    </div>
  )
}

export default FileUpload
