// // import { FileText, Link, Video, FileQuestion, Type } from "lucide-react"

// // const ContentTypeSelector = ({ selectedType, onTypeChange }) => {
// //   const contentTypes = [
// //     { type: "TEXT", label: "Text Content", icon: Type },
// //     { type: "PDF", label: "PDF Document", icon: FileText },
// //     { type: "VIDEO", label: "Video", icon: Video },
// //     { type: "REFERENCE_LINK", label: "Reference Link", icon: Link },
// //     { type: "ASSESSMENT", label: "Assessment", icon: FileQuestion },
// //   ]

// //   return (
// //     <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
// //       {contentTypes.map(({ type, label, icon: Icon }) => (
// //         <button
// //           key={type}
// //           onClick={() => onTypeChange(type)}
// //           className={`p-3 rounded-lg border-2 transition-all ${
// //             selectedType === type ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
// //           }`}
// //         >
// //           <Icon className="w-5 h-5 mx-auto mb-1" />
// //           <div className="text-xs font-medium">{label}</div>
// //         </button>
// //       ))}
// //     </div>
// //   )
// // }

// // const TextContentEditor = ({ content, onChange }) => (
// //   <div className="space-y-4">
// //     <div>
// //       <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
// //       <textarea
// //         value={content.text_content || ""}
// //         onChange={(e) => onChange({ ...content, text_content: e.target.value })}
// //         placeholder="Enter your lesson content here..."
// //         rows={8}
// //         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //       />
// //     </div>
// //   </div>
// // )

// // const PDFContentEditor = ({ content, onChange }) => (
// //   <div className="space-y-4">
// //     <div>
// //       <label className="block text-sm font-medium text-gray-700 mb-2">PDF Document</label>
// //       <input
// //         type="file"
// //         accept=".pdf"
// //         onChange={(e) => {
// //           const file = e.target.files[0]
// //           onChange({ ...content, file, fileName: file?.name })
// //         }}
// //         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //       />
// //       {content.fileName && <p className="text-sm text-gray-600 mt-1">Selected: {content.fileName}</p>}
// //     </div>
// //     {/* <div>
// //       <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
// //       <textarea
// //         value={content.description || ""}
// //         onChange={(e) => onChange({ ...content, description: e.target.value })}
// //         placeholder="Brief description of the PDF content..."
// //         rows={3}
// //         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //       />
// //     </div> */}
// //   </div>
// // )

// // const VideoContentEditor = ({ content, onChange }) => (
// //   <div className="space-y-4">
// //     <div>
// //       <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
// //       <input
// //         type="file"
// //         accept="video/*"
// //         onChange={(e) => {
// //           const file = e.target.files[0]
// //           onChange({ ...content, file, fileName: file?.name })
// //         }}
// //         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //       />
// //       {content.fileName && <p className="text-sm text-gray-600 mt-1">Selected: {content.fileName}</p>}
// //     </div>
// //     <div className="grid grid-cols-2 gap-4">
// //       <div>
// //         <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
// //         <input
// //           type="number"
// //           value={content.duration || ""}
// //           onChange={(e) => onChange({ ...content, duration: Number.parseInt(e.target.value) })}
// //           placeholder="Duration in minutes"
// //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //         />
// //       </div>
// //       <div>
// //         <label className="block text-sm font-medium text-gray-700 mb-2">Video Quality</label>
// //         <select
// //           value={content.quality || "HD"}
// //           onChange={(e) => onChange({ ...content, quality: e.target.value })}
// //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //         >
// //           <option value="HD">HD (720p)</option>
// //           <option value="FHD">Full HD (1080p)</option>
// //           <option value="4K">4K (2160p)</option>
// //         </select>
// //       </div>
// //     </div>
// //   </div>
// // )

