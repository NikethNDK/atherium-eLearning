import React, { useState, useEffect } from 'react';
import { instructorAPI } from '../../services/instructorApi';

const BankDetailsModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    bank_name: '',
    is_primary: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingBankDetails, setExistingBankDetails] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchBankDetails();
    }
  }, [isOpen]);

  const fetchBankDetails = async () => {
    try {
      const data = await instructorAPI.getBankDetails();
      setExistingBankDetails(data);
    } catch (err) {
      console.error('Failed to fetch bank details:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateIFSC = (ifsc) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.account_holder_name.trim()) {
      setError('Account holder name is required');
      return;
    }

    if (!formData.account_number.trim()) {
      setError('Account number is required');
      return;
    }

    if (formData.account_number.length < 9 || formData.account_number.length > 20) {
      setError('Account number must be between 9 and 20 digits');
      return;
    }

    if (!validateIFSC(formData.ifsc_code)) {
      setError('Invalid IFSC code format');
      return;
    }

    if (!formData.branch_name.trim()) {
      setError('Branch name is required');
      return;
    }

    if (!formData.bank_name.trim()) {
      setError('Bank name is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to save bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      account_holder_name: '',
      account_number: '',
      ifsc_code: '',
      branch_name: '',
      bank_name: '',
      is_primary: true
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Bank Details</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Existing Bank Details */}
        {existingBankDetails.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Existing Bank Details</h3>
            <div className="space-y-3">
              {existingBankDetails.map((bank) => (
                <div key={bank.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{bank.account_holder_name}</p>
                      <p className="text-sm text-gray-600">{bank.bank_name} - {bank.branch_name}</p>
                      <p className="text-sm text-gray-600">Account: {bank.account_number}</p>
                      <p className="text-sm text-gray-600">IFSC: {bank.ifsc_code}</p>
                    </div>
                    {bank.is_primary && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name *
              </label>
              <input
                type="text"
                name="account_holder_name"
                value={formData.account_holder_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter account holder name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter account number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code *
              </label>
              <input
                type="text"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="e.g., SBIN0001234"
                maxLength="11"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name *
              </label>
              <input
                type="text"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter branch name"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter bank name"
                required
              />
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="is_primary"
              checked={formData.is_primary}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Set as primary bank account
            </label>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Bank Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankDetailsModal;
