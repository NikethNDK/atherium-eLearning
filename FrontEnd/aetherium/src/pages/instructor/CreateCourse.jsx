// "use client"

// import { useState, useEffect } from "react"
// import { useNavigate, useParams } from "react-router-dom"
// import SectionManager from "../../components/lesson/SectionManager"
// import { courseAPI } from "../../services/api"

// const CourseCreationPage = () => {
//   const { courseId } = useParams()
//   const navigate = useNavigate()
//   const [courseData, setCourseData] = useState({
//     title: "",
//     sections: [],
//   })
//   const [loading, setLoading] = useState(false)
//   const [errors, setErrors] = useState({})

//   useEffect(() => {
//     if (courseId) {
//       fetchCourseData()
//     }
//   }, [courseId])

//   const fetchCourseData = async () => {
//     try {
//       setLoading(true)
//       const data = await courseAPI.getCourse(courseId)
//       setCourseData({
//         title: data.title,
//         sections: data.sections || [],
//       })
//     } catch (error) {
//       console.error("Error fetching course:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSectionsChange = (sections) => {
//     setCourseData((prev) => ({ ...prev, sections }))
//     setErrors((prev) => ({ ...prev, sections: "" }))
//   }

//   const validateCourse = () => {
//     const newErrors = {}

//     if (courseData.sections.length === 0) {
//       newErrors.sections = "At least one section is required"
//     }

//     const sectionsWithoutLessons = courseData.sections.filter(
//       (section) => !section.lessons || section.lessons.length === 0,
//     )

