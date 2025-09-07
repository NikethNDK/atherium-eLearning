import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminBankDetailsModal from './AdminBankDetailsModal';

const AdminWithdrawalModal = ({ isOpen, onClose, onSubmit, maxAmount }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bankDetails, setBankDetails] = useState(null);
  const [allBankDetails, setAllBankDetails] = useState([]);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
  const [showBankSelector, setShowBankSelector] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBankDetails();
    }
  }, [isOpen]);

  const fetchBankDetails = async () => {
    try {
      setBankDetailsLoading(true);
      setError('');
      const data = await adminAPI.getBankDetails();
      setAllBankDetails(data);
      
      // Find primary bank details or use the first one
      const primaryBank = data.find(bank => bank.is_primary) || data[0];
      setBankDetails(primaryBank);
      
      if (!primaryBank && data.length === 0) {
        setError('No bank details found. Please add bank details first.');
      }
    } catch (err) {
      setError('No bank details found. Please add bank details first.');
      setBankDetails(null);
      setAllBankDetails([]);
    } finally {
      setBankDetailsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const withdrawalAmount = parseFloat(amount);

    // Validation
    if (!amount || isNaN(withdrawalAmount)) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }

    if (withdrawalAmount > maxAmount) {
      setError(`Amount cannot exceed available balance of ₹${maxAmount.toFixed(2)}`);
      return;
    }

    if (!bankDetails) {
      setError('No primary bank details found. Please add bank details first.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(withdrawalAmount, bankDetails.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    setShowBankDetailsModal(false);
    onClose();
  };

  const handleBankDetailsSubmit = async (formData) => {
    // The AdminBankDetailsModal handles the API call internally
    // We just need to refresh bank details after successful submission
    await fetchBankDetails();
    setShowBankDetailsModal(false);
  };

  const handleBankAccountSelect = (selectedBank) => {
    setBankDetails(selectedBank);
    setShowBankSelector(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Withdraw Funds</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {bankDetailsLoading ? (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Loading bank details...</span>
            </div>
          </div>
        ) : bankDetails ? (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-700">Withdrawal to:</h3>
              <div className="flex space-x-2">
                {allBankDetails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowBankSelector(true)}
                    className="text-xs text-green-600 hover:text-green-800 underline"
                  >
                    Select Account
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowBankDetailsModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Manage
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-900">{bankDetails.account_holder_name}</p>
            <p className="text-sm text-gray-600">{bankDetails.bank_name} - {bankDetails.branch_name}</p>
            <p className="text-sm text-gray-600">Account: {bankDetails.account_number}</p>
            <p className="text-sm text-gray-600">IFSC: {bankDetails.ifsc_code}</p>
            {bankDetails.is_primary && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Primary Account
              </span>
            )}
          </div>
        ) : (
          <div className="mb-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-600 mb-3">No bank details found. Please add bank details first.</p>
            <button
              type="button"
              onClick={() => setShowBankDetailsModal(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Add Bank Details
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Withdrawal Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                min="100"
                max={maxAmount}
                step="0.01"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available balance: ₹{maxAmount.toFixed(2)} | Minimum: ₹100
            </p>
            {amount && parseFloat(amount) >= 100 && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Amount is valid
              </p>
            )}
            {amount && parseFloat(amount) < 100 && (
              <p className="text-xs text-red-600 mt-1">
                ✗ Minimum amount is ₹100
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || bankDetailsLoading || !bankDetails || !amount || parseFloat(amount) < 100}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : bankDetailsLoading ? 'Loading...' : 'Withdraw Now'}
            </button>
          </div>
        </form>
      </div>

      {/* Bank Details Modal */}
      <AdminBankDetailsModal
        isOpen={showBankDetailsModal}
        onClose={() => setShowBankDetailsModal(false)}
        onSubmit={handleBankDetailsSubmit}
      />

      {/* Bank Account Selector Modal */}
      {showBankSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Select Bank Account</h2>
              <button
                onClick={() => setShowBankSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {allBankDetails.map((bank) => (
                <div
                  key={bank.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    bankDetails?.id === bank.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleBankAccountSelect(bank)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{bank.account_holder_name}</p>
                      <p className="text-sm text-gray-600">{bank.bank_name}</p>
                      <p className="text-xs text-gray-500">Account: {bank.account_number}</p>
                      <p className="text-xs text-gray-500">IFSC: {bank.ifsc_code}</p>
                    </div>
                    {bank.is_primary && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Primary
                      </span>
                    )}
                    {bankDetails?.id === bank.id && (
                      <span className="text-green-600 text-sm">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowBankSelector(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawalModal;