// // const ReferenceLinkEditor = ({ content, onChange }) => (
// //   <div className="space-y-4">
// //     <div>
// //       <label className="block text-sm font-medium text-gray-700 mb-2">Reference URL</label>
// //       <input
// //         type="url"
// //         value={content.url || ""}
// //         onChange={(e) => onChange({ ...content, url: e.target.value })}
// //         placeholder="https://example.com"
// //         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //       />
// //     </div>
// //     <div>
// //       <label className="block text-sm font-medium text-gray-700 mb-2">Link Title</label>
// //       <input
// //         type="text"
// //         value={content.title || ""}
// //         onChange={(e) => onChange({ ...content, title: e.target.value })}
// //         placeholder="Enter a descriptive title for the link"
// //         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //       />
// //     </div>
// //     <div>
// //       <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
// //       <textarea
// //         value={content.description || ""}
// //         onChange={(e) => onChange({ ...content, description: e.target.value })}
// //         placeholder="Why is this resource useful?"
// //         rows={3}
// //         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //       />
// //     </div>
// //   </div>
// // )

// // const LessonContentEditor = ({ contentType, content, onChange }) => {
// //   const renderEditor = () => {
// //     switch (contentType) {
// //       case "TEXT":
// //         return <TextContentEditor content={content} onChange={onChange} />
// //       case "PDF":
// //         return <PDFContentEditor content={content} onChange={onChange} />
// //       case "VIDEO":
// //         return <VideoContentEditor content={content} onChange={onChange} />
// //       case "REFERENCE_LINK":
// //         return <ReferenceLinkEditor content={content} onChange={onChange} />
// //       default:
// //         return null
// //     }
// //   }

// //   return (
// //     <div className="bg-gray-50 p-4 rounded-lg">
// //       <h4 className="font-medium text-gray-900 mb-4">Content Details</h4>
// //       {renderEditor()}
// //     </div>
// //   )
// // }

// // export { ContentTypeSelector, LessonContentEditor }
// import { FileText, Link, Video, FileQuestion, Type } from "lucide-react"
// import AssessmentEditor from './AssessmentEditor';

// const ContentTypeSelector = ({ selectedType, onTypeChange }) => {
//   const contentTypes = [
//     { type: "TEXT", label: "Text Content", icon: Type },
//     { type: "PDF", label: "PDF Document", icon: FileText },
//     { type: "VIDEO", label: "Video", icon: Video },
//     { type: "REFERENCE_LINK", label: "Reference Link", icon: Link },
//     { type: "ASSESSMENT", label: "Assessment", icon: FileQuestion },
//   ]

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
//       {contentTypes.map(({ type, label, icon: Icon }) => (
//         <button
//           key={type}
//           onClick={() => onTypeChange(type)}
//           className={`p-3 rounded-lg border-2 transition-all ${
//             selectedType === type ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
//           }`}
//         >
//           <Icon className="w-5 h-5 mx-auto mb-1" />
//           <div className="text-xs font-medium">{label}</div>
//         </button>
//       ))}
//     </div>
//   )
// }
// const TextContentEditor = ({ lesson_content, onChange }) => (
//   <div className="space-y-4">
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
//       <textarea
//         value={lesson_content.text_content || ""}
//         onChange={(e) => onChange({ ...lesson_content, text_content: e.target.value })}
//         placeholder="Enter your lesson content here..."
//         rows={8}
//         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//       />
//     </div>
//   </div>
// );

// const PDFContentEditor = ({ lesson_content, onChange }) => {
//   const hasExistingFile = lesson_content.file_url && !lesson_content.file

//   return (
//     <div className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">PDF Document</label>
        
//         {hasExistingFile && (
//           <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-blue-800">Current PDF</p>
//                 <p className="text-xs text-blue-600">
//                   {lesson_content.file_type?.toUpperCase()} • {lesson_content.file_size ? `${Math.round(lesson_content.file_size / 1024)} KB` : 'Unknown size'}
//                 </p>
//               </div>
//               <a
//                 href={lesson_content.file_url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//               >
//                 View PDF
//               </a>
//             </div>
//           </div>
//         )}

//         <input
//           type="file"
//           accept=".pdf"
//           onChange={(e) => {
//             const file = e.target.files[0]
//             onChange({ 
//               ...lesson_content, 
//               file, 
//               fileName: file?.name,
//               file_url: file ? null : lesson_content.file_url,
//               file_public_id: file ? null : lesson_content.file_public_id
//             })
//           }}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         />
        