//     if (sectionsWithoutLessons.length > 0) {
//       newErrors.sections = "Each section must have at least one lesson"
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSave = async () => {
//     if (!validateCourse()) return

//     try {
//       setLoading(true)
//       const step3Data = {
//         sections: courseData.sections.map((section) => ({
//           name: section.name,
//           lessons: section.lessons.map((lesson) => ({
//             name: lesson.name,
//             content_type: lesson.content_type,
//             content_url: lesson.content_url,
//             duration: lesson.duration,
//             description: lesson.description,
//           })),
//         })),
//       }

//       await courseAPI.updateStep3(courseId, step3Data)
//       navigate("/instructor/courses")
//     } catch (error) {
//       console.error("Error saving course:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto py-8 px-4">
//         <div className="bg-white rounded-lg shadow-sm">
//           <div className="border-b border-gray-200 px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-2xl font-semibold text-gray-900">{courseData.title || "Course Creation"}</h1>
//                 <p className="text-gray-600 mt-1">Create sections and lessons for your course</p>
//               </div>
//               <div className="flex space-x-3">
//                 <button
//                   onClick={() => navigate("/instructor/courses")}
//                   className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={loading}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                 >
//                   {loading ? "Saving..." : "Save Course"}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="p-6">
//             <SectionManager sections={courseData.sections} onChange={handleSectionsChange} />

//             {errors.sections && (
//               <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <p className="text-red-700 text-sm">{errors.sections}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CourseCreationPage


"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { instructorAPI } from "../../services/instructorAPI"
import { adminAPI,courseAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import ArrayInputField from "../../components/course/ArrayInputField"
import FileUpload from "../../components/course/FileUpload"
import EnhancedSectionEditor from "../../components/course/EnhancedSEctionEditor"
import InstructorSearch from "../../components/course/InstructorSearch"
import { ChevronRight, Check } from "lucide-react"

const CreateCourse = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [courseData, setCourseData] = useState({
    id: null,
    title: "",
    subtitle: "",
    category_id: "",
    topic_id: "",
    language: "ENGLISH",
    level: "",
    duration: "",
    duration_unit: "HOURS",
    description: "",
    cover_image: null,
    cover_image_url: "",
    trailer_video: null,
    trailer_video_url: "",
    learning_objectives: [],
    target_audiences: [],
    requirements: [],
    sections: [],
    price: "",
    welcome_message: "",
    congratulation_message: "",
    co_instructors: [],
  })

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [errors, setErrors] = useState({})

  const steps = [
    { id: 1, title: "Basic Information", icon: "📝" },
    { id: 2, title: "Advance Information", icon: "📋" },
    { id: 3, title: "Curriculum", icon: "📚" },
    { id: 4, title: "Publish Course", icon: "🚀" },
  ]

  useEffect(() => {
    fetchCategories()
    fetchTopics()
    if (courseId) {
      fetchCourseData(courseId)
    }
  }, [courseId])

  const fetchCategories = async () => {
    try {
      const data = await adminAPI.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchTopics = async () => {
    try {
      const data = await adminAPI.getTopics()
      setTopics(data)
    } catch (error) {
      console.error("Error fetching topics:", error)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith("http")) return imagePath
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    return `${baseUrl}/${imagePath}`
  }

  const fetchCourseData = async (id) => {
    try {
      setLoading(true)
      const data = await instructorAPI.getCourseDetail(id)
      const transformedData = {
        ...data,
        category_id: data.category_id?.toString() || "",
        topic_id: data.topic_id?.toString() || "",
        duration: data.duration?.toString() || "",
        price: data.price?.toString() || "",
        cover_image_url: data.cover_image ? getImageUrl(data.cover_image) : "",
        trailer_video_url: data.trailer_video ? getImageUrl(data.trailer_video) : "",
        learning_objectives: data.learning_objectives?.map((obj) => obj.description) || [],
        target_audiences: data.target_audiences?.map((aud) => aud.description) || [],
        requirements: data.requirements?.map((req) => req.description) || [],
        sections:
          data.sections?.map((section) => ({
            id: section.id,
            name: section.name,
            lessons:
              section.lessons?.map((lesson) => ({
                id: lesson.id,
                name: lesson.name,
                content_type: lesson.content_type,
                content_url: lesson.content_url,
                duration: lesson.duration,
                description: lesson.description,
                content: lesson.content_data || {},
                assessment: lesson.assessment || null,
                order_index: lesson.order_index || 0,
              })) || [],
          })) || [],
        co_instructors: [],
        cover_image: null,
        trailer_video: null,
      }

      setCourseData(transformedData)
    } catch (error) {
      console.error("Error fetching course:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!courseData.title.trim()) newErrors.title = "Title is required"
        if (!courseData.category_id) newErrors.category_id = "Category is required"
        if (!courseData.language) newErrors.language = "Language is required"
        if (!courseData.level) newErrors.level = "Level is required"
        if (!courseData.duration) newErrors.duration = "Duration is required"
        if (!courseData.duration_unit) newErrors.duration_unit = "Duration unit is required"
        break
      case 2:
        if (!courseData.description.trim()) newErrors.description = "Description is required"
        if (courseData.learning_objectives.length === 0)
          newErrors.learning_objectives = "At least one learning objective is required"
        if (courseData.target_audiences.length === 0)
          newErrors.target_audiences = "At least one target audience is required"
        break
      case 3:
        if (courseData.sections.length === 0) {
          newErrors.sections = "At least one section is required"
        } else {
          // Check if all sections have at least one lesson
          const sectionsWithoutLessons = courseData.sections.filter(
            (section) => !section.lessons || section.lessons.length === 0,
          )
          if (sectionsWithoutLessons.length > 0) {
            newErrors.sections = "Each section must have at least one lesson"
          }
        }
        break
      case 4:
        if (!courseData.price || Number.parseFloat(courseData.price) <= 0) newErrors.price = "Valid price is required"
        if (!courseData.welcome_message.trim()) newErrors.welcome_message = "Welcome message is required"
        if (!courseData.congratulation_message.trim())
          newErrors.congratulation_message = "Congratulation message is required"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCourseData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (name) => (e) => {
    const file = e.target.files[0]
    setCourseData((prev) => ({
      ...prev,
      [name]: file,
      [`${name}_url`]: file ? URL.createObjectURL(file) : prev[`${name}_url`],
    }))
  }

  const addToArray = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const removeFromArray = (field, index) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleSectionsChange = (sections) => {
    setCourseData((prev) => ({ ...prev, sections }))
    if (errors.sections) {
      setErrors((prev) => ({ ...prev, sections: "" }))
    }
  }

  const handleInstructorAdd = (instructor) => {
    setCourseData((prev) => ({
      ...prev,
      co_instructors: [...prev.co_instructors, instructor],
    }))
  }

  const handleInstructorRemove = (instructorId) => {
    setCourseData((prev) => ({
      ...prev,
      co_instructors: prev.co_instructors.filter((instructor) => instructor.id !== instructorId),
    }))
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    try {
      let response

      switch (currentStep) {
        case 1:
          const step1Data = {
            title: courseData.title,
            subtitle: courseData.subtitle,
            category_id: Number.parseInt(courseData.category_id) || null,
            topic_id: Number.parseInt(courseData.topic_id) || null,
            language: courseData.language,
            level: courseData.level,
            duration: Number.parseInt(courseData.duration) || null,
            duration_unit: courseData.duration_unit,
          }

          if (courseData.id) {
            response = await instructorAPI.updateCourseStep1(courseData.id, step1Data)
          } else {
            response = await instructorAPI.createStep1(step1Data)
            setCourseData((prev) => ({ ...prev, id: response.id }))
          }
          break

        case 2:
          const formData = new FormData()
          formData.append("description", courseData.description || "")

          courseData.learning_objectives.forEach((obj) => {
            formData.append("learning_objectives", obj)
          })

          courseData.target_audiences.forEach((aud) => {
            formData.append("target_audiences", aud)
          })

          courseData.requirements.forEach((req) => {
            formData.append("requirements", req)
          })

          if (courseData.cover_image) {
            formData.append("cover_image", courseData.cover_image)
          }
          if (courseData.trailer_video) {
            formData.append("trailer_video", courseData.trailer_video)
          }

          response = await instructorAPI.updateStep2(courseData.id, formData)
          setCourseData((prev) => ({
            ...prev,
            cover_image_url: response.cover_image ? getImageUrl(response.cover_image) : prev.cover_image_url,
            trailer_video_url: response.trailer_video ? getImageUrl(response.trailer_video) : prev.trailer_video_url,
          }))
          break

        case 3:
          // Sections are handled by EnhancedSectionEditor
          // Just validate and proceed
          break

        case 4:
          const step4Data = {
            price: Number.parseFloat(courseData.price) || null,
            welcome_message: courseData.welcome_message,
            congratulation_message: courseData.congratulation_message,
            co_instructor_ids: courseData.co_instructors.map((instructor) => instructor.id),
          }
          response = await instructorAPI.updateStep4(courseData.id, step4Data)
          break
      }

      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error(`Error in step ${currentStep}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setLoading(true)
    try {
      const step4Data = {
        price: Number.parseFloat(courseData.price) || null,
        welcome_message: courseData.welcome_message,
        congratulation_message: courseData.congratulation_message,
        co_instructor_ids: courseData.co_instructors.map((instructor) => instructor.id),
      }

      await instructorAPI.updateStep4(courseData.id, step4Data)
      await instructorAPI.submitCourse(courseData.id)

      navigate("/instructor/pending-approval")
    } catch (error) {
      console.error("Error submitting course:", error)
      const errorMessage =
        error.response?.data?.detail || "Error submitting course. Please check all required fields are filled."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !courseData.id) return <LoadingSpinner size="large" />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Good Morning</p>
            <h1 className="text-2xl font-semibold text-gray-900">{courseId ? "Edit Course" : "Create a new course"}</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/instructor/drafts")}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Save & Exit
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > step.id
                      ? "bg-green-500 text-white"
                      : currentStep === step.id
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.id ? <Check size={16} /> : step.icon}
                </div>
                <span className={`text-sm font-medium ${currentStep >= step.id ? "text-gray-900" : "text-gray-500"}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && <ChevronRight className="mx-4 text-gray-400" size={16} />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleInputChange}
                  placeholder="Your course title"
                  maxLength={80}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
                  <span className="text-xs text-gray-500 ml-auto">{courseData.title.length}/80</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={courseData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Your course subtitle"
                  maxLength={120}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <span className="text-xs text-gray-500">{courseData.subtitle.length}/120</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Category</label>
                <select
                  name="category_id"
                  value={courseData.category_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.category_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <span className="text-red-500 text-sm">{errors.category_id}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Topic</label>
                <input
                  type="text"
                  name="topic_id"
                  value={courseData.topic_id}
                  onChange={handleInputChange}
                  placeholder="What is primarily taught in your course?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Language</label>
                  <select
                    name="language"
                    value={courseData.language}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.language ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="ENGLISH">ENGLISH</option>
                    <option value="HINDI">HINDI</option>
                    <option value="MALAYALAM">MALAYALAM</option>
                  </select>
                  {errors.language && <span className="text-red-500 text-sm">{errors.language}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Level</label>
                  <select
                    name="level"
                    value={courseData.level}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.level ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select...</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                    <option value="ALL_LEVELS">All Levels</option>
                  </select>
                  {errors.level && <span className="text-red-500 text-sm">{errors.level}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="duration"
                      value={courseData.duration}
                      onChange={handleInputChange}
                      placeholder="Duration"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.duration ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <select
                      name="duration_unit"
                      value={courseData.duration_unit}
                      onChange={handleInputChange}
                      className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="HOURS">Hours</option>
                      <option value="DAYS">Days</option>
                    </select>
                  </div>
                  {errors.duration && <span className="text-red-500 text-sm">{errors.duration}</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => navigate("/instructor/dashboard")}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save & Next"}
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Advanced Information</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Course Thumbnail"
                  description="Upload your course Thumbnail here. Important guidelines: 1200x800 pixels or 12:8 Ratio. Supported format: .jpg, .jpeg, or .png"
                  accept="image/*"
                  onChange={handleFileChange("cover_image")}
                  selectedFile={courseData.cover_image}
                  existingFileUrl={courseData.cover_image_url}
                />

                <FileUpload
                  label="Course Trailer"
                  description="Students who watch a well-made promo video are 5X more likely to enroll in your course."
                  accept="video/*"
                  onChange={handleFileChange("trailer_video")}
                  selectedFile={courseData.trailer_video}
                  existingFileUrl={courseData.trailer_video_url}
                  icon={
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-gray-600 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
                    </div>
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleInputChange}
                  placeholder="Enter your course description"
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
              </div>

              <ArrayInputField
                label="What you will teach in this course"
                items={courseData.learning_objectives}
                onAdd={(value) => addToArray("learning_objectives", value)}
                onRemove={(index) => removeFromArray("learning_objectives", index)}
                placeholder="What you will teach in this course..."
                maxItems={8}
                error={errors.learning_objectives}
              />

              <ArrayInputField
                label="Target Audience"
                items={courseData.target_audiences}
                onAdd={(value) => addToArray("target_audiences", value)}
                onRemove={(index) => removeFromArray("target_audiences", index)}
                placeholder="Who this course is for..."
                maxItems={8}
                error={errors.target_audiences}
              />

              <ArrayInputField
                label="Course requirements"
                items={courseData.requirements}
                onAdd={(value) => addToArray("requirements", value)}
                onRemove={(index) => removeFromArray("requirements", index)}
                placeholder="What are your course requirements..."
                maxItems={8}
              />
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save & Next"}
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Course Curriculum</h2>

            <EnhancedSectionEditor
              sections={courseData.sections}
              onSectionsChange={handleSectionsChange}
              courseId={courseData.id}
              errors={errors}
            />

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save & Next"}
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Publish Course</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Messages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                    <textarea
                      name="welcome_message"
                      value={courseData.welcome_message}
                      onChange={handleInputChange}
                      placeholder="Enter course starting message here..."
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.welcome_message ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.welcome_message && <span className="text-red-500 text-sm">{errors.welcome_message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Congratulations Message</label>
                    <textarea
                      name="congratulation_message"
                      value={courseData.congratulation_message}
                      onChange={handleInputChange}
                      placeholder="Enter your course completed message here..."
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.congratulation_message ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.congratulation_message && (
                      <span className="text-red-500 text-sm">{errors.congratulation_message}</span>
                    )}
                  </div>
                </div>
              </div>

              <InstructorSearch
                selectedInstructors={courseData.co_instructors}
                onInstructorAdd={handleInstructorAdd}
                onInstructorRemove={handleInstructorRemove}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={courseData.price}
                  onChange={handleInputChange}
                  placeholder="Enter course price"
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.price && <span className="text-red-500 text-sm">{errors.price}</span>}
                <p className="text-xs text-gray-500 mt-1">Enter a price greater than $0</p>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit For Review"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateCourse
