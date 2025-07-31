import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { useAuth } from '../../context/AuthContext';

const ChatInterface = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    currentConversation, 
    loading, 
    loadConversations,
    loadMessages,
    setCurrentConversation 
  } = useChat();
  const [showConversationList, setShowConversationList] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  const handleConversationSelect = (conversation) => {
    setCurrentConversation(conversation);
    setShowConversationList(false);
    // Load messages for the selected conversation
    loadMessages(conversation.id);
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversation List - Mobile: hidden when chat is open */}
      <div className={`${
        showConversationList ? 'block' : 'hidden'
      } md:block md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white`}>
        <ConversationList 
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleConversationSelect}
          loading={loading}
        />
      </div>

      {/* Chat Window */}
      <div className={`${
        showConversationList ? 'hidden' : 'block'
      } md:block md:w-2/3 lg:w-3/4 flex flex-col`}>
        {currentConversation ? (
          <ChatWindow 
            conversation={currentConversation}
            onBackToList={handleBackToList}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface; 