import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatWindow = ({ conversation, onBackToList }) => {
  const { user } = useAuth();
  const { messages, loading, loadMessages, sendMessage, sendImageMessage, typingUsers, markMessagesAsRead } = useChat();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (conversation?.id) {
      loadMessages(conversation.id);
    }
  }, [conversation?.id]);

  // Improved scroll logic - only scroll when new messages are added
  useEffect(() => {
    // Only auto-scroll if there are messages and we're not loading
    if (messages.length > 0 && !loading && !isLoadingMessages) {
      // Small delay to ensure DOM has updated
      const scrollTimer = setTimeout(() => {
        scrollToBottom();
      }, 200);
      
      return () => clearTimeout(scrollTimer);
    }
  }, [messages.length, loading, isLoadingMessages]); // Only trigger on message count change, not content

  // Separate effect for typing indicators
  useEffect(() => {
    if (typingUsers.size > 0) {
      scrollToBottom();
    }
  }, [typingUsers]);

  const scrollToBottom = () => {
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    });
  };

  // Manual scroll function for user control
  const handleManualScroll = () => {
    scrollToBottom();
  };

  // Scroll to bottom when new message is sent
  const handleMessageSent = async (content) => {
    try {
      await sendMessage(content);
      // Scroll to bottom after message is sent
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImageSent = async (file) => {
    try {
      const result = await sendImageMessage(file);
      // Scroll to bottom after image is sent
      setTimeout(scrollToBottom, 100);
      return result;
    } catch (error) {
      console.error('Error sending image:', error);
      throw error;
    }
  };

  // Mark messages as read when user scrolls through conversation
  const handleScroll = () => {
    if (conversation?.id && messages.length > 0) {
      // Mark messages as read when user scrolls (debounced)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        markMessagesAsRead(conversation.id);
      }, 1000); // Wait 1 second after scrolling stops
    }
  };

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const getDisplayName = () => {
    if (user?.role?.name === 'instructor') {
      return conversation.user_name;
    } else {
      return conversation.instructor_name;
    }
  };

  const getDisplayImage = () => {
    if (user?.role?.name === 'instructor') {
      return conversation.user_profile_picture;
    } else {
      return conversation.instructor_profile_picture;
    }
  };

  // Get typing indicator for current conversation
  const getTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    
    // Check if any user in the current conversation is typing
    const currentUserId = user?.role?.name === 'instructor' ? conversation.user_id : conversation.instructor_id;
    
    if (typingUsers.has(currentUserId)) {
      return (
        <div className="flex items-center space-x-2 text-gray-500 text-sm italic">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>{getDisplayName()} is typing...</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        {/* Back button for mobile */}
        <button
          onClick={onBackToList}
          className="md:hidden mr-3 p-2 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {getDisplayImage() ? (
            <img
              src={getDisplayImage()}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {getDisplayName()?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">{getDisplayName()}</h3>
          <p className="text-sm text-gray-500">
            {conversation.course_titles ? (
              conversation.course_titles.length === 1 ? 
                conversation.course_titles[0] : 
                `${conversation.course_titles.length} courses`
            ) : (
              conversation.course_title
            )}
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span className="text-xs text-gray-500">Online</span>
        </div>

        {/* Back to Curriculum button for users */}
        {user?.role?.name !== 'instructor' && (
          <button
            onClick={() => navigate('/my-learning')}
            className="ml-4 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Curriculum
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative" onScroll={handleScroll}>
        {loading || isLoadingMessages ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = Number(message.sender_id) === Number(user?.id);
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwn}
              />
            );
          })
        )}
        {/* Typing Indicator */}
        {getTypingIndicator()}
        <div ref={messagesEndRef} />
        
        {/* Scroll to Bottom Button */}
        <button
          onClick={handleManualScroll}
          className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-10"
          title="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput
          onSendMessage={handleMessageSent}
          onSendImage={handleImageSent}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default ChatWindow; 