import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { courseAPI, adminAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    subtitle: "",
    category_id: "",
    topic_id: "",
    language: "",
    level: "",
    duration: "",
    duration_unit: "",
    description: "",
    cover_image: null,
    trailer_video: null,
    learning_objectives: [],
    target_audiences: [],
    requirements: [],
    sections: [],
    price: "",
    welcome_message: "",
    congratulation_message: "",
    co_instructor_ids: [],
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchTopics();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTopics = async () => {
    try {
      const data = await adminAPI.getTopics();
      setTopics(data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleArrayInput = (e, field) => {
  const { value } = e.target;
  if (value && value.trim()) { 
    setFormData((prev) => {
      const updated = [...prev[field], value.trim()];
      return { ...prev, [field]: updated };
    });
    e.target.value = ""; 
  }
};

  const getStepData = (step) => {
    switch (step) {
      case 1:
        return {
          title: formData.title,
          subtitle: formData.subtitle,
          category_id: parseInt(formData.category_id) || null,
          topic_id: parseInt(formData.topic_id) || null,
          language: formData.language || null,
          level: formData.level || null,
          duration: parseInt(formData.duration) || null,
          duration_unit: formData.duration_unit || null,
        };
      case 2:
        return {
          description: formData.description,
          cover_image: formData.cover_image,
          trailer_video: formData.trailer_video,
          learning_objectives: formData.learning_objectives,
          target_audiences: formData.target_audiences,
          requirements: formData.requirements,
        };
      case 3:
        return { sections: formData.sections };
      case 4:
        return {
          price: parseFloat(formData.price) || null,
          welcome_message: formData.welcome_message,
          congratulation_message: formData.congratulation_message,
          co_instructor_ids: formData.co_instructor_ids,
        };
      default:
        return {};
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      let response;
      const stepData = getStepData(step);
      switch (step) {
        case 1:
          response = await courseAPI.createStep1(stepData);
          break;
        case 2:
          response = await courseAPI.updateStep2(formData.id, stepData, formData.cover_image, formData.trailer_video);
          break;
        case 3:
          response = await courseAPI.updateStep3(formData.id, stepData);
          break;
        case 4:
          response = await courseAPI.updateStep4(formData.id, stepData);
          break;
        default:
          break;
      }
      if (response?.id) setFormData((prev) => ({ ...prev, id: response.id }));
      setStep(step + 1);
    } catch (error) {
      console.error(`Error in step ${step}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!formData.id) throw new Error("No course ID available for submission");
      await courseAPI.submitCourse(formData.id);
      navigate("/instructor/drafts");
    } catch (error) {
      console.error("Error submitting course:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Course</h1>
      {step === 1 && (
        <div>
          <input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            name="subtitle"
            value={formData.subtitle}
            onChange={handleInputChange}
            placeholder="Subtitle"
            className="w-full p-2 mb-4 border rounded"
          />
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            name="topic_id"
            value={formData.topic_id}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="">Select Topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          <input
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            placeholder="Language"
            className="w-full p-2 mb-4 border rounded"
          />
          <select
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
            <option value="All Levels">All Levels</option>
          </select>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="Duration"
            className="w-full p-2 mb-4 border rounded"
          />
          <select
            name="duration_unit"
            value={formData.duration_unit}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="">Select Unit</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
          <button onClick={handleNext} className="bg-purple-600 text-white p-2 rounded">
            Next
          </button>
        </div>
      )}
      {step === 2 && (
        <div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="file"
            name="cover_image"
            onChange={handleFileChange}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="file"
            name="trailer_video"
            onChange={handleFileChange}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            name="learning_objectives"
            onChange={(e) => handleArrayInput(e, "learning_objectives")}
            placeholder="Learning Objective"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            name="target_audiences"
            onChange={(e) => handleArrayInput(e, "target_audiences")}
            placeholder="Target Audience"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            name="requirements"
            onChange={(e) => handleArrayInput(e, "requirements")}
            placeholder="Requirement"
            className="w-full p-2 mb-4 border rounded"
          />
          <button onClick={handleNext} className="bg-purple-600 text-white p-2 rounded">
            Next
          </button>
        </div>
      )}
      {step === 3 && (
        <div>
          <input
            name="section_name"
            onChange={(e) => handleArrayInput(e, "sections", formData.sections.length)}
            placeholder="Section Name"
            className="w-full p-2 mb-4 border rounded"
          />
          <button onClick={handleNext} className="bg-purple-600 text-white p-2 rounded">
            Next
          </button>
        </div>
      )}
      {step === 4 && (
        <div>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Price"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            name="welcome_message"
            value={formData.welcome_message}
            onChange={handleInputChange}
            placeholder="Welcome Message"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            name="congratulation_message"
            value={formData.congratulation_message}
            onChange={handleInputChange}
            placeholder="Congratulation Message"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            name="co_instructor_ids"
            onChange={(e) => handleArrayInput(e, "co_instructor_ids")}
            placeholder="Co-Instructor ID"
            className="w-full p-2 mb-4 border rounded"
          />
          <button onClick={handleSubmit} className="bg-purple-600 text-white p-2 rounded">
            Submit for Review
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;