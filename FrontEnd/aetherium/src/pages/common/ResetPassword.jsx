// "use client"

// import { useState, useEffect } from "react"
// import { Link, useNavigate, useSearchParams } from "react-router-dom"
// import { authAPI } from "../../services/api"

// const ResetPassword = () => {
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const token = searchParams.get("token")

//   const [formData, setFormData] = useState({
//     newPassword: "",
//     confirmPassword: "",
//   })
//   const [loading, setLoading] = useState(false)
//   const [verifying, setVerifying] = useState(true)
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState(false)
//   const [tokenValid, setTokenValid] = useState(false)
//   const [userEmail, setUserEmail] = useState("")

//   useEffect(() => {
//     if (!token) {
//       setError("Invalid reset link")
//       setVerifying(false)
//       return
//     }

//     verifyToken()
//   }, [token])

//   const verifyToken = async () => {
//     try {
//       const response = await authAPI.verifyResetToken(token)
//       setTokenValid(true)
//       setUserEmail(response.email)
//     } catch (error) {
//       setError("This reset link is invalid or has expired")
//       setTokenValid(false)
//     } finally {
//       setVerifying(false)
//     }
//   }

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     })
//     setError("")
//   }

//   const validatePassword = (password) => {
//     if (password.length < 8) {
//       return "Password must be at least 8 characters long"
//     }
//     if (!/(?=.*[a-z])/.test(password)) {
//       return "Password must contain at least one lowercase letter"
//     }
//     if (!/(?=.*[A-Z])/.test(password)) {
//       return "Password must contain at least one uppercase letter"
//     }
//     if (!/(?=.*\d)/.test(password)) {
//       return "Password must contain at least one number"
//     }
//     return null
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError("")

//     // Validate passwords
//     if (formData.newPassword !== formData.confirmPassword) {
//       setError("Passwords do not match")
//       setLoading(false)
//       return
//     }

//     const passwordError = validatePassword(formData.newPassword)
//     if (passwordError) {
//       setError(passwordError)
//       setLoading(false)
//       return
//     }

//     try {
//       await authAPI.resetPassword({
//         token,
//         new_password: formData.newPassword,
//         confirm_password: formData.confirmPassword,
//       })
//       setSuccess(true)
//     } catch (error) {
//       setError(error.response?.data?.detail || "An error occurred. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (verifying) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Verifying reset link...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!tokenValid) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8">
//           <div className="text-center">
//             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
//               <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
//                 />
//               </svg>
//             </div>
//             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Invalid Reset Link</h2>
//             <p className="mt-2 text-sm text-gray-600">{error}</p>
//           </div>

//           <div className="text-center space-y-4">
//             <Link
//               to="/forgot-password"
//               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
//             >
//               Request New Reset Link
//             </Link>

//             <div>
//               <Link to="/login" className="text-gray-600 hover:text-gray-500 font-medium">
//                 Back to login
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (success) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8">
//           <div className="text-center">
//             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
//               <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
//             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Password Reset Successful</h2>
//             <p className="mt-2 text-sm text-gray-600">
//               Your password has been reset successfully. You can now login with your new password.
//             </p>
//           </div>

//           <div className="text-center">
//             <button
//               onClick={() => navigate("/login")}
//               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
//             >
//               Go to Login
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <div className="text-center">
//             <Link to="/" className="flex justify-center">
//               <span className="text-3xl font-bold text-purple-600">EduPlatform</span>
//             </Link>
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Enter your new password for <span className="font-medium">{userEmail}</span>
//           </p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             <div>
//               <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
//                 New Password
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="newPassword"
//                   name="newPassword"
//                   type="password"
//                   required
//                   value={formData.newPassword}
//                   onChange={handleChange}
//                   className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
//                   placeholder="Enter new password"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
//                 Confirm New Password
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   type="password"
//                   required
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
//                   placeholder="Confirm new password"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
//                   <path
//                     fillRule="evenodd"
//                     d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <h3 className="text-sm font-medium text-blue-800">Password Requirements</h3>
//                 <div className="mt-2 text-sm text-blue-700">
//                   <ul className="list-disc list-inside space-y-1">
//                     <li>At least 8 characters long</li>
//                     <li>Contains uppercase and lowercase letters</li>
//                     <li>Contains at least one number</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-md p-4">
//               <div className="flex">
//                 <div className="flex-shrink-0">
//                   <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm text-red-800">{error}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {loading ? (
//                 <div className="flex items-center">
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     />
//                   </svg>
//                   Resetting...
//                 </div>
//               ) : (
//                 "Reset Password"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default ResetPassword


import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import {authAPI} from '../../services/api'

const ResetPassword = ( ) => {
  const onVerifyResetToken= authAPI.verifyResetToken
  const onResetPassword= authAPI.resetPassword
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await onVerifyResetToken(token);
        setTokenValid(response.valid);
        setUserEmail(response.email);
      } catch (err) {
        setError('Invalid or expired reset token. Please request a new password reset.');
        setTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, onVerifyResetToken]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    return { score, feedback };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');

    if (name === 'newPassword') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onResetPassword({
        token,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying reset token...</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Password Reset Successful!
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your password has been successfully updated. You can now login with your new password.
              </p>

              <Link
                to="/login"
                className="w-full block bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 text-center"
              >
                Continue to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Invalid Reset Link
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {error || 'This password reset link is invalid or has expired. Please request a new one.'}
              </p>

              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="w-full block bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 text-center"
                >
                  Request New Reset Link
                </Link>
                
                <Link
                  to="/login"
                  className="w-full block text-center text-indigo-600 hover:text-indigo-700 font-medium py-2 transition-colors duration-200"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-6">
              <Shield className="h-8 w-8 text-indigo-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Password
            </h2>
            
            <p className="text-gray-600 leading-relaxed">
              Create a new password for <strong>{userEmail}</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 pr-12"
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-600' :
                      passwordStrength.score <= 3 ? 'text-yellow-600' :
                      passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Password should include:</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {passwordStrength.feedback.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 pr-12"
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Passwords do not match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating Password...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Lock className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Security Tip</p>
                <p className="text-xs text-blue-700">
                  Choose a strong password that you haven't used before. Consider using a password manager to generate and store secure passwords.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-gray-700 transition-colors duration-200"
          >
            Remember your password? Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;