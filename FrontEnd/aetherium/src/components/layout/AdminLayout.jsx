import { Outlet } from "react-router-dom"
import AdminSidebar from "../sidebars/AdminSidebar"
import NotificationBell from "../common/NotificationBell"
import { useAuth } from "../../context/AuthContext"

const AdminLayout = () => {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {/* Admin Header with Notification Bell */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.firstname || "Admin"}</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          <Outlet context={{ user }} />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout