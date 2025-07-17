import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { userAPI } from "../../../services/userApi";

const CompletionMessage = ({ onClose, courseId, isCourseComplete }) => {
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState(null);

  const generateCertificate = async () => {
    try {
      setGeneratingCert(true);
      const response = await userAPI.generateCertificate(courseId);
      setCertificateUrl(response.certificate_url);
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      setGeneratingCert(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">
            {isCourseComplete ? "Course Completed!" : "Lesson Completed!"}
          </h3>
          <p className="mb-4">
            {isCourseComplete
              ? "Congratulations on completing the course!"
              : "Great job! You've completed this lesson."}
          </p>
          
          {isCourseComplete && (
            <div className="mb-4">
              {certificateUrl ? (
                <a
                  href={certificateUrl}
                  download
                  className="text-blue-600 hover:underline"
                >
                  Download Certificate
                </a>
              ) : (
                <button
                  onClick={generateCertificate}
                  disabled={generatingCert}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {generatingCert ? "Generating..." : "Generate Certificate"}
                </button>
              )}
            </div>
          )}
          
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionMessage;