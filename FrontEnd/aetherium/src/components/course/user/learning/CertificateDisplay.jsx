"use client"

import { userAPI } from "../../../../services/userApi"
import { Award } from "lucide-react"

const CertificateDisplay = ({ course }) => {
  const handleGenerateCertificate = () => {
    userAPI.downloadCertificate(course.id)
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <Award className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Congratulations!</h2>
      <p className="text-lg text-gray-700 mb-6">
        You have successfully completed the course: <span className="font-semibold">{course.title}</span>!
      </p>
      <button
        onClick={handleGenerateCertificate}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors"
      >
        Generate Your Certificate
      </button>
      <p className="text-sm text-gray-500 mt-4">(Note: Certificate generation requires backend support.)</p>
    </div>
  )
}

export default CertificateDisplay
