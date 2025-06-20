import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: "", category_id: "", description: "" });

  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
    fetchCategories();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await adminAPI.getTopics();
      setTopics(data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTopic((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createTopic(newTopic);
      setNewTopic({ name: "", category_id: "", description: "" });
      setShowAddModal(false);
      fetchTopics();
    } catch (error) {
      console.error("Error creating topic:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Topics</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white p-2 rounded"
        >
          Add Topic
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {topics.length === 0 ? (
          <p className="text-gray-600">No topics available.</p>
        ) : (
          <ul className="space-y-4">
            {topics.map((topic) => (
              <li key={topic.id} className="p-3 bg-gray-50 rounded-lg">
                <strong>{topic.name}</strong> - {topic.description || "No description"}
                {topic.category && (
                  <span className="ml-2 text-gray-600">
                    (Category: {topic.category.name})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Topic</h2>
            <form onSubmit={handleAddTopic}>
              <input
                name="name"
                value={newTopic.name}
                onChange={handleInputChange}
                placeholder="Name"
                className="w-full p-2 mb-4 border rounded"
                maxLength={100}
                required
              />
              <select
                name="category_id"
                value={newTopic.category_id}
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
              <textarea
                name="description"
                value={newTopic.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="w-full p-2 mb-4 border rounded"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-300 text-gray-800 p-2 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-purple-600 text-white p-2 rounded">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topics;