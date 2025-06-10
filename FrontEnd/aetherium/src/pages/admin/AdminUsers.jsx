"use client"

import { useState, useEffect } from "react"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Mock data since API endpoint might not be implemented yet
      const mockUsers = [
        {
          id: 1,
          email: "johnb@mail.com",
          phone: "078 5054 8877",
          role: "Student",
          status: "Blocked",
          joinedDate: "9 Jan 2025",
          name: "John Bushmill",
        },
        {
          id: 2,
          email: "laura_prichet@mail.com",
          phone: "215 302 3378",
          role: "Student",
          status: "Active",
          joinedDate: "24 Jan 2025",
          name: "Laura Prichet",
        },
        {
          id: 3,
          email: "m_karim@mail.com",
          phone: "050 414 8778",
          role: "Student",
          status: "Blocked",
          joinedDate: "9 Jan 2025",
          name: "Mohammad Karim",
        },
        {
          id: 4,
          email: "josh_bill@mail.com",
          phone: "216 75 612 706",
          role: "Instructor",
          status: "Active",
          joinedDate: "9 Jan 2025",
          name: "Josh Bill",
        },
        {
          id: 5,
          email: "josh_aiden@mail.com",
          phone: "02 75 150 655",
          role: "Student",
          status: "Active",
          joinedDate: "9 Jan 2025",
          name: "Josh Adam",
        },
        {
          id: 6,
          email: "sin_tae@mail.com",
          phone: "078 6013 3854",
          role: "Student",
          status: "Active",
          joinedDate: "1 April 2025",
          name: "Sin Tae",
        },
        {
          id: 7,
          email: "rajesh_m@mail.com",
          phone: "828 216 2190",
          role: "Student",
          status: "Blocked",
          joinedDate: "9 Jan 2025",
          name: "Rajesh Masvidal",
        },
        {
          id: 8,
          email: "fajar_s@mail.com",
          phone: "078 7173 9261",
          role: "Student",
          status: "Active",
          joinedDate: "21 Feb 2025",
          name: "Fajar Surya",
        },
        {
          id: 9,
          email: "lisa@mail.com",
          phone: "077 6157 4248",
          role: "Student",
          status: "Active",
          joinedDate: "17 Feb 2025",
          name: "Lisa Greg",
        },
        {
          id: 10,
          email: "lindablair@mail.com",
          phone: "050 414 8778",
          role: "Student",
          status: "Blocked",
          joinedDate: "",
          name: "Linda Blair",
        },
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
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
      Student: "bg-blue-100 text-blue-800",
      Instructor: "bg-purple-100 text-purple-800",
      Admin: "bg-gray-100 text-gray-800",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || colors.Student}`}>{role}</span>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Admin</h1>
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
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          <div className="relative">
            <span className="text-2xl cursor-pointer">🔔</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/placeholder.svg?height=40&width=40" alt="Profile" className="w-10 h-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Users</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">📤 Export</button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            <button className="text-gray-600 px-4 py-2 border border-gray-300 rounded-lg text-sm">🔽 Filters</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    <input type="checkbox" className="mr-3" />
                    Customer Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Joined Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-3" />
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
                        <button className="text-gray-400 hover:text-blue-600">👁️</button>
                        <button className="text-gray-400 hover:text-green-600">✏️</button>
                        <button className="text-gray-400 hover:text-red-600">🗑️</button>
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
