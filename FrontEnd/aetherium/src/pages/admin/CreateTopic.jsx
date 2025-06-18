import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const CreateTopic = () => {
  const [formData, setFormData] = useState({ name: "", category_id: "", description: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createTopic(formData);
      navigate("/admin/topics");
    } catch (error) {
      console.error("Error creating topic:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Topic</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" className="w-full p-2 mb-4 border rounded" />
        <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="w-full p-2 mb-4 border rounded">
          <option value="">Select Category</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" className="w-full p-2 mb-4 border rounded" />
        <button type="submit" className="bg-purple-600 text-white p-2 rounded">Save</button>
      </form>
    </div>
  );
};

export default CreateTopic;