//         {lesson_content.fileName && (
//           <p className="text-sm text-gray-600 mt-1">Selected: {lesson_content.fileName}</p>
//         )}
        
//         {hasExistingFile && !lesson_content.file && (
//           <p className="text-xs text-gray-500 mt-1">
//             Select a new file to replace the current PDF
//           </p>
//         )}
//       </div>
//     </div>
//   )
// }


// const VideoContentEditor = ({ lesson_content, onChange }) => {
//   const hasExistingFile = lesson_content.file_url && !lesson_content.file

//   return (
//     <div className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
        
//         {hasExistingFile && (
//           <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-blue-800">Current Video</p>
//                 <p className="text-xs text-blue-600">
//                   {lesson_content.file_type?.toUpperCase()} • 
//                   {lesson_content.file_size ? ` ${Math.round(lesson_content.file_size / (1024 * 1024))} MB` : ' Unknown size'}
//                   {lesson_content.video_duration ? ` • ${lesson_content.video_duration} min` : ''}
//                 </p>
//               </div>
//               <a
//                 href={lesson_content.file_url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//               >
//                 View Video
//               </a>
//             </div>
//           </div>
//         )}

//         <input
//           type="file"
//           accept="video/*"
//           onChange={(e) => {
//             const file = e.target.files[0]
//             onChange({ 
//               ...lesson_content, 
//               file, 
//               fileName: file?.name,
//               file_url: file ? null : lesson_content.file_url,
//               file_public_id: file ? null : lesson_content.file_public_id,
//               video_duration: file ? null : lesson_content.video_duration,
//               video_thumbnail: file ? null : lesson_content.video_thumbnail
//             })
//           }}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         />
        
//         {lesson_content.fileName && (
//           <p className="text-sm text-gray-600 mt-1">Selected: {lesson_content.fileName}</p>
//         )}
        
//         {hasExistingFile && !lesson_content.file && (
//           <p className="text-xs text-gray-500 mt-1">
//             Select a new file to replace the current video
//           </p>
//         )}
//       </div>
      
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
//           <input
//             type="number"
//             value={lesson_content.duration || lesson_content.video_duration || ""}
//             onChange={(e) => onChange({ 
//               ...lesson_content, 
//               duration: parseInt(e.target.value),
//               video_duration: parseInt(e.target.value)
//             })}
//             placeholder="Duration in minutes"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Video Quality</label>
//           <select
//             value={lesson_content.quality || "HD"}
//             onChange={(e) => onChange({ ...lesson_content, quality: e.target.value })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="HD">HD (720p)</option>
//             <option value="FHD">Full HD (1080p)</option>
//             <option value="4K">4K (2160p)</option>
//           </select>
//         </div>
//       </div>
//     </div>
//   )
// }

// const ReferenceLinkEditor = ({ lesson_content, onChange }) =>{
//   console.log('ReferenceLinkEditor received:', lesson_content);
//   const content = {
//     external_url: '',
//     link_title: '',
//     link_description: '',
//     ...lesson_content
//   };

//   return (
//     <div className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Reference URL</label>
//         <input
//           type="url"
//           value={content.external_url}
//           onChange={(e) => onChange({ ...content, external_url: e.target.value })}
//           placeholder="https://example.com"
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Link Title</label>
//         <input
//           type="text"
//           value={content.link_title}
//           onChange={(e) => onChange({ 
//             ...content, 
//             link_title: e.target.value 
//           })}
//           placeholder="Enter a descriptive title for the link"
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//         <textarea
//           value={content.link_description}
//           onChange={(e) => onChange({ 
//             ...content, 
//             link_description: e.target.value 
//           })}
//           placeholder="Why is this resource useful?"
//           rows={3}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         />
//       </div>
//     </div>
//   );
// };

