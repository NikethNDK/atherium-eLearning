import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminWithdrawalModal = ({ isOpen, onClose, onSubmit, maxAmount }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bankDetails, setBankDetails] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPrimaryBankDetails();
    }
  }, [isOpen]);

  const fetchPrimaryBankDetails = async () => {
    try {
      const data = await adminAPI.getPrimaryBankDetails();
      setBankDetails(data);
    } catch (err) {
      setError('No primary bank details found. Please add bank details first.');
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
    onClose();
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

        {bankDetails && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Withdrawal to:</h3>
            <p className="text-sm text-gray-900">{bankDetails.account_holder_name}</p>
            <p className="text-sm text-gray-600">{bankDetails.bank_name} - {bankDetails.branch_name}</p>
            <p className="text-sm text-gray-600">Account: {bankDetails.account_number}</p>
            <p className="text-sm text-gray-600">IFSC: {bankDetails.ifsc_code}</p>
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
              disabled={loading || !bankDetails}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminWithdrawalModal;

