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


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { Award, Download, Eye, X, Loader2, CheckCircle, AlertCircle, XCircle, BookOpen } from 'lucide-react'
import { userAPI } from '../../../../services/userApi'
import React from 'react' // Added missing import for React

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
    padding: 30,
    fontFamily: 'Helvetica',
    position: 'relative'
  },
  // Decorative border
  border: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    border: '3px solid #1e40af',
    borderStyle: 'double',
    borderWidth: 6
  },
  innerBorder: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    bottom: 30,
    border: '1px solid #3b82f6',
    borderStyle: 'solid'
  },
  // Header section
  header: {
    marginTop: 50,
    marginBottom: 30,
    alignItems: 'center'
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textAlign: 'center'
  },
  certificateTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  // Main content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 25
  },
  presentationText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 15,
    marginHorizontal: 40,
    lineHeight: 1.4
  },
  studentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
    marginVertical: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  courseText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 15,
    marginHorizontal: 40,
    lineHeight: 1.4
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  instructor: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic'
  },
  // Footer section
  footer: {
    marginTop: 25,
    alignItems: 'center'
  },
  date: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 15
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    width: '100%'
  },
  signatureBox: {
    alignItems: 'center',
    width: '45%'
  },
  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: '#1e40af',
    marginBottom: 8
  },
  signatureLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  },
  // Decorative elements
  cornerDecoration: {
    position: 'absolute',
    width: 40,
    height: 40,
    border: '2px solid #3b82f6',
    borderStyle: 'solid'
  },
  topLeft: {
    top: 45,
    left: 45,
    borderRight: 'none',
    borderBottom: 'none'
  },
  topRight: {
    top: 45,
    right: 45,
    borderLeft: 'none',
    borderBottom: 'none'
  },
  bottomLeft: {
    bottom: 45,
    left: 45,
    borderRight: 'none',
    borderTop: 'none'
  },
  bottomRight: {
    bottom: 45,
    right: 45,
    borderLeft: 'none',
    borderTop: 'none'
  },
  // Watermark
  watermark: {
    position: 'absolute',
    opacity: 0.05,
    fontSize: 80,
    color: '#1e40af',
    transform: 'rotate(-45deg)',
    left: 150,
    top: 300,
    fontWeight: 'bold'
  },
  // Certificate number
  certificateNumber: {
    position: 'absolute',
    top: 60,
    right: 60,
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic'
  }
})