// // const AssessmentEditor = ({ assessment, onChange }) => (
// //   <div className="space-y-4">
// //     <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
// //       <h4 className="font-medium text-yellow-800 mb-2">Assessment Content</h4>
// //       <p className="text-sm text-yellow-700">
// //         Assessment functionality will be implemented in a future update. 
// //         For now, you can use this as a placeholder for quiz content.
// //       </p>
// //     </div>
    
// //     <div>
// //       <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Instructions</label>
// //       <textarea
// //         value={assessment.instructions || ""}
// //         onChange={(e) => onChange({ ...assessment, instructions: e.target.value })}
// //         placeholder="Instructions for students taking this assessment..."
// //         rows={4}
// //         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //       />
// //     </div>
    
// //     <div className="grid grid-cols-2 gap-4">
// //       <div>
// //         <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
// //         <input
// //           type="number"
// //           value={assessment.time_limit || ""}
// //           onChange={(e) => onChange({ ...assessment, time_limit: parseInt(e.target.value) })}
// //           placeholder="e.g., 30"
// //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //         />
// //       </div>
// //       <div>
// //         <label className="block text-sm font-medium text-gray-700 mb-2">Total Questions</label>
// //         <input
// //           type="number"
// //           value={assessment.total_questions || ""}
// //           onChange={(e) => onChange({ ...assessment, total_questions: parseInt(e.target.value) })}
// //           placeholder="e.g., 10"
// //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //         />
// //       </div>
// //     </div>
// //   </div>
// // )

// const LessonContentEditor = ({ contentType, lesson_content,assessment, onChange }) => {
//   console.log('LessonContentEditor received:', { contentType, lesson_content });

//   const renderEditor = () => {
//     switch (contentType) {
//       case "TEXT":
//         return <TextContentEditor lesson_content={lesson_content} onChange={onChange} />;
//       case "PDF":
//         return <PDFContentEditor lesson_content={lesson_content} onChange={onChange} />;
//       case "VIDEO":
//         return <VideoContentEditor lesson_content={lesson_content} onChange={onChange} />;
//       case "REFERENCE_LINK":
//         return <ReferenceLinkEditor lesson_content={lesson_content} onChange={onChange} />;
//       case "ASSESSMENT":
//         return <AssessmentEditor type={'fromLessoon 482'} assessment={assessment} onChange={onChange} />;
//       default:
//         return (
//           <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
//             Select a content type to configure lesson content
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="bg-gray-50 p-4 rounded-lg">
//       <h4 className="font-medium text-gray-900 mb-4">Content Details</h4>
//       {renderEditor()}
//     </div>
//   );
// };

// export { ContentTypeSelector, LessonContentEditor }
import React from "react";
import { FileText, Link, Video, FileQuestion, Type } from "lucide-react"
import AssessmentEditor from './AssessmentEditor';

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

