"use client"

import { useState } from 'react'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { useToast } from '@/components/ui/use-toast'
import { Award } from 'lucide-react'

// Register fonts if needed
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
    fontWeight: 'bold'
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15
  },
  userName: {
    fontSize: 22,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold'
  },
  courseTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold'
  },
  date: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40
  },
  watermark: {
    position: 'absolute',
    opacity: 0.1,
    fontSize: 72,
    color: 'blue',
    transform: 'rotate(-45deg)',
    left: 150,
    top: 300
  }
})

const CertificateDocument = ({ user, course }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.watermark}>VERIFIED</Text>
      <Text style={styles.header}>Certificate of Completion</Text>
      <Text style={styles.text}>This is to certify that</Text>
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.text}>has successfully completed the course</Text>
      <Text style={styles.courseTitle}>{course.title}</Text>
      <Text style={styles.text}>with a total duration of {course.duration} hours</Text>
      <Text style={styles.date}>Completed on: {new Date(course.completion_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</Text>
    </Page>
  </Document>
)

const CertificateDisplay = ({ course }) => {
  const [certificateData, setCertificateData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerateCertificate = async () => {
    setIsLoading(true)
    try {
      const response = await userAPI.verifyCertificate(course.id)
      setCertificateData(response)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "You're not eligible for a certificate",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <Award className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Congratulations!</h2>
      <p className="text-lg text-gray-700 mb-6">
        You have successfully completed the course: <span className="font-semibold">{course.title}</span>!
      </p>
      
      {!certificateData ? (
        <button
          onClick={handleGenerateCertificate}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Generate Your Certificate"}
        </button>
      ) : (
        <div className="mt-4">
          <PDFDownloadLink
            document={<CertificateDocument user={certificateData.user} course={certificateData.course} />}
            fileName={`${course.title.replace(/\s+/g, '_')}_certificate.pdf`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors inline-block"
          >
            {({ loading }) => (
              loading ? 'Preparing certificate...' : 'Download Certificate Now'
            )}
          </PDFDownloadLink>
          <p className="text-sm text-gray-500 mt-4">
            Your certificate is ready! Click above to download.
          </p>
        </div>
      )}
    </div>
  )
}

export default CertificateDisplay