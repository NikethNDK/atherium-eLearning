import { Outlet } from "react-router-dom"
import AdminSidebar from "../sidebars/AdminSidebar"
import { useAuth } from "../../context/AuthContext"

const AdminLayout = () => {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <Outlet context={{ user }} />
      </div>
    </div>
  )
}

export default AdminLayout