import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { chatAPI } from '../services/api.js';

const ChatContext = createContext();

export const ChatProvider = ({ children, userId }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const baseWsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

  // WebSocket connection
  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`${baseWsUrl}/ws/${userId}`);
      
      ws.onopen = () => {
        console.log('Chat WebSocket connected');
      };

      // ws.onmessage = (event) => {
      //   try {
      //     const data = JSON.parse(event.data);
      //     console.log('WebSocket message received:', data);
          
      //     if (data.type === 'chat_message') {
      //       console.log('Processing chat message:', data);
      //       console.log('Current conversation:', currentConversation);
            
      //       // Add new message to current messages if we're in the right conversation
      //       setMessages(prevMessages => {
      //         // Check if this message belongs to the current conversation
      //         if (currentConversation) {
      //           if (currentConversation.id.startsWith('instructor_')) {
      //             const instructorId = currentConversation.id.replace('instructor_', '');
      //             console.log('User viewing instructor conversation, instructorId:', instructorId, 'message sender_id:', data.sender_id);
      //             // For user viewing instructor conversation, check if message is from this instructor
      //             if (data.sender_id === parseInt(instructorId)) {
      //               console.log('Adding instructor message to user chat');
      //               return [...prevMessages, data];
      //             }
      //           } else if (currentConversation.id.startsWith('user_')) {
      //             const userId = currentConversation.id.replace('user_', '');
      //             console.log('Instructor viewing user conversation, userId:', userId, 'message sender_id:', data.sender_id);
      //             // For instructor viewing user conversation, check if message is from this user
      //             if (data.sender_id === parseInt(userId)) {
      //               console.log('Adding user message to instructor chat');
      //               return [...prevMessages, data];
      //             }
      //           } else {
      //             // Regular conversation
      //             console.log('Regular conversation, conversation_id:', currentConversation.id, 'message conversation_id:', data.conversation_id);
      //             if (data.conversation_id === parseInt(currentConversation.id)) {
      //               console.log('Adding message to regular conversation');
      //               return [...prevMessages, data];
      //             }
      //           }
      //         } else {
      //           console.log('No current conversation, cannot add message');
      //         }
      //         return prevMessages;
      //       });
      //     }
      //   } catch (error) {
      //     console.error('Error parsing WebSocket message:', error);
      //   }
      // };

      ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    
    if (data.type === 'chat_message') {
      const message = data.data || data; // Handle both formats
      
      // Update messages if viewing the relevant conversation
      setMessages(prevMessages => {
        
        if (prevMessages.some(m => m.id === message.id)) return prevMessages;
        
        // For instructor grouped view
        if (currentConversation?.id?.startsWith('instructor_')) {
          const instructorId = parseInt(currentConversation.id.replace('instructor_', ''));
          if (message.sender_id === instructorId) return [...prevMessages, message];
        }
        // For user grouped view
        else if (currentConversation?.id?.startsWith('user_')) {
          const userId = parseInt(currentConversation.id.replace('user_', ''));
          if (message.sender_id === userId) return [...prevMessages, message];
        }
        // For regular conversation
        else if (currentConversation?.id === message.conversation_id?.toString()) {
          return [...prevMessages, message];
        }
        
        return prevMessages;
      });
      
      // Update conversations list
      setConversations(prevConvs => {
        return prevConvs.map(conv => {
          const isRelevant = (
            (conv.id.startsWith('instructor_') && 
             parseInt(conv.id.replace('instructor_', '')) === message.sender_id) ||
            (conv.id.startsWith('user_') && 
             parseInt(conv.id.replace('user_', '')) === message.sender_id) ||
            (conv.id === message.conversation_id?.toString())
          );
          
          if (isRelevant) {
            return {
              ...conv,
              last_message: message,
              updated_at: new Date().toISOString(),
              unread_count: conv.id === currentConversation?.id ? 
                conv.unread_count : 
                conv.unread_count + 1
            };
          }
          return conv;
        });
      });
    }
  } catch (error) {
    console.error('WebSocket message error:', error);
  }
};
      ws.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Chat WebSocket disconnected');
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId, baseWsUrl, currentConversation]);

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getConversations();
      setConversations(response.conversations || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId, page = 1) => {
    try {
      setLoading(true);
      let response;
      
      if (conversationId.startsWith('instructor_')) {
        // For user viewing instructor conversations
        const instructorId = conversationId.replace('instructor_', '');
        response = await chatAPI.getInstructorMessages(instructorId, page);
        setMessages(response.messages || []);
        setCurrentConversation(response.conversation);
      } else if (conversationId.startsWith('user_')) {
        // For instructor viewing user conversations
        const userId = conversationId.replace('user_', '');
        response = await chatAPI.getUserMessages(userId, page);
        setMessages(response.messages || []);
        setCurrentConversation(response.conversation);
      } else {
        // Regular conversation
        response = await chatAPI.getConversationMessages(conversationId, page);
        setMessages(response.messages || []);
        setCurrentConversation(response.conversation);
      }
      
      // Mark messages as read
      await markMessagesAsRead(conversationId);
      
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      console.log('Marking messages as read for conversation:', conversationId);
      if (conversationId.startsWith('instructor_')) {
        const instructorId = conversationId.replace('instructor_', '');
        console.log('Calling markInstructorMessagesAsRead with instructorId:', instructorId);
        const result = await chatAPI.markInstructorMessagesAsRead(instructorId);
        console.log('Mark instructor messages result:', result);
      } else if (conversationId.startsWith('user_')) {
        const userId = conversationId.replace('user_', '');
        console.log('Calling markUserMessagesAsRead with userId:', userId);
        const result = await chatAPI.markUserMessagesAsRead(userId);
        console.log('Mark user messages result:', result);
      } else {
        console.log('Calling markMessagesAsRead with conversationId:', conversationId);
        const result = await chatAPI.markMessagesAsRead(conversationId);
        console.log('Mark messages result:', result);
      }
      console.log('Messages marked as read successfully');
      
      // Refresh conversations to update unread counts
      await loadConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  // Send a text message
  const sendMessage = async (content) => {
    if (!currentConversation) return;

    try {
      console.log('Sending message:', content);
      console.log('Current conversation:', currentConversation);
      
      let newMessage;
      
      // Check if this is a grouped conversation
      if (currentConversation.id.startsWith('instructor_')) {
        // For grouped conversations, send to the most recent conversation
        const instructorId = currentConversation.id.replace('instructor_', '');
        console.log('Sending to instructor:', instructorId);
        newMessage = await chatAPI.sendMessageToInstructor(instructorId, content);
      } else if (currentConversation.id.startsWith('user_')) {
        // For instructor sending message to user
        const userId = currentConversation.id.replace('user_', '');
        console.log('Sending to user:', userId);
        newMessage = await chatAPI.sendMessageToUser(userId, content);
      } else {
        // Regular conversation
        console.log('Sending to regular conversation:', currentConversation.id);
        newMessage = await chatAPI.sendMessage(currentConversation.id, content);
      }
      
      console.log('New message received from API:', newMessage);
      
      // Add message to local state immediately for instant feedback
      setMessages(prev => {
        console.log('Adding message to local state, current messages count:', prev.length);
        return [...prev, newMessage];
      });
      
      // Update conversation list
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === currentConversation.id) {
            return {
              ...conv,
              last_message: newMessage,
              updated_at: new Date().toISOString()
            };
          }
          return conv;
        });
      });

      return newMessage;
    } catch (err) {
      setError(err.message);
      console.error('Error sending message:', err);
      console.error('Error details:', err.response?.data);
      throw err;
    }
  };

  // Send an image message
  const sendImageMessage = async (file) => {
    if (!currentConversation) return;

    try {
      let newMessage;
      
      // Check if this is a grouped conversation
      if (currentConversation.id.startsWith('instructor_')) {
        // For grouped conversations, send to the most recent conversation
        const instructorId = currentConversation.id.replace('instructor_', '');
        newMessage = await chatAPI.sendImageMessageToInstructor(instructorId, file);
      } else if (currentConversation.id.startsWith('user_')) {
        // For instructor sending image message to user
        const userId = currentConversation.id.replace('user_', '');
        newMessage = await chatAPI.sendImageMessageToUser(userId, file);
      } else {
        // Regular conversation
        newMessage = await chatAPI.sendImageMessage(currentConversation.id, file);
      }
      
      // Add message to local state
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation list
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === currentConversation.id) {
            return {
              ...conv,
              last_message: newMessage,
              updated_at: new Date().toISOString()
            };
          }
          return conv;
        });
      });

      return newMessage;
    } catch (err) {
      setError(err.message);
      console.error('Error sending image message:', err);
      throw err;
    }
  };

  // Create or get conversation for a course
  const getCourseConversation = async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      const conversation = await chatAPI.getCourseConversation(courseId);
      
      // Check if conversation already exists in list
      const existingIndex = conversations.findIndex(conv => conv.id === conversation.id);
      if (existingIndex >= 0) {
        setConversations(prev => {
          const updated = [...prev];
          updated[existingIndex] = conversation;
          return updated;
        });
      } else {
        setConversations(prev => [conversation, ...prev]);
      }
      
      setCurrentConversation(conversation);
      return conversation;
    } catch (err) {
      setError(err.message);
      console.error('Error getting course conversation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear current conversation
  const clearCurrentConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    sendImageMessage,
    getCourseConversation,
    clearCurrentConversation,
    setCurrentConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 