const TextContentEditor = ({ lesson_content, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
      <textarea
        value={lesson_content.text_content || ""}
        onChange={(e) => onChange({ ...lesson_content, text_content: e.target.value })}
        placeholder="Enter your lesson content here..."
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
);

const PDFContentEditor = ({ lesson_content, onChange }) => {
  const hasExistingFile = lesson_content.file_url && !lesson_content.file
  const [error, setError] = React.useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate PDF file
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF file (only .pdf files are allowed)')
      e.target.value = '' // Clear the file input
      return
    }

    setError(null)
    onChange({ 
      ...lesson_content, 
      file, 
      fileName: file.name,
      file_url: file ? null : lesson_content.file_url,
      file_public_id: file ? null : lesson_content.file_public_id
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">PDF Document</label>
        
        {hasExistingFile && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Current PDF</p>
                <p className="text-xs text-blue-600">
                  {lesson_content.file_type?.toUpperCase()} • {lesson_content.file_size ? `${Math.round(lesson_content.file_size / 1024)} KB` : 'Unknown size'}
                </p>
              </div>
              <a
                href={lesson_content.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View PDF
              </a>
            </div>
          </div>
        )}

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {lesson_content.fileName && (
          <p className="text-sm text-gray-600 mt-1">Selected: {lesson_content.fileName}</p>
        )}
        
        {hasExistingFile && !lesson_content.file && (
          <p className="text-xs text-gray-500 mt-1">
            Select a new file to replace the current PDF
          </p>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

const VideoContentEditor = ({ lesson_content, onChange }) => {
  const hasExistingFile = lesson_content.file_url && !lesson_content.file
  const [error, setError] = React.useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate video file
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    const validExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv']
    
    if (!validVideoTypes.includes(file.type) && 
        !validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setError('Please upload a valid video file (MP4, WebM, OGG, MOV, AVI, or WMV)')
      e.target.value = '' // Clear the file input
      return
    }

    setError(null)
    onChange({ 
      ...lesson_content, 
      file, 
      fileName: file.name,
      file_url: file ? null : lesson_content.file_url,
      file_public_id: file ? null : lesson_content.file_public_id,
      video_duration: file ? null : lesson_content.video_duration,
      video_thumbnail: file ? null : lesson_content.video_thumbnail
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
        
        {hasExistingFile && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Current Video</p>
                <p className="text-xs text-blue-600">
                  {lesson_content.file_type?.toUpperCase()} • 
                  {lesson_content.file_size ? ` ${Math.round(lesson_content.file_size / (1024 * 1024))} MB` : ' Unknown size'}
                  {lesson_content.video_duration ? ` • ${lesson_content.video_duration} min` : ''}
                </p>
              </div>
              <a
                href={lesson_content.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Video
              </a>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {lesson_content.fileName && (
          <p className="text-sm text-gray-600 mt-1">Selected: {lesson_content.fileName}</p>
        )}
        
        {hasExistingFile && !lesson_content.file && (
          <p className="text-xs text-gray-500 mt-1">
            Select a new file to replace the current video
          </p>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
          <input
            type="number"
            value={lesson_content.duration || lesson_content.video_duration || ""}
            onChange={(e) => onChange({ 
              ...lesson_content, 
              duration: parseInt(e.target.value),
              video_duration: parseInt(e.target.value)
            })}
            placeholder="Duration in minutes"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Video Quality</label>
          <select
            value={lesson_content.quality || "HD"}
            onChange={(e) => onChange({ ...lesson_content, quality: e.target.value })}
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
}

const ReferenceLinkEditor = ({ lesson_content, onChange }) => {
  console.log('ReferenceLinkEditor received:', lesson_content);
  const content = {
    external_url: '',
    link_title: '',
    link_description: '',
    ...lesson_content
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Reference URL</label>
        <input
          type="url"
          value={content.external_url}
          onChange={(e) => onChange({ ...content, external_url: e.target.value })}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Link Title</label>
        <input
          type="text"
          value={content.link_title}
          onChange={(e) => onChange({ 
            ...content, 
            link_title: e.target.value 
          })}
          placeholder="Enter a descriptive title for the link"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={content.link_description}
          onChange={(e) => onChange({ 
            ...content, 
            link_description: e.target.value 
          })}
          placeholder="Why is this resource useful?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

const LessonContentEditor = ({ contentType, lesson_content, assessment, onChange }) => {
  console.log('LessonContentEditor received:', { contentType, lesson_content });

  const renderEditor = () => {
    switch (contentType) {
      case "TEXT":
        return <TextContentEditor lesson_content={lesson_content} onChange={onChange} />;
      case "PDF":
        return <PDFContentEditor lesson_content={lesson_content} onChange={onChange} />;
      case "VIDEO":
        return <VideoContentEditor lesson_content={lesson_content} onChange={onChange} />;
      case "REFERENCE_LINK":
        return <ReferenceLinkEditor lesson_content={lesson_content} onChange={onChange} />;
      case "ASSESSMENT":
        return <AssessmentEditor type={'fromLessoon 482'} assessment={assessment} onChange={onChange} />;
      default:
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
            Select a content type to configure lesson content
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-4">Content Details</h4>
      {renderEditor()}
    </div>
  );
};

export { ContentTypeSelector, LessonContentEditor }