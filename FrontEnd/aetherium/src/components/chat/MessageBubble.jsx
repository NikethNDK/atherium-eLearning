import React, { useState } from 'react';

const MessageBubble = ({ message, isOwnMessage }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Profile Picture for other person's messages */}
        {!isOwnMessage && (
          <div className="flex items-end mb-1">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
              <span className="text-gray-600 text-xs font-medium">
                {message.sender_name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Message Content */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Message Type */}
          {message.message_type === 'image' ? (
            <div className="space-y-2">
              {!imageLoaded && !imageError && (
                <div className="animate-pulse bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                </div>
              )}
              
              {imageError ? (
                <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">Image failed to load</p>
                  </div>
                </div>
              ) : (
                <img
                  src={message.content}
                  alt="Shared image"
                  className={`rounded-lg max-w-full h-auto ${
                    imageLoaded ? 'block' : 'hidden'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ maxHeight: '300px' }}
                />
              )}
              
              <div className="flex items-center justify-between text-xs opacity-75">
                <span>📷 Image</span>
                <span>{formatTime(message.created_at)}</span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              <div className="flex items-center justify-end mt-1">
                <span className="text-xs opacity-75">{formatTime(message.created_at)}</span>
                {isOwnMessage && (
                  <span className="ml-2">
                    {message.is_read ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 