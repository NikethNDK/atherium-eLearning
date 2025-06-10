import { Outlet } from "react-router-dom"
import InstructorSidebar from "../sidebars/InstructorSidebar"
import { useAuth } from "../../context/AuthContext"

const InstructorLayout = () => {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <div className="flex-1 overflow-auto">
        <Outlet context={{ user }} />
      </div>
    </div>
  )
}

export default InstructorLayout
