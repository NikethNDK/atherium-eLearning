"use client"

import { useState, useEffect } from "react"
import { authAPI } from "../../services/api"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { formatDateOnly } from "../../utils/dateUtils"
import { Eye, Edit, Trash2, Shield, ShieldOff } from "lucide-react"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  const [actionLoading, setActionLoading] = useState(null);


  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await authAPI.getAllUsers()
      const formattedUsers = response.map((user) => ({
        id: user.id,
        email: user.email,
        phone: user.phone_number || "N/A",
        role: user.role?.name || "Student",
        status: user.is_active ? "Active" : "Blocked",
        is_active: user.is_active,
        joinedDate: user.created_at
          ? formatDateOnly(user.created_at, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "N/A",
        name: `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Unnamed",
      }))
      setUsers(formattedUsers)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setError("Failed to load users. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (userId, shouldBlock) => {
    setActionLoading(userId)
    try {
      await authAPI.blockUser(userId, shouldBlock)
      // Update the user in the local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_active: !shouldBlock, status: shouldBlock ? "Blocked" : "Active" } : user,
        ),
      )
    } catch (error) {
      console.error("Error blocking/unblocking user:", error)
      alert(`Failed to ${shouldBlock ? "block" : "unblock"} user`)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const getStatusBadge = (status) => {
    if (status === "Active") {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Blocked</span>
    }
  }

  const getRoleBadge = (role) => {
    const colors = {
      user: "bg-blue-100 text-blue-800",
      instructor: "bg-purple-100 text-purple-800",
      admin: "bg-gray-100 text-gray-800",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || colors.user}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <button onClick={fetchUsers} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <span>Dashboard</span>
            <span className="mx-2">/</span>
            <span>Users List</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Users ({filteredUsers.length})</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">📤 Export</button>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Joined Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <span className="text-gray-600 font-medium text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.phone}</td>
                    <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-4 text-gray-600">{user.joinedDate}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-blue-600" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="text-gray-400 hover:text-green-600" title="Edit User">
                          <Edit size={16} />
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleBlockUser(user.id, user.is_active)}
                            disabled={actionLoading === user.id}
                            className={`${
                              user.is_active ? "text-gray-400 hover:text-red-600" : "text-gray-400 hover:text-green-600"
                            } disabled:opacity-50`}
                            title={user.is_active ? "Block User" : "Unblock User"}
                          >
                            {actionLoading === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            ) : user.is_active ? (
                              <ShieldOff size={16} />
                            ) : (
                              <Shield size={16} />
                            )}
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-red-600" title="Delete User">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} from{" "}
              {filteredUsers.length}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
