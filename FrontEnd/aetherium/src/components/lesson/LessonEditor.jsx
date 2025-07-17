import { useState, useEffect, useCallback } from "react";
import {
  ContentTypeSelector,
  LessonContentEditor,
} from "./LessonContentEditor";
import AssessmentEditor from "./AssessmentEditor";
import { Save, X } from "lucide-react";
import { instructorAPI } from "../../services/instructorApi";

const LessonEditor = ({
  lesson,
  onSave,
  onCancel,
  isOpen,
  courseId,
  sectionId,
}) => {
  console.log("LessonEditor received:", lesson);
  useEffect(() => {
    if (lesson && lesson.content_type === "ASSESSMENT") {
      setLessonData((prev) => ({
        ...prev,
        assessment: lesson.assessment || {
          title: "",
          description: "",
          passing_score: 70,
          questions: [],
        },
        content: null,
      }));
    }
  }, [lesson]);
  const getInitialContent = (contentType) => {
    switch (contentType) {
      case "TEXT":
        return { text_content: "" };
      case "PDF":
        return {
          file_url: "",
          file_public_id: "",
          file_type: "",
          file_size: null,
        };
      case "VIDEO":
        return {
          file_url: "",
          file_public_id: "",
          file_type: "",
          file_size: null,
          video_duration: null,
          video_thumbnail: "",
        };
      case "REFERENCE_LINK":
        return {
          external_url: "",
          link_title: "",
          link_description: "",
        };
      case "ASSESSMENT":
        return {
          title: "",
          description: "",
          passing_score: 70,
          questions: [],
        };
      default:
        return {};
    }
  };
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [lessonData, setLessonData] = useState(() => {
    if (!lesson) {
      return {
        name: "",
        content_type: "TEXT",
        duration: "",
        description: "",
        order_index: 0,
        content: getInitialContent("TEXT"),
        assessment: null,
      };
    }

    // For existing lessons
    return {
      ...lesson,
      content:
        lesson.content || getInitialContent(lesson.content_type || "TEXT"),
      assessment:
        lesson.content_type === "ASSESSMENT"
          ? lesson.assessment || {
              title: "",
              description: "",
              passing_score: 70,
              questions: [],
            }
          : null,
    };
  });

  const handleAssessmentChange = useCallback((updatedAssessment) => {
    setLessonData((prev) => {
      if (prev.content_type !== "ASSESSMENT") return prev;

      return {
        ...prev,
        assessment: {
          ...updatedAssessment,
          questions: updatedAssessment.questions.map((q, i) => ({
            ...q,
            order_index: i, // Ensure order_index is properly set
          })),
        },
      };
    });
  }, []);

  const handleInputChange = useCallback(
    (field, value) => {
      setLessonData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
      setApiError(""); // Clear API error on input change
    },
    [errors]
  );

  const handleContentTypeChange = useCallback((contentType) => {
    setLessonData((prev) => ({
      ...prev,
      content_type: contentType,
      content:
        contentType === "ASSESSMENT" ? null : getInitialContent(contentType),
      assessment:
        contentType === "ASSESSMENT"
          ? {
              title: "",
              description: "",
              passing_score: 70,
              questions: [],
            }
          : null,
    }));
  }, []);

  const handleContentChange = useCallback((updatedContent) => {
    setLessonData((prev) => ({
      ...prev,
      content: updatedContent, // Update the correct property
    }));
    setApiError("");
  }, []);

  const validateLesson = useCallback(() => {
    const newErrors = {};

    if (!lessonData.name.trim()) {
      newErrors.name = "Lesson name is required";
    }

    if (lessonData.content_type === "ASSESSMENT") {
      if (!lessonData.assessment?.title?.trim()) {
        newErrors.assessment_title = "Assessment title is required";
      }

      // Validate at least one question exists
      if (!lessonData.assessment?.questions?.length) {
        newErrors.assessment_questions = "At least one question is required";
      } else {
        // Validate each question
        lessonData.assessment.questions.forEach((question, index) => {
          if (!question.question_text?.trim()) {
            newErrors[`question_${index}_text`] = `Question ${
              index + 1
            } text is required`;
          }

          // Validate options (for multiple choice questions)
          if (question.options?.length > 0) {
            // At least two options required
            if (question.options.length < 2) {
              newErrors[`question_${index}_options`] = `Question ${
                index + 1
              } needs at least two options`;
            }

            // Must have a correct answer selected
            if (!question.correct_answer) {
              newErrors[`question_${index}_answer`] = `Question ${
                index + 1
              } needs a correct answer selected`;
            }
          } else if (
            typeof question.correct_answer !== "string" ||
            !question.correct_answer.trim()
          ) {
            // For non-multiple choice questions
            newErrors[`question_${index}_answer`] = `Question ${
              index + 1
            } needs a correct answer`;
          }
        });
      }
    } else if (
      lessonData.content_type === "VIDEO" &&
      !lessonData.content?.file &&
      !lessonData.content?.file_url
    ) {
      newErrors.content_file = "Video file is required for video lessons.";
    } else if (
      lessonData.content_type === "PDF" &&
      !lessonData.content?.file &&
      !lessonData.content?.file_url
    ) {
      newErrors.content_file = "PDF file is required for PDF lessons.";
    } else if (
      lessonData.content_type === "REFERENCE_LINK" &&
      !lessonData.content?.external_url?.trim()
    ) {
      newErrors.content_external_url =
        "External URL is required for link lessons.";
    } else if (
      lessonData.content_type === "TEXT" &&
      !lessonData.content?.text_content?.trim()
    ) {
      newErrors.content_text = "Text content is required for text lessons.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [lessonData]);

  const handleSave = async () => {
    setApiError("");
    if (!validateLesson()) return;

    setLoading(true);
    try {
      const payload = {
        name: lessonData.name.trim(),
        content_type: lessonData.content_type,
        duration: lessonData.duration ? parseInt(lessonData.duration) : null,
        description: lessonData.description.trim(),
        order_index: lessonData.order_index || 0,
      };

      if (lessonData.content_type === "ASSESSMENT" && lessonData.assessment) {
        // Send assessments as an array to match backend expectation
        payload.assessments = [
          {
            title: lessonData.assessment.title.trim(),
            description: lessonData.assessment.description.trim(),
            passing_score:
              parseFloat(lessonData.assessment.passing_score) || 70,
            questions: lessonData.assessment.questions
              .map((q, i) => ({
                question_text: q.question_text.trim(),
                options:
                  q.options?.map((opt) => opt.trim()).filter((opt) => opt) ||
                  [],
                correct_answer: q.correct_answer?.trim(),
                points: parseFloat(q.points) || 1.0,
                order_index: i,
              }))
              .filter((q) => q.question_text),
          },
        ];
        payload.content = null;
      } else {
        payload.content = lessonData.content;
        payload.assessments = []; // Clear assessments for non-assessment types
      }

      let savedLesson;
      if (lesson?.id) {
        savedLesson = await instructorAPI.updateLesson(lesson.id, payload);
      } else {
        savedLesson = await instructorAPI.createLesson(sectionId, payload);
      }

      onSave(savedLesson);
    } catch (error) {
      console.error("Error saving lesson:", error);
      setApiError(
        error.response?.data?.detail || error.message || "Error saving lesson"
      );
    } finally {
      setLoading(false);
    }
  };
  // const handleSave = async () => {
  //   setApiError("")
  //   if (!validateLesson()) {
  //     return
  //   }

  // setLoading(true);
  // try {
  //   const processedLessonData = {
  //     ...lessonData,
  //     duration: lessonData.duration ? Number.parseInt(lessonData.duration) : null,
  //     order_index: lessonData.order_index || 0,
  //   };

  //   const lessonPayload = {
  //     name: processedLessonData.name,
  //     content_type: processedLessonData.content_type,
  //     duration: processedLessonData.duration,
  //     description: processedLessonData.description,
  //     order_index: processedLessonData.order_index,
  //     // lesson_content: processedLessonData.content_type !== "ASSESSMENT" ? processedLessonData.lesson_content : undefined,
  //     // assessment: processedLessonData.content_type === "ASSESSMENT" ? processedLessonData.assessment : undefined,
  //   };
  //    if (processedLessonData.content_type === "ASSESSMENT") {
  //     lessonPayload.assessment = {
  //       ...processedLessonData.assessment,
  //       passing_score: parseFloat(processedLessonData.assessment.passing_score) || 70,
  //       questions: processedLessonData.assessment.questions.map(q => ({
  //         ...q,
  //         points: parseFloat(q.points) || 1.0
  //       }))
  //     };
  //     lessonPayload.content = undefined;
  //   } else {
  //     lessonPayload.content = processedLessonData.content;
  //     lessonPayload.assessment = undefined;
  //   }

  //     let savedLesson;

  //     if (lesson?.id) {
  //       // Update existing lesson
  //       savedLesson = await instructorAPI.updateLesson(lesson.id, lessonPayload)
  //     } else {
  //       // Create new lesson
  //       savedLesson = await instructorAPI.createLesson(sectionId, lessonPayload)
  //     }

  //     // Handle file upload if a new file is selected
  //    if (lessonData.content?.file && savedLesson?.id) {
  //     try {
  //       const fileTypeMap = {
  //         VIDEO: "video",
  //         PDF: "pdf",
  //       };
  //       const backendFileType = fileTypeMap[lessonData.content_type] || "document";

  //       const uploadResult = await instructorAPI.uploadLessonFile(
  //         savedLesson.id,
  //         lessonData.content.file,
  //         backendFileType,
  //       );

  //         // Check if it's an async upload (has task_id)
  //         if (uploadResult.task_id) {
  //           // Handle async upload with polling
  //           setApiError("File upload started. Please wait...")

  //           const pollUploadStatus = async (taskId) => {
  //             const maxAttempts = 60 // 5 minutes with 5-second intervals
  //             let attempts = 0

  //             const poll = async () => {
  //               try {
  //                 const statusResult = await instructorAPI.getUploadStatus(taskId)

  //                 if (statusResult.state === 'SUCCESS') {
  //                   // Upload completed successfully
  //                   const finalResult = statusResult.result
  //                   savedLesson = {
  //                     ...savedLesson,
  //                     lesson_content: {
  //                       ...savedLesson.lesson_content,
  //                       file_url: finalResult.url,
  //                       file_public_id: finalResult.public_id,
  //                       file_type: finalResult.file_type,
  //                       file_size: finalResult.file_size,
  //                       video_duration: finalResult.duration,
  //                       video_thumbnail: finalResult.thumbnail,
  //                     },
  //                   }
  //                   setApiError("")
  //                   onSave(savedLesson)
  //                   return
  //                 } else if (statusResult.state === 'FAILURE') {
  //                   // Upload failed
  //                   setApiError(`File upload failed: ${statusResult.status}`)
  //                   return
  //                 } else {
  //                   // Still processing
  //                   const progress = Math.round((statusResult.current / statusResult.total) * 100)
  //                   setApiError(`Upload progress: ${progress}% - ${statusResult.status}`)

  //                   attempts++
  //                   if (attempts < maxAttempts) {
  //                     setTimeout(poll, 5000) // Poll every 5 seconds
  //                   } else {
  //                     setApiError("Upload timeout. Please try again.")
  //                   }
  //                 }
  //               } catch (error) {
  //                 console.error("Error polling upload status:", error)
  //                 setApiError("Error checking upload status. Please refresh and try again.")
  //               }
  //             }

  //             poll()
  //           }

  //           await pollUploadStatus(uploadResult.task_id)
  //         } else {
  //           // Direct upload completed
  //           savedLesson = {
  //             ...savedLesson,
  //             lesson_content: {
  //               ...savedLesson.lesson_content,
  //               file_url: uploadResult.url,
  //               file_public_id: uploadResult.public_id,
  //               file_type: uploadResult.file_type,
  //               file_size: uploadResult.file_size,
  //               video_duration: uploadResult.duration,
  //               video_thumbnail: uploadResult.thumbnail,
  //             },
  //           }
  //           onSave(savedLesson)
  //         }
  //       } catch (uploadError) {
  //         console.error("Error uploading lesson file:", uploadError)
  //         setApiError(`File upload failed: ${uploadError.response?.data?.detail || uploadError.message}`)
  //       }
  //     } else {
  //       // No file upload needed
  //       onSave(savedLesson)
  //     }
  //   } catch (error) {
  //     console.error("Error saving lesson:", error)
  //     setApiError(error.response?.data?.detail || "Error saving lesson. Please try again.")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  if (!isOpen) {
    console.log("LessonEditor not rendering because isOpen is false");
    return null;
  }

  console.log("Rendering LessonEditor with:", {
    lessonData,
    isOpen,
    errors,
    apiError,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {lesson ? "Edit Lesson" : "Add New Lesson"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Name *
              </label>
              <input
                type="text"
                value={lessonData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter lesson name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={lessonData.duration || ""}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="Estimated duration"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={lessonData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the lesson"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content Type *
            </label>
            <ContentTypeSelector
              selectedType={lessonData.content_type}
              onTypeChange={handleContentTypeChange}
            />
          </div>

          {lessonData.content_type === "ASSESSMENT" ? (
            <div>
              <AssessmentEditor
                key={lessonData.assessment?.id || "new-assessment"} // Add key to force re-render
                assessment={
                  lessonData.content_type === "ASSESSMENT"
                    ? lessonData.assessment
                    : null
                }
                onChange={handleAssessmentChange}
              />

              {errors.assessment_title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.assessment_title}
                </p>
              )}
              {errors.assessment_questions && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.assessment_questions}
                </p>
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
            <>
              <LessonContentEditor
                contentType={lessonData.content_type}
                lesson_content={lessonData.content}
                onChange={handleContentChange}
              />
              {errors.content_file && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.content_file}
                </p>
              )}
              {errors.content_external_url && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.content_external_url}
                </p>
              )}
              {errors.content_text && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.content_text}
                </p>
              )}
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Lesson
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonEditor;
