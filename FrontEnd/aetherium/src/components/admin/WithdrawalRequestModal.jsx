import React, { useState } from 'react';
import { formatDate } from '../../utils/dateUtils';

const WithdrawalRequestModal = ({ isOpen, onClose, request, onSubmit, formatCurrency }) => {
  const [status, setStatus] = useState('approved');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminFeedback.trim()) {
      setError('Admin feedback is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(request.id, status, adminFeedback);
    } catch (err) {
      setError(err.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus('approved');
    setAdminFeedback('');
    setError('');
    onClose();
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Review Withdrawal Request</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Request Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Request ID</label>
              <p className="text-sm text-gray-900">#{request.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Instructor</label>
              <p className="text-sm text-gray-900">{request.instructor_name || 'Unknown'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <p className="text-sm text-gray-900">{formatCurrency(request.amount)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Instructor Balance</label>
              <p className="text-sm text-gray-900">{formatCurrency(request.instructor_balance || 0)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Requested Date</label>
              <p className="text-sm text-gray-900">{formatDate(request.requested_at)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decision *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="approved"
                  checked={status === 'approved'}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Approve Request</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="rejected"
                  checked={status === 'rejected'}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Reject Request</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Feedback *
            </label>
            <textarea
              value={adminFeedback}
              onChange={(e) => setAdminFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Provide feedback for the instructor..."
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed ${
                status === 'approved' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Processing...' : `${status === 'approved' ? 'Approve' : 'Reject'} Request`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalRequestModal;
