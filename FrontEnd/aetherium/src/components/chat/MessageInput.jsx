import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const MessageInput = ({ onSendMessage, onSendImage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const { startTyping, stopTyping, currentConversation } = useChat();
  const { user } = useAuth();

  // Clear error/success messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Get recipient ID based on current conversation
  const getRecipientId = () => {
    if (!currentConversation) return null;
    
    if (user?.role?.name === 'instructor') {
      // Instructor is sending to user
      return currentConversation.user_id;
    } else {
      // User is sending to instructor
      return currentConversation.instructor_id;
    }
  };

  // Handle typing start
  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      const recipientId = getRecipientId();
      console.log('Typing start - User:', user?.id, 'Recipient:', recipientId, 'Conversation:', currentConversation.id, 'Conversation type:', typeof currentConversation.id);
      if (recipientId) {
        startTyping(recipientId, currentConversation.id);
      } else {
        console.warn('No recipient ID found for typing indicator');
      }
    }
  };

  // Handle typing stop
  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      const recipientId = getRecipientId();
      console.log('Typing stop - User:', user?.id, 'Recipient:', recipientId, 'Conversation:', currentConversation.id);
      if (recipientId) {
        stopTyping(recipientId, currentConversation.id);
      } else {
        console.warn('No recipient ID found for typing stop indicator');
      }
    }
  };

  // Handle message input change
  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Start typing indicator
    if (newMessage.trim()) {
      handleTypingStart();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 2000);
    } else {
      handleTypingStop();
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || disabled) return;

    try {
      handleTypingStop();
      await onSendMessage(trimmedMessage);
      setMessage('');
      setSuccess('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target?.files[0];
    console.log('📸 Image upload started:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      disabled,
      isUploading
    });
    
    if (!file || disabled || isUploading) {
      console.log('❌ Image upload blocked:', { file: !!file, disabled, isUploading });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type);
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      setError('Image size must be less than 5MB');
      return;
    }

    console.log('✅ Image validation passed, starting upload...');
    setIsUploading(true);
    setError(null); // Clear any previous errors
    
    try {
      console.log('📤 Calling onSendImage with file:', file);
      const result = await onSendImage(file);
      console.log('✅ Image upload successful:', result);
      
      // Show success feedback
      setSuccess('Image uploaded successfully!');
      console.log('📸 Image message sent successfully');
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-2">
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send image"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled || isUploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            rows="1"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled || isUploading}
          className="flex-shrink-0 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Send message"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput; 