const CertificateDocument = ({ certificateData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Decorative borders */}
      <View style={styles.border} />
      <View style={styles.innerBorder} />
      
      {/* Corner decorations */}
      <View style={[styles.cornerDecoration, styles.topLeft]} />
      <View style={[styles.cornerDecoration, styles.topRight]} />
      <View style={[styles.cornerDecoration, styles.bottomLeft]} />
      <View style={[styles.cornerDecoration, styles.bottomRight]} />
      
      {/* Watermark */}
      <Text style={styles.watermark}>AETHERIUM</Text>
      
      {/* Certificate number */}
      <Text style={styles.certificateNumber}>
        Certificate #: {certificateData.course_id}-{new Date().getFullYear()}-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
      </Text>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>AETHERIUM</Text>
        <Text style={styles.certificateTitle}>Certificate of Completion</Text>
        <Text style={styles.subtitle}>This is to certify that</Text>
      </View>
      
      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.studentName}>
          {certificateData.first_name} {certificateData.last_name}
        </Text>
        
        <Text style={styles.presentationText}>
          has successfully completed all requirements and demonstrated proficiency in
        </Text>
        
        <Text style={styles.courseText}>
          the course entitled
        </Text>
        
        <Text style={styles.courseTitle}>
          {certificateData.course_title}
        </Text>
        
        <Text style={styles.instructor}>
          Instructor: {certificateData.instructor_firstname} {certificateData.instructor_lastname}
        </Text>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.date}>
          Completed on: {new Date(certificateData.completion_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>
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
  const navigate = useNavigate()
  const [certificateData, setCertificateData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [message, setMessage] = useState(null)
  const [downloadError, setDownloadError] = useState(null)

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
    setDownloadError(null) // Clear any download errors
    
    try {
      console.log('Generating certificate for course:', course.id)
      const data = await userAPI.verifyCertificate(course.id)
      console.log('Certificate data received:', data)
      
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
      console.error('Error generating certificate:', error)
      showMessage(
        'error',
        'Certificate Generation Failed',
        error.message || 'Unable to generate certificate. Please try again later.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadError = (error) => {
    console.error('PDF Download Error:', error)
    setDownloadError('Failed to generate PDF. Please try again.')
    showMessage(
      'error',
      'Download Failed',
      'Unable to generate PDF certificate. Please try again or contact support.'
    )
  }

  const handleRevisitFirstLesson = () => {
    // Navigate to the course curriculum page with the first lesson active
    console.log('Navigating to course curriculum:', course.id)
    navigate(`/my-learning/course-curriculum/${course.id}`)
  }

  // Get the first lesson from the course
  const getFirstLesson = () => {
    if (course?.sections && course.sections.length > 0) {
      const firstSection = course.sections[0]
      if (firstSection.lessons && firstSection.lessons.length > 0) {
        return firstSection.lessons[0]
      }
    }
    return null
  }

  const firstLesson = getFirstLesson()

  // Debug: Log certificate data when it changes
  React.useEffect(() => {
    if (certificateData) {
      console.log('Certificate data updated:', certificateData)
    }
  }, [certificateData])

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
                      onError={handleDownloadError}
                      className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:translate-y-[-1px]"
                    >
                      {({ loading, error }) => {
                        if (error) {
                          console.error('PDFDownloadLink error:', error)
                          return (
                            <button
                              onClick={() => {
                                console.log('Attempting fallback download...')
                                // Fallback: Try to open in new tab
                                const blob = new Blob(['Certificate data'], { type: 'application/pdf' })
                                const url = URL.createObjectURL(blob)
                                const link = document.createElement('a')
                                link.href = url
                                link.download = `${course.title.replace(/\s+/g, '_')}_certificate.pdf`
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                                URL.revokeObjectURL(url)
                              }}
                              className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:translate-y-[-1px]"
                            >
                              <Download className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform duration-200" />
                              Try Alternative Download
                            </button>
                          )
                        }
                        
                        return (
                          <>
                            {loading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Download className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform duration-200" />
                            )}
                            {loading ? 'Preparing PDF...' : 'Download Certificate'}
                          </>
                        )
                      }}
                    </PDFDownloadLink>
                  </div>
                  
                  {/* Debug info and manual download option */}
                  {certificateData && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        Certificate Data: {certificateData.first_name} {certificateData.last_name} - {certificateData.course_title}
                      </p>
                      <button
                        onClick={() => {
                          console.log('Manual download triggered')
                          // Create a simple text-based certificate as fallback
                          const certificateText = `
CERTIFICATE OF COMPLETION

This is to certify that
${certificateData.first_name} ${certificateData.last_name}

has successfully completed the course
${certificateData.course_title}

Instructor: ${certificateData.instructor_firstname} ${certificateData.instructor_lastname}
Completed on: ${new Date(certificateData.completion_date).toLocaleDateString()}

Certificate #: ${certificateData.course_id}-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}

AETHERIUM
                          `.trim()
                          
                          const blob = new Blob([certificateText], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = `${course.title.replace(/\s+/g, '_')}_certificate.txt`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                          URL.revokeObjectURL(url)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Download as Text (Fallback)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Revisit First Lesson Button - Always visible after course completion */}
              {/* {firstLesson && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleRevisitFirstLesson}
                    className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:translate-y-[-2px]"
                  >
                    <BookOpen className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
                    Revisit the Lesson
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    Go back to the first lesson: "{firstLesson.name}"
                  </p>
                </div>
              )} */}
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