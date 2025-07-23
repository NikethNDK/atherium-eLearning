// "use client"

// import { userAPI } from "../../../../services/userApi"
// import { Award } from "lucide-react"

// const CertificateDisplay = ({ course }) => {
//   const handleGenerateCertificate = () => {
//     userAPI.downloadCertificate(course.id)
//   }

//   return (
//     <div className="bg-white p-8 rounded-lg shadow-md text-center">
//       <Award className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
//       <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Congratulations!</h2>
//       <p className="text-lg text-gray-700 mb-6">
//         You have successfully completed the course: <span className="font-semibold">{course.title}</span>!
//       </p>
//       <button
//         onClick={() => navigate("/user/generate-certificate")}
//         className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors"
//       >
//         Generate Your Certificate
//       </button>
//       <p className="text-sm text-gray-500 mt-4">(Note: Certificate generation requires backend support.)</p>
//     </div>
//   )
// }

// export default CertificateDisplay
"use client"

import { useState } from 'react'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { Award, Download, Eye, X, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { userAPI } from '../../../../services/userApi'

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
  ]
})

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    color: '#374151'
  },
  userName: {
    fontSize: 22,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
    color: '#059669'
  },
  courseTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  instructor: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#6b7280'
  },
  date: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: '#374151'
  },
  watermark: {
    position: 'absolute',
    opacity: 0.1,
    fontSize: 72,
    color: '#3b82f6',
    transform: 'rotate(-45deg)',
    left: 150,
    top: 300
  }
})

const CertificateDocument = ({ certificateData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.watermark}>Aetherium</Text>
      <Text style={styles.header}>Certificate of Completion</Text>
      <Text style={styles.text}>This is to certify that</Text>
      <Text style={styles.userName}>
        {certificateData.first_name} {certificateData.last_name}
      </Text>
      <Text style={styles.text}>has successfully completed the course</Text>
      <Text style={styles.courseTitle}>{certificateData.course_title}</Text>
      <Text style={styles.instructor}>
        Instructor: {certificateData.instructor_firstname} {certificateData.instructor_lastname}
      </Text>
      <Text style={styles.date}>
        Completed on: {new Date(certificateData.completion_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Text>
    </Page>
  </Document>
)

const CertificatePreview = ({ certificateData, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Eye className="w-6 h-6 text-blue-600" />
          Certificate Preview
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Certificate Preview Content */}
      <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white p-10 border-4 border-gray-300 rounded-xl shadow-lg relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-purple-500 to-blue-500"></div>
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-blue-100 text-8xl font-bold transform rotate-45 opacity-20 select-none">
              VERIFIED
            </div>
          </div>
          
          {/* Certificate Content */}
          <div className="text-center relative z-10">
            <div className="mb-8">
              <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Certificate of Completion</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
            </div>
            
            <p className="text-lg text-gray-700 mb-6 font-medium">This is to certify that</p>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg mb-6 border border-green-200">
              <h3 className="text-3xl font-bold text-green-700 mb-2">
                {certificateData.first_name} {certificateData.last_name}
              </h3>
            </div>
            
            <p className="text-lg text-gray-700 mb-6 font-medium">has successfully completed the course</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-200">
              <h4 className="text-2xl font-bold text-gray-900">{certificateData.course_title}</h4>
            </div>
            
            <div className="space-y-3 text-gray-600">
              <p className="text-lg font-medium">
                <span className="text-gray-800">Instructor:</span> {certificateData.instructor_firstname} {certificateData.instructor_lastname}
              </p>
              <p className="text-lg font-medium">
                <span className="text-gray-800">Completed on:</span> {new Date(certificateData.completion_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with download button */}
      <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex justify-center">
        <PDFDownloadLink
          document={<CertificateDocument certificateData={certificateData} />}
          fileName={`${certificateData.course_title.replace(/\s+/g, '_')}_certificate.pdf`}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:translate-y-[-1px]"
        >
          {({ loading }) => (
            <>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {loading ? 'Preparing PDF...' : 'Download Certificate'}
            </>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  </div>
)

// Inline Message Component
const InlineMessage = ({ type, title, message, onClose }) => {
  const getMessageStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          titleColor: 'text-green-800',
          textColor: 'text-green-700'
        }
      case 'error':
        return {
          container: 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200',
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          titleColor: 'text-red-800',
          textColor: 'text-red-700'
        }
      case 'info':
        return {
          container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200',
          icon: <AlertCircle className="w-6 h-6 text-blue-600" />,
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700'
        }
      default:
        return {
          container: 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200',
          icon: <AlertCircle className="w-6 h-6 text-gray-600" />,
          titleColor: 'text-gray-800',
          textColor: 'text-gray-700'
        }
    }
  }

  const styles = getMessageStyles()

  return (
    <div className={`${styles.container} p-4 rounded-lg mb-6 animate-in slide-in-from-top duration-300`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${styles.titleColor} mb-1`}>
            {title}
          </h4>
          <p className={`${styles.textColor} text-sm leading-relaxed`}>
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

const CertificateDisplay = ({ course }) => {
  const [certificateData, setCertificateData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [message, setMessage] = useState(null)

  const showMessage = (type, title, text) => {
    setMessage({ type, title, text })
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const hideMessage = () => {
    setMessage(null)
  }

  const handleGenerateCertificate = async () => {
    setIsLoading(true)
    setMessage(null) // Clear any existing messages
    
    try {
      const data = await userAPI.verifyCertificate(course.id)
      
      if (!data.eligible) {
        throw new Error('You are not eligible for a certificate for this course')
      }

      setCertificateData(data)
      setShowPreview(true)
      
      showMessage(
        'success',
        'Certificate Ready! 🎉',
        'Your certificate has been generated successfully and is ready for download.'
      )
    } catch (error) {
      showMessage(
        'error',
        'Certificate Generation Failed',
        error.message || 'Unable to generate certificate. Please try again later.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Decorative header */}
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
        
        <div className="p-8 text-center">
          {/* Display inline messages */}
          {message && (
            <InlineMessage
              type={message.type}
              title={message.title}
              message={message.text}
              onClose={message.type === 'error' ? hideMessage : null} // Only allow closing error messages
            />
          )}

          {/* Icon and celebration */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Award className="relative w-20 h-20 text-yellow-500 mx-auto drop-shadow-lg" />
          </div>
          
          {/* Main content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Congratulations! 🎉
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6"></div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <p className="text-lg text-gray-700 leading-relaxed">
                You have successfully completed the course
              </p>
              <p className="text-xl font-bold text-blue-700 mt-2">
                "{course.title}"
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="mt-8">
              {!certificateData ? (
                <button
                  onClick={handleGenerateCertificate}
                  disabled={isLoading}
                  className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 disabled:cursor-not-allowed inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:translate-y-[-2px] disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying Eligibility...
                    </>
                  ) : (
                    <>
                      <Award className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
                      Generate Your Certificate
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-6">
                  {/* Success message is now handled by the inline message above */}
                  
                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:translate-y-[-1px]"
                    >
                      <Eye className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      Preview Certificate
                    </button>
                    
                    <PDFDownloadLink
                      document={<CertificateDocument certificateData={certificateData} />}
                      fileName={`${course.title.replace(/\s+/g, '_')}_certificate.pdf`}
                      className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:translate-y-[-1px]"
                    >
                      {({ loading }) => (
                        <>
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Download className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform duration-200" />
                          )}
                          {loading ? 'Preparing PDF...' : 'Download Certificate'}
                        </>
                      )}
                    </PDFDownloadLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPreview && certificateData && (
        <CertificatePreview 
          certificateData={certificateData} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  )
}

export default CertificateDisplay