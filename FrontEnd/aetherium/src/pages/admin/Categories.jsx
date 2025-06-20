"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Plus, Edit, Trash2, Search, BookOpen } from "lucide-react"

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [selectedCategory, setSelectedCategory] = useState({ name: "", description: "" })
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await adminAPI.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCategory((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setSelectedCategory((prev) => ({ ...prev, [name]: value }))
  }

  const editModalFunction = (selectedCategory) => {
    setEditModalOpen(true)
    setSelectedCategory(selectedCategory)
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.name.trim()) return

    setLoading(true)
    try {
      await adminAPI.createCategory(newCategory)
      setNewCategory({ name: "", description: "" })
      setShowCreateModal(false)
      fetchCategories()
    } catch (error) {
      console.error("Error creating category:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = async (category_id) => {
    if (!selectedCategory.name.trim()) return

    setLoading(true)
    try {
      await adminAPI.updateCategory(category_id, selectedCategory)
      setSelectedCategory({ name: "", description: "" })
      setEditModalOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Error updating category:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRandomColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-cyan-500",
      "bg-orange-500",
    ]
    return colors[index % colors.length]
  }

  if (loading) return <LoadingSpinner size="large" />

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage course categories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} />
          <span>Create Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <BookOpen className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No categories found" : "No categories available"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Create your first category to get started"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${getRandomColor(index)} rounded-lg flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editModalFunction(category)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Category"
                    >
                      <Edit size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-red-600 transition-colors" title="Delete Category">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {category.description || "No description provided"}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>0 courses</span>
                  <span>Created {new Date(category.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Create New Category</h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    value={newCategory.name}
                    onChange={handleInputChange}
                    placeholder="Category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newCategory.description}
                    onChange={handleInputChange}
                    placeholder="Category description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Category</h2>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    value={selectedCategory.name}
                    onChange={handleEditInputChange}
                    placeholder="Category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={selectedCategory.description}
                    onChange={handleEditInputChange}
                    placeholder="Category description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditCategory(selectedCategory.id)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
