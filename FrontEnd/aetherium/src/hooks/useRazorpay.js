import { useState, useCallback } from 'react'
import { userAPI } from '../services/userApi'

// Utility function to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID

  const processPayment = useCallback(async (courseId, options = {}) => {
    try {
      setLoading(true)
      setError(null)

      // Validate Razorpay key
      if (!razorpayKeyId) {
        throw new Error('Razorpay configuration not found')
      }

      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script')
      }

      // Create order
      const orderData = await userAPI.createRazorpayOrder(courseId)

      // Return a promise that resolves when payment is complete
      return new Promise((resolve, reject) => {
        const razorpayOptions = {
          key: razorpayKeyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: options.companyName || 'Aetherium Learning',
          description: `Purchase: ${orderData.course_title}`,
          order_id: orderData.order_id,
          prefill: {
            name: orderData.user_name,
            email: orderData.user_email,
          },
          theme: {
            color: options.themeColor || '#06b6d4'
          },
          modal: {
            ondismiss: () => {
              setLoading(false)
              reject(new Error('Payment cancelled by user'))
            }
          },
          handler: async (response) => {
            try {
              // Verify payment
              const verificationData = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                course_id: orderData.course_id
              }
              
              const result = await userAPI.verifyRazorpayPayment(verificationData)
              
              if (result.success) {
                setLoading(false)
                resolve(result)
              } else {
                throw new Error(result.message || 'Payment verification failed')
              }
            } catch (verificationError) {
              setLoading(false)
              setError(verificationError.message)
              reject(verificationError)
            }
          }
        }

        const rzp = new window.Razorpay(razorpayOptions)
        
        rzp.on('payment.failed', (response) => {
          setLoading(false)
          const errorMsg = `Payment failed: ${response.error.description}`
          setError(errorMsg)
          reject(new Error(errorMsg))
        })
        
        rzp.open()
      })

    } catch (err) {
      setLoading(false)
      setError(err.message)
      throw err
    }
  }, [razorpayKeyId])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    processPayment,
    loading,
    error,
    clearError
  }
}