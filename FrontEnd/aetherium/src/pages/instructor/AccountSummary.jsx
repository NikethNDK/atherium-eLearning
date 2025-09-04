import React, { useState, useEffect } from 'react';
import { instructorAPI } from '../../services/instructorApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WithdrawalRequestModal from '../../components/withdrawal/WithdrawalRequestModal';
import BankDetailsModal from '../../components/withdrawal/BankDetailsModal';
import WithdrawalHistoryTable from '../../components/withdrawal/WithdrawalHistoryTable';
import WithdrawalSuccessModal from '../../components/withdrawal/WithdrawalSuccessModal';

const AccountSummary = () => {
  const [accountSummary, setAccountSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchAccountSummary();
  }, []);

  const fetchAccountSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorAPI.getAccountSummary();
      setAccountSummary(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch account summary');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async (amount) => {
    try {
      await instructorAPI.createWithdrawalRequest(amount);
      setSuccessMessage('Withdrawal request submitted successfully!');
      setShowWithdrawalModal(false);
      fetchAccountSummary(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit withdrawal request');
    }
  };

  const handleCompleteWithdrawal = async (requestId) => {
    try {
      // First check if bank details exist and are marked as primary
      const bankDetails = await instructorAPI.getBankDetails();
      const primaryBankDetails = bankDetails.find(bank => bank.is_primary);
      
      if (!primaryBankDetails) {
        // No primary bank details found, show bank details modal
        setSelectedRequest(requestId); // Store request ID for later completion
        setShowBankDetailsModal(true);
        setError('Please add your bank details before completing the withdrawal.');
        return;
      }
      
      // Proceed with withdrawal completion
      await instructorAPI.completeWithdrawal(requestId);
      setSuccessMessage('Withdrawal completed successfully! Amount will be credited within 24-48 hours.');
      setShowSuccessModal(true);
      fetchAccountSummary(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete withdrawal');
    }
  };

  const handleBankDetailsSubmit = async (bankData) => {
    try {
      await instructorAPI.createBankDetails(bankData);
      setSuccessMessage('Bank details saved successfully!');
      setShowBankDetailsModal(false);
      
      // If there's a pending withdrawal request, automatically complete it
      if (selectedRequest) {
        try {
          await instructorAPI.completeWithdrawal(selectedRequest);
          setSuccessMessage('Withdrawal completed successfully! Amount will be credited within 24-48 hours.');
          setShowSuccessModal(true);
          fetchAccountSummary(); // Refresh data
        } catch (withdrawalErr) {
          setError(withdrawalErr.response?.data?.detail || 'Failed to complete withdrawal after saving bank details');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save bank details');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Summary</h1>
        <p className="text-gray-600">Manage your earnings and withdrawal requests</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {accountSummary && (
        <>
          {/* Account Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(accountSummary.wallet_balance)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(accountSummary.total_earnings)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Withdrawals</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(accountSummary.pending_withdrawals)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Withdrawals</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(accountSummary.completed_withdrawals)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setShowWithdrawalModal(true)}
              disabled={accountSummary.wallet_balance <= 0}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Request Withdrawal
            </button>
            <button
              onClick={() => setShowBankDetailsModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Manage Bank Details
            </button>
          </div>

          {/* Withdrawal History */}
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Withdrawal History</h2>
            </div>
            <WithdrawalHistoryTable
              requests={accountSummary.withdrawal_requests}
              onCompleteWithdrawal={handleCompleteWithdrawal}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showWithdrawalModal && (
        <WithdrawalRequestModal
          isOpen={showWithdrawalModal}
          onClose={() => setShowWithdrawalModal(false)}
          onSubmit={handleWithdrawalRequest}
          maxAmount={accountSummary?.wallet_balance || 0}
          formatCurrency={formatCurrency}
        />
      )}

             {showBankDetailsModal && (
         <BankDetailsModal
           isOpen={showBankDetailsModal}
           onClose={() => {
             setShowBankDetailsModal(false);
             setSelectedRequest(null);
           }}
           onSubmit={handleBankDetailsSubmit}
         />
       )}

      {showSuccessModal && (
        <WithdrawalSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default AccountSummary;
