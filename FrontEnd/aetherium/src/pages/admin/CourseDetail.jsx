import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { adminAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await adminAPI.getCourse(id);
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await adminAPI.reviewCourse(id, "verified", null);
      window.history.back();
    } catch (error) {
      console.error("Error verifying course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await adminAPI.reviewCourse(id, "rejected", rejectionReason);
      setShowRejectModal(false);
      window.history.back();
    } catch (error) {
      console.error("Error rejecting course:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{course?.title}</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <p><strong>Subtitle:</strong> {course?.subtitle}</p>
        <p><strong>Language:</strong> {course?.language}</p>
        <p><strong>Level:</strong> {course?.level}</p>
        <p><strong>Duration:</strong> {course?.duration} {course?.duration_unit}</p>
        <p><strong>Price:</strong> ₹{course?.price}</p>
        <p><strong>Status:</strong> {course?.verification_status}</p>
        <p><strong>Published:</strong> {course?.is_published ? "Yes" : "No"}</p>
      </div>
      <div className="flex space-x-4">
        <button onClick={handleVerify} className="bg-purple-600 text-white p-2 rounded">Verify and Publish Course</button>
        <button onClick={() => setShowRejectModal(true)} className="bg-red-600 text-white p-2 rounded">Reject Course</button>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Reason for Rejection</h2>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full p-2 mb-4 border rounded" />
            <div className="flex space-x-4">
              <button onClick={handleReject} className="bg-red-600 text-white p-2 rounded">Submit Rejection</button>
              <button onClick={() => setShowRejectModal(false)} className="bg-gray-300 p-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;