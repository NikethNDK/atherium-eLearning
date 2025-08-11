import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { chatAPI } from '../services/api.js';

const ChatContext = createContext();

/**
 * ChatContext with comprehensive debugging and WebSocket message handling fixes
 * 
 * Key fixes implemented:
 * 1. ✅ Fixed stale closure issue using currentConversationRef
 * 2. ✅ Added comprehensive debugging for WebSocket message handling
 * 3. ✅ Improved conversation matching logic for grouped conversations
 * 4. ✅ Added additional checks for sent messages in grouped conversations
 * 5. ✅ Enhanced error handling and logging
 * 
 * Debug features:
 * - 🔍 WebSocket message logging
 * - 📨 Message processing details
 * - 🎯 Conversation matching logic
 * - 🔄 State update tracking
 * - 📊 Message count tracking
 * 
 * To debug issues:
 * 1. Open browser console
 * 2. Look for emoji-prefixed log messages
 * 3. Use debugState() function to check current state
 */
export const ChatProvider = ({ children, userId }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const wsRef = useRef(null);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const baseWsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
  const currentConversationRef = useRef(null);

  // Keep ref in sync with currentConversation state
  useEffect(() => {
    currentConversationRef.current = currentConversation;
    console.log('🔄 Current conversation ref updated:', currentConversation?.id);
  }, [currentConversation]);

  // WebSocket connection
  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`${baseWsUrl}/ws/${userId}`);
      
      ws.onopen = () => {
        console.log('Chat WebSocket connected for user:', userId);
        // Send ping to verify connection
        ws.send(JSON.stringify({ type: 'ping' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🔍 WebSocket message received:', data);
          
          if (data.type === 'chat_message') {
            const message = data.data || data; // Handle both formats
            console.log('📨 Processing chat message:', {
              messageId: message.id,
              senderId: message.sender_id,
              conversationId: message.conversation_id,
              content: message.content?.substring(0, 50) + '...',
              currentConversationId: currentConversation?.id,
              currentConversationType: currentConversation?.id?.startsWith('instructor_') ? 'instructor_grouped' : 
                                     currentConversation?.id?.startsWith('user_') ? 'user_grouped' : 'regular'
            });
            
            // Always update the conversations list first
            setConversations(prevConvs => {
              console.log('🔄 Updating conversations list, current conversations:', prevConvs.map(c => ({ id: c.id, type: c.id?.startsWith('instructor_') ? 'instructor_grouped' : c.id?.startsWith('user_') ? 'user_grouped' : 'regular' })));
              
              return prevConvs.map(conv => {
                // Check if this message belongs to this conversation
                let isRelevant = false;
                let relevanceReason = '';
                
                if (conv.id.startsWith('instructor_')) {
                  // For instructor grouped conversations, check if message is from this instructor
                  const instructorId = parseInt(conv.id.replace('instructor_', ''));
                  isRelevant = message.sender_id === instructorId;
                  relevanceReason = `instructor_grouped: message.sender_id(${message.sender_id}) === instructorId(${instructorId})`;
                } else if (conv.id.startsWith('user_')) {
                  // For user grouped conversations, check if message is from this user
                  const userId = parseInt(conv.id.replace('user_', ''));
                  isRelevant = message.sender_id === userId;
                  relevanceReason = `user_grouped: message.sender_id(${message.sender_id}) === userId(${userId})`;
                } else {
                  // For regular conversations, check exact conversation ID match
                  isRelevant = conv.id === message.conversation_id?.toString();
                  relevanceReason = `regular: conv.id(${conv.id}) === message.conversation_id(${message.conversation_id})`;
                }
                
                console.log(`🔍 Checking conversation ${conv.id}: ${relevanceReason} = ${isRelevant}`);
                
                if (isRelevant) {
                  console.log(`✅ Updating conversation ${conv.id} with new message`);
                  const currentConv = currentConversationRef.current;
                  return {
                    ...conv,
                    last_message: message,
                    updated_at: new Date().toISOString(),
                    unread_count: conv.id === currentConv?.id ? 
                      conv.unread_count : 
                      (conv.unread_count + 1)
                  };
                }
                return conv;
              });
            });

            // Then update the messages if we're in the relevant conversation
            setMessages(prevMessages => {
              const currentConv = currentConversationRef.current;
              console.log('🔄 Checking if message should be added to current conversation');
              console.log('📊 Current messages count:', prevMessages.length);
              console.log('🎯 Current conversation:', {
                id: currentConv?.id,
                type: currentConv?.id?.startsWith('instructor_') ? 'instructor_grouped' : 
                      currentConv?.id?.startsWith('user_') ? 'user_grouped' : 'regular'
              });
              
              // Check if we're in the right conversation
              let isCurrentConv = false;
              let currentConvReason = '';
              
              if (currentConv?.id?.startsWith('instructor_')) {
                // For user viewing instructor conversations
                const instructorId = parseInt(currentConv.id.replace('instructor_', ''));
                // Check if message is from this instructor (regardless of which specific conversation)
                isCurrentConv = message.sender_id === instructorId;
                currentConvReason = `instructor_grouped: message.sender_id(${message.sender_id}) === instructorId(${instructorId})`;
              } else if (currentConv?.id?.startsWith('user_')) {
                // For instructor viewing user conversations  
                const userId = parseInt(currentConv.id.replace('user_', ''));
                // Check if message is from this user (regardless of which specific conversation)
                isCurrentConv = message.sender_id === userId;
                currentConvReason = `user_grouped: message.sender_id(${message.sender_id}) === userId(${userId})`;
              } else {
                // For regular conversation, check exact conversation ID match
                isCurrentConv = currentConv?.id === message.conversation_id?.toString();
                currentConvReason = `regular: currentConversation.id(${currentConv?.id}) === message.conversation_id(${message.conversation_id})`;
              }
              
              console.log(`🎯 Current conversation check: ${currentConvReason} = ${isCurrentConv}`);
              
              // Additional check: if the message is from the current user and we're in a grouped conversation,
              // we should also show it (for sent messages)
              if (!isCurrentConv && currentConv?.id?.startsWith('instructor_')) {
                const instructorId = parseInt(currentConv.id.replace('instructor_', ''));
                if (message.sender_id === userId) { // userId is the current user
                  isCurrentConv = true;
                  currentConvReason = `instructor_grouped_sent: message.sender_id(${message.sender_id}) === currentUserId(${userId})`;
                  console.log(`🎯 Additional check for sent message: ${currentConvReason} = ${isCurrentConv}`);
                }
              } else if (!isCurrentConv && currentConv?.id?.startsWith('user_')) {
                const userIdFromConv = parseInt(currentConv.id.replace('user_', ''));
                if (message.sender_id === userId) { // userId is the current user (instructor)
                  isCurrentConv = true;
                  currentConvReason = `user_grouped_sent: message.sender_id(${message.sender_id}) === currentUserId(${userId})`;
                  console.log(`🎯 Additional check for sent message: ${currentConvReason} = ${isCurrentConv}`);
                }
              }
              
              // Check if message already exists to prevent duplicates
              const messageExists = prevMessages.some(m => m.id === message.id);
              console.log(`🔍 Message already exists: ${messageExists} (message.id: ${message.id})`);

              if (isCurrentConv && !messageExists) {
                console.log('✅ Adding message to current conversation');
                // Add the new message to the end of the list
                const updatedMessages = [...prevMessages, message];
                console.log(`📊 Messages updated: ${prevMessages.length} → ${updatedMessages.length}`);
                return updatedMessages;
              } else if (isCurrentConv && messageExists) {
                console.log('⚠️ Message already exists in current conversation, skipping');
              } else {
                console.log('❌ Message not relevant to current conversation');
              }
              
              return prevMessages;
            });
          } else if (data.type === 'typing_start' || data.type === 'typing_stop') {
            // Handle typing indicators
            const typingData = data.data || data;
            console.log(`⌨️ Typing indicator received: ${data.type}`, typingData);
            
            if (data.type === 'typing_start') {
              setTypingUsers(prev => new Set([...prev, typingData.sender_id]));
            } else if (data.type === 'typing_stop') {
              setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(typingData.sender_id);
                return newSet;
              });
            }
          }
        } catch (error) {
          console.error('❌ WebSocket message error:', error);
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
  }, [userId, baseWsUrl]);

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
      console.log('🔄 Loading messages for conversation:', {
        conversationId,
        page,
        type: conversationId?.startsWith('instructor_') ? 'instructor_grouped' : 
              conversationId?.startsWith('user_') ? 'user_grouped' : 'regular'
      });
      
      setLoading(true);
      let response;
      
      if (conversationId.startsWith('instructor_')) {
        // For user viewing instructor conversations
        const instructorId = conversationId.replace('instructor_', '');
        console.log('👨‍🏫 Loading instructor messages for instructor ID:', instructorId);
        response = await chatAPI.getInstructorMessages(instructorId, page);
        
        // Merge with existing messages to prevent loss
        setMessages(prevMessages => {
          const newMessages = response.messages || [];
          console.log(`📊 Loading instructor messages: existing=${prevMessages.length}, new=${newMessages.length}`);
          
          // If this is a fresh load (page 1), replace messages
          if (page === 1) {
            console.log('🔄 Fresh load: replacing messages');
            return newMessages;
          } else {
            // If pagination, append new messages
            console.log('🔄 Pagination: appending messages');
            const combined = [...prevMessages, ...newMessages];
            // Remove duplicates based on message ID
            const uniqueMessages = combined.filter((message, index, self) => 
              index === self.findIndex(m => m.id === message.id)
            );
            console.log(`📊 Combined messages: ${combined.length} → unique: ${uniqueMessages.length}`);
            return uniqueMessages;
          }
        });
        
        setCurrentConversation(response.conversation);
        console.log('✅ Instructor messages loaded:', {
          messageCount: response.messages?.length || 0,
          conversation: response.conversation
        });
      } else if (conversationId.startsWith('user_')) {
        // For instructor viewing user conversations
        const userId = conversationId.replace('user_', '');
        console.log('👤 Loading user messages for user ID:', userId);
        response = await chatAPI.getUserMessages(userId, page);
        
        // Merge with existing messages to prevent loss
        setMessages(prevMessages => {
          const newMessages = response.messages || [];
          console.log(`📊 Loading user messages: existing=${prevMessages.length}, new=${newMessages.length}`);
          
          // If this is a fresh load (page 1), replace messages
          if (page === 1) {
            console.log('🔄 Fresh load: replacing messages');
            return newMessages;
          } else {
            // If pagination, append new messages
            console.log('🔄 Pagination: appending messages');
            const combined = [...prevMessages, ...newMessages];
            // Remove duplicates based on message ID
            const uniqueMessages = combined.filter((message, index, self) => 
              index === self.findIndex(m => m.id === message.id)
            );
            console.log(`📊 Combined messages: ${combined.length} → unique: ${uniqueMessages.length}`);
            return uniqueMessages;
          }
        });
        
        setCurrentConversation(response.conversation);
        console.log('✅ User messages loaded:', {
          messageCount: response.messages?.length || 0,
          conversation: response.conversation
        });
      } else {
        // Regular conversation
        console.log('💬 Loading regular conversation messages for ID:', conversationId);
        response = await chatAPI.getConversationMessages(conversationId, page);
        
        // Merge with existing messages to prevent loss
        setMessages(prevMessages => {
          const newMessages = response.messages || [];
          console.log(`📊 Loading regular messages: existing=${prevMessages.length}, new=${newMessages.length}`);
          
          // If this is a fresh load (page 1), replace messages
          if (page === 1) {
            console.log('🔄 Fresh load: replacing messages');
            return newMessages;
          } else {
            // If pagination, append new messages
            console.log('🔄 Pagination: appending messages');
            const combined = [...prevMessages, ...newMessages];
            // Remove duplicates based on message ID
            const uniqueMessages = combined.filter((message, index, self) => 
              index === self.findIndex(m => m.id === message.id)
            );
            console.log(`📊 Combined messages: ${combined.length} → unique: ${uniqueMessages.length}`);
            return uniqueMessages;
          }
        });
        
        setCurrentConversation(response.conversation);
        console.log('✅ Regular conversation messages loaded:', {
          messageCount: response.messages?.length || 0,
          conversation: response.conversation
        });
      }
      
      // Mark messages as read
      await markMessagesAsRead(conversationId);
      
    } catch (error) {
      console.error('❌ Error loading messages:', error);
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
        console.log('currentconvo',currentConversation)

  // Send a message
  const sendMessage = async (content) => {
    try {
      console.log('📤 Sending message:', {
        content: content.substring(0, 50) + '...',
        currentConversation: currentConversation?.id,
        conversationType: currentConversation?.id?.startsWith('instructor_') ? 'instructor_grouped' : 
                         currentConversation?.id?.startsWith('user_') ? 'user_grouped' : 'regular'
      });
      
      setError(null);
      let newMessage;

      if (currentConversation.id.startsWith('instructor_')) {
        // For user sending message to instructor
        const instructorId = currentConversation.id.replace('instructor_', '');
        console.log('👨‍🏫 Sending message to instructor:', instructorId);
        newMessage = await chatAPI.sendMessageToInstructor(instructorId, content);
      } else if (currentConversation.id.startsWith('user_')) {
        // For instructor sending message to user
        const userId = currentConversation.id.replace('user_', '');
        console.log('👤 Sending message to user:', userId);
        newMessage = await chatAPI.sendMessageToUser(userId, content);
      } else {
        // Regular conversation
        console.log('💬 Sending message to regular conversation:', currentConversation.id);
        newMessage = await chatAPI.sendMessage({
          conversation_id: currentConversation.id,
          content: content,
          message_type: "text"
        });
      }
      
      console.log('✅ Message sent successfully:', newMessage);
      
      // Add message to local state
      setMessages(prev => {
        console.log('🔄 Adding message to local state, current count:', prev.length);
        return [...prev, newMessage];
      });
      
      // Update conversation list
      setConversations(prev => {
        console.log('🔄 Updating conversation list with new message');
        return prev.map(conv => {
          if (conv.id === currentConversation.id) {
            console.log('✅ Updating conversation in list:', conv.id);
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
      console.error('❌ Error sending message:', err);
      setError(err.message);
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

  // Handle conversation reopening
  const reopenConversation = async (conversationId) => {
    try {
      console.log('🔄 Reopening conversation:', conversationId);
      
      // Clear current messages to prevent mixing with old messages
      setMessages([]);
      
      // Load messages for the conversation
      await loadMessages(conversationId, 1);
      
      console.log('✅ Conversation reopened successfully');
    } catch (error) {
      console.error('❌ Error reopening conversation:', error);
    }
  };

  // Clear current conversation
  const clearCurrentConversation = () => {
    setCurrentConversation(null);
    // Don't clear messages - this was causing the message loss issue
    // setMessages([]); // ❌ REMOVED: This was clearing all messages when closing conversation
  };

  // Send typing indicator
  const sendTypingIndicator = async (action, recipientId, conversationId) => {
    try {
      console.log(`Sending typing indicator: ${action} to recipient ${recipientId} for conversation ${conversationId}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/chat/typing/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipient_id: recipientId,
          conversation_id: conversationId
        })
      });
      
      if (!response.ok) {
        console.error(`Failed to send typing indicator: ${response.statusText}`);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      } else {
        console.log(`Typing indicator ${action} sent successfully to user ${recipientId}`);
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  };

  // Start typing indicator
  const startTyping = (recipientId, conversationId) => {
    sendTypingIndicator('start', recipientId, conversationId);
  };

  // Stop typing indicator
  const stopTyping = (recipientId, conversationId) => {
    sendTypingIndicator('stop', recipientId, conversationId);
  };

  // Debug function to log current state
  const debugState = () => {
    console.log('🔍 Current Chat State:', {
      userId,
      currentConversation: {
        id: currentConversation?.id,
        type: currentConversation?.id?.startsWith('instructor_') ? 'instructor_grouped' : 
              currentConversation?.id?.startsWith('user_') ? 'user_grouped' : 'regular',
        user_id: currentConversation?.user_id,
        instructor_id: currentConversation?.instructor_id
      },
      messagesCount: messages.length,
      conversationsCount: conversations.length,
      typingUsers: Array.from(typingUsers),
      loading,
      error
    });
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
    reopenConversation, // Added for better conversation management
    setCurrentConversation: (conversation) => {
      console.log('🔄 Setting current conversation:', {
        id: conversation?.id,
        type: conversation?.id?.startsWith('instructor_') ? 'instructor_grouped' : 
              conversation?.id?.startsWith('user_') ? 'user_grouped' : 'regular',
        user_id: conversation?.user_id,
        instructor_id: conversation?.instructor_id
      });
      
      // If switching to a different conversation, clear messages first
      if (currentConversation?.id !== conversation?.id) {
        console.log('🔄 Switching conversations, clearing messages for fresh load');
        setMessages([]); // Clear messages when switching conversations
      }
      
      setCurrentConversation(conversation);
    },
    startTyping,
    stopTyping,
    typingUsers,
    debugState
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