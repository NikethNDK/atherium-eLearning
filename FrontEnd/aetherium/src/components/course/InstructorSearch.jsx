"use client"

import { useState, useEffect, useCallback } from "react"
import { courseAPI } from "../../services/api"
import { Search, X, Users } from "lucide-react"

const InstructorSearch = ({ selectedInstructors, onInstructorAdd, onInstructorRemove }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [allInstructors, setAllInstructors] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  // Fetch all instructors on component mount
  useEffect(() => {
    const fetchAllInstructors = async () => {
      try {
        setLoading(true)
        const results = await courseAPI.getAllInstructors()
        setAllInstructors(results)
        setSearchResults(results)
      } catch (error) {
        console.error("Error fetching all instructors:", error)
        setAllInstructors([])
        setSearchResults([])
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    }

    fetchAllInstructors()
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchResults(allInstructors)
        return
      }

      setLoading(true)
      try {
        const results = await courseAPI.searchInstructors(query)
        setSearchResults(results)
      } catch (error) {
        console.error("Error searching instructors:", error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 500),
    [allInstructors],
  )

  // Handle search query changes
  useEffect(() => {
    if (!initialLoad) {
      debouncedSearch(searchQuery)
    }
  }, [searchQuery, debouncedSearch, initialLoad])

  const handleAddInstructor = (instructor) => {
    if (!selectedInstructors.find((selected) => selected.id === instructor.id)) {
      onInstructorAdd(instructor)
    }
    setSearchQuery("")
    setShowResults(false)
  }

  const handleInputFocus = () => {
    setShowResults(true)
  }

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowResults(false), 200)
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  }

  const getRandomColor = (id) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-yellow-500"]
    return colors[id % colors.length]
  }

  const filteredResults = searchResults.filter(
    (instructor) => !selectedInstructors.find((selected) => selected.id === instructor.id),
  )

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Add Co-Instructor ({selectedInstructors.length}/5)
      </label>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Search by name or username"
          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          disabled={selectedInstructors.length >= 5}
        />
        <div className="absolute left-3 top-2.5">
          <Search className="w-5 h-5 text-gray-400" />
        </div>

        {/* Search Results Dropdown */}
        {showResults && !initialLoad && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  <span>Searching...</span>
                </div>
              </div>
            ) : filteredResults.length > 0 ? (
              <>
                {searchQuery.length === 0 && (
                  <div className="p-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span>Available Instructors ({filteredResults.length})</span>
                    </div>
                  </div>
                )}
                {filteredResults.map((instructor) => (
                  <button
                    key={instructor.id}
                    type="button"
                    onClick={() => handleAddInstructor(instructor)}
                    className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                    disabled={selectedInstructors.length >= 5}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getRandomColor(instructor.id)}`}
                    >
                      {getInitials(instructor.firstname, instructor.lastname)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {instructor.firstname} {instructor.lastname}
                      </p>
                      <p className="text-sm text-gray-600">@{instructor.username}</p>
                      {instructor.email && <p className="text-xs text-gray-500">{instructor.email}</p>}
                    </div>
                    {selectedInstructors.length >= 5 && <span className="text-xs text-gray-400">Limit reached</span>}
                  </button>
                ))}
              </>
            ) : (
              <div className="p-3 text-center text-gray-500">
                {searchQuery.length > 0 ? "No instructors found" : "No available instructors"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Instructors */}
      {selectedInstructors.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Co-Instructors:</h4>
          <div className="space-y-3">
            {selectedInstructors.map((instructor) => (
              <div key={instructor.id} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getRandomColor(instructor.id)}`}
                >
                  {getInitials(instructor.firstname, instructor.lastname)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {instructor.firstname} {instructor.lastname}
                  </p>
                  <p className="text-sm text-gray-600">@{instructor.username}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onInstructorRemove(instructor.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove instructor"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedInstructors.length >= 5 && (
        <p className="text-sm text-amber-600 mt-2">Maximum of 5 co-instructors allowed.</p>
      )}
    </div>
  )
}

// Debounce utility function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default InstructorSearch
