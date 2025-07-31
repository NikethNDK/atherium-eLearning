import React from 'react';
import ChatInterface from '../../components/chat/ChatInterface';
import { ChatProvider } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const Chat = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please log in to access chat</p>
      </div>
    );
  }

  return (
    <ChatProvider userId={user.id}>
      <ChatInterface />
    </ChatProvider>
  );
};

export default Chat; 