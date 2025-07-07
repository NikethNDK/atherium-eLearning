"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { authAPI } from "../../services/api"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await authAPI.forgotPassword(email)
      setMessage(response.message)
      setEmailSent(true)
    } catch (error) {
      setError(error.response?.data?.detail || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">What's next?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the reset link in the email</li>
                    <li>The link expires in 1 hour</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={() => {
                setEmailSent(false)
                setEmail("")
                setMessage("")
              }}
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              Try a different email address
            </button>

            <div>
              <Link to="/login" className="text-gray-600 hover:text-gray-500 font-medium">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <Link to="/" className="flex justify-center">
              <span className="text-3xl font-bold text-purple-600">Aetherium</span>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Forgot your password?</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </div>
              ) : (
                "Send reset link"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-purple-600 hover:text-purple-500 font-medium transition-colors">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword


// import React, { useState } from 'react';
// import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
// import { Link } from 'react-router-dom';

// const ForgotPassword = ({ onForgotPassword, onBack }) => {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [error, setError] = useState('');

//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!email) {
//       setError('Please enter your email address');
//       return;
//     }

//     if (!validateEmail(email)) {
//       setError('Please enter a valid email address');
//       return;
//     }

//     setIsLoading(true);
//     setError('');
//     setMessage('');

//     try {
//       const response = await onForgotPassword(email);
//       setMessage(response.message);
//       setIsSuccess(true);
//     } catch (err) {
//       if (err.response?.status === 429) {
//         setError('A password reset email was already sent. Please check your email or wait before requesting again.');
//       } else {
//         setError(err.response?.data?.detail || 'An error occurred. Please try again.');
//       }
//       setIsSuccess(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isSuccess) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//         <div className="max-w-md w-full">
//           <div className="bg-white rounded-2xl shadow-xl p-8">
//             <div className="text-center">
//               <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
//                 <CheckCircle className="h-8 w-8 text-green-600" />
//               </div>
              
//               <h2 className="text-2xl font-bold text-gray-900 mb-4">
//                 Check Your Email
//               </h2>
              
//               <p className="text-gray-600 mb-6 leading-relaxed">
//                 {message}
//               </p>
              
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//                 <p className="text-sm text-blue-700">
//                   <strong>Didn't receive the email?</strong>
//                   <br />
//                   Check your spam folder or try again in a few minutes.
//                 </p>
//               </div>

//               <div className="space-y-3">
//                 <button
//                   onClick={() => {
//                     setIsSuccess(false);
//                     setEmail('');
//                     setMessage('');
//                   }}
//                   className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
//                 >
//                   Send Another Email
//                 </button>
                
//                 <Link
//                   to="/login"
//                   className="w-full block text-center text-indigo-600 hover:text-indigo-700 font-medium py-2 transition-colors duration-200"
//                 >
//                   Back to Login
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-6">
//               <Mail className="h-8 w-8 text-indigo-600" />
//             </div>
            
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">
//               Forgot Password?
//             </h2>
            
//             <p className="text-gray-600 leading-relaxed">
//               No worries! Enter your email address and we'll send you a link to reset your password.
//             </p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                     setError('');
//                   }}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
//                     error ? 'border-red-300 bg-red-50' : 'border-gray-300'
//                   }`}
//                   placeholder="Enter your email address"
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             {/* Error Message */}
//             {error && (
//               <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
//                 <AlertCircle className="h-5 w-5 flex-shrink-0" />
//                 <span className="text-sm">{error}</span>
//               </div>
//             )}

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                   Sending Reset Link...
//                 </div>
//               ) : (
//                 'Send Reset Link'
//               )}
//             </button>
//           </form>

//           {/* Back to Login */}
//           <div className="mt-6 text-center">
//             <Link
//               to="/login"
//               className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Login
//             </Link>
//           </div>
//         </div>

//         {/* Additional Help */}
//         <div className="mt-6 text-center">
//           <p className="text-sm text-gray-600">
//             Still having trouble?{' '}
//             <a href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
//               Contact Support
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;