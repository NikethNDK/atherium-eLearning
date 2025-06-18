import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const CreateCategory = () => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createCategory(formData);
      navigate("/admin/categories");
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Category</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" className="w-full p-2 mb-4 border rounded" />
        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" className="w-full p-2 mb-4 border rounded" />
        <button type="submit" className="bg-purple-600 text-white p-2 rounded">Save</button>
      </form>
    </div>
  );
};

export default CreateCategory;