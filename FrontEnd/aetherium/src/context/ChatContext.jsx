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
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const baseWsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
  const currentConversationRef = useRef(null);
  const syncInProgressRef = useRef(false);

  // Keep ref in sync with currentConversation state
  useEffect(() => {
    currentConversationRef.current = currentConversation;
    console.log('🔄 Current conversation ref updated:', currentConversation?.id);
  }, [currentConversation?.id]);

  // Load all messages for a conversation (no pagination limit)
  const loadAllMessages = async (conversationId) => {
    try {
      console.log('🔄 Loading all messages for conversation:', conversationId);
      await loadMessages(conversationId, 1, 1000); // Load with large limit
    } catch (error) {
      console.error('❌ Error loading all messages:', error);
    }
  };

  // Sync WebSocket messages with database to ensure persistence
  const syncWebSocketMessages = async () => {
    if (!currentConversation?.id) return;
    
    // Prevent multiple simultaneous syncs
    if (syncInProgressRef.current) {
      console.log('⏳ Skipping sync - sync already in progress');
      return;
    }
    
    if (loading) {
      console.log('⏳ Skipping sync - already loading messages');
      return;
    }
    
    try {
      syncInProgressRef.current = true;
      console.log('🔄 Syncing WebSocket messages with database for conversation:', currentConversation.id);
      
      // Reload messages from database to ensure we have the latest
      await loadAllMessages(currentConversation.id);
      
      console.log('✅ WebSocket messages synced with database');
    } catch (error) {
      console.error('❌ Error syncing WebSocket messages:', error);
    } finally {
      syncInProgressRef.current = false;
    }
  };

  // Auto-sync WebSocket messages when conversation changes
  useEffect(() => {
    if (currentConversation?.id && !loading && !syncInProgressRef.current) {
      console.log('🔄 Auto-sync triggered for conversation:', currentConversation.id);
      
      // Prevent multiple auto-syncs for the same conversation
      const syncKey = `${currentConversation.id}_${Date.now()}`;
      console.log('🔑 Sync key:', syncKey);
      
      // Small delay to ensure WebSocket is ready
      const syncTimer = setTimeout(() => {
        syncWebSocketMessages();
      }, 1000);
      
      return () => clearTimeout(syncTimer);
    }
  }, [currentConversation?.id]); // Removed loading dependency to prevent infinite loops

  // Load conversations list
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
  const loadMessages = async (conversationId, page = 1, limit = 20) => {
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
        
        try {
          response = await chatAPI.getInstructorMessages(instructorId, page, limit);
        } catch (error) {
          console.error('❌ Error fetching instructor messages:', error);
          if (error.response?.status === 422) {
            console.error('❌ Validation error - instructor ID might be invalid:', instructorId);
            setError('Invalid instructor ID. Please refresh and try again.');
          } else {
            setError('Failed to load messages. Please try again.');
          }
          return;
        }
        
        // Merge with existing messages to prevent loss
        setMessages(prevMessages => {
          const newMessages = response.messages || [];
          console.log(`📊 Loading instructor messages: existing=${prevMessages.length}, new=${newMessages.length}`);
          
          // If this is a fresh load (page 1), replace messages
          if (page === 1) {
            console.log('🔄 Fresh load: replacing messages');
            // Reverse the messages since backend returns newest first, but we want oldest first for display
            const reversedMessages = [...newMessages].reverse();
            console.log(`📊 Reversed messages for display: ${newMessages.length} → ${reversedMessages.length}`);
            return reversedMessages;
          } else {
            // If pagination, prepend older messages (since backend returns newest first)
            console.log('🔄 Pagination: prepending older messages');
            const combined = [...newMessages, ...prevMessages];
            // Remove duplicates based on message ID
            const uniqueMessages = combined.filter((message, index, self) => 
              index === self.findIndex(m => m.id === message.id)
            );
            console.log(`📊 Combined messages: ${combined.length} → unique: ${uniqueMessages.length}`);
            return uniqueMessages;
          }
        });
        
        console.log('✅ Instructor messages loaded:', {
          messageCount: response.messages?.length || 0,
          conversation: response.conversation
        });
      } else if (conversationId.startsWith('user_')) {
        // For instructor viewing user conversations
        const userId = conversationId.replace('user_', '');
        console.log('👤 Loading user messages for user ID:', userId);
        
        try {
          response = await chatAPI.getUserMessages(userId, page, limit);
        } catch (error) {
          console.error('❌ Error fetching user messages:', error);
          if (error.response?.status === 422) {
            console.error('❌ Validation error - user ID might be invalid:', userId);
            setError('Invalid user ID. Please refresh and try again.');
          } else {
            setError('Failed to load messages. Please try again.');
          }
          return;
        }
        
        // Merge with existing messages to prevent loss
        setMessages(prevMessages => {
          const newMessages = response.messages || [];
          console.log(`📊 Loading user messages: existing=${prevMessages.length}, new=${newMessages.length}`);
          
          // If this is a fresh load (page 1), replace messages
          if (page === 1) {
            console.log('🔄 Fresh load: replacing messages');
            // Reverse the messages since backend returns newest first, but we want oldest first for display
            const reversedMessages = [...newMessages].reverse();
            console.log(`📊 Reversed messages for display: ${newMessages.length} → ${reversedMessages.length}`);
            return reversedMessages;
          } else {
            // If pagination, prepend older messages (since backend returns newest first)
            console.log('🔄 Pagination: prepending older messages');
            const combined = [...newMessages, ...prevMessages];
            // Remove duplicates based on message ID
            const uniqueMessages = combined.filter((message, index, self) => 
              index === self.findIndex(m => m.id === message.id)
            );
            console.log(`📊 Combined messages: ${combined.length} → unique: ${uniqueMessages.length}`);
            return uniqueMessages;
          }
        });
        
        console.log('✅ User messages loaded:', {
          messageCount: response.messages?.length || 0,
          conversation: response.conversation
        });
      } else {
        // Regular conversation
        console.log('💬 Loading regular conversation messages for ID:', conversationId);
        
        try {
          response = await chatAPI.getConversationMessages(conversationId, page, limit);
        } catch (error) {
          console.error('❌ Error fetching conversation messages:', error);
          if (error.response?.status === 422) {
            console.error('❌ Validation error - conversation ID might be invalid:', conversationId);
            setError('Invalid conversation ID. Please refresh and try again.');
          } else {
            setError('Failed to load messages. Please try again.');
          }
          return;
        }
        
        // Merge with existing messages to prevent loss
        setMessages(prevMessages => {
          const newMessages = response.messages || [];
          console.log(`📊 Loading regular messages: existing=${prevMessages.length}, new=${newMessages.length}`);
          
          // If this is a fresh load (page 1), replace messages
          if (page === 1) {
            console.log('🔄 Fresh load: replacing messages');
            // Reverse the messages since backend returns newest first, but we want oldest first for display
            const reversedMessages = [...newMessages].reverse();
            console.log(`📊 Reversed messages for display: ${newMessages.length} → ${reversedMessages.length}`);
            return reversedMessages;
          } else {
            // If pagination, prepend older messages (since backend returns newest first)
            console.log('🔄 Pagination: prepending older messages');
            const combined = [...newMessages, ...prevMessages];
            // Remove duplicates based on message ID
            const uniqueMessages = combined.filter((message, index, self) => 
              index === self.findIndex(m => m.id === message.id)
            );
            console.log(`📊 Combined messages: ${combined.length} → unique: ${uniqueMessages.length}`);
            return uniqueMessages;
          }
        });
        
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

  // Enhanced WebSocket message handling with persistence
  const handleWebSocketMessage = (message) => {
    console.log('📨 Processing WebSocket message:', {
      messageId: message.id,
      senderId: message.sender_id,
      conversationId: message.conversation_id,
      content: message.content?.substring(0, 50) + '...',
      currentConversationId: currentConversation?.id,
      currentUserId: userId,
      messageType: message.message_type
    });
      
      // Always update the conversations list first
      setConversations(prevConvs => {
        return prevConvs.map(conv => {
        let isRelevant = false;
        
        if (conv.id.startsWith('instructor_')) {
          const instructorId = parseInt(conv.id.replace('instructor_', ''));
          isRelevant = message.sender_id === instructorId;
          console.log('👨‍🏫 Conversation relevance check:', {
            convId: conv.id,
            instructorId,
            messageSenderId: message.sender_id,
            isRelevant
          });
        } else if (conv.id.startsWith('user_')) {
          const userIdFromConv = parseInt(conv.id.replace('user_', ''));
          isRelevant = message.sender_id === userIdFromConv;
          console.log('👤 Conversation relevance check:', {
            convId: conv.id,
            userIdFromConv,
            messageSenderId: message.sender_id,
            isRelevant
          });
        } else {
          isRelevant = conv.id === message.conversation_id?.toString();
          console.log('💬 Regular conversation relevance check:', {
            convId: conv.id,
            messageConversationId: message.conversation_id,
            isRelevant
          });
        }
          
          if (isRelevant) {
            console.log('✅ Updating conversation in list:', conv.id);
            return {
              ...conv,
              last_message: message,
              updated_at: new Date().toISOString(),
              unread_count: conv.id === currentConversation?.id ? 
                conv.unread_count : 
                (conv.unread_count + 1)
            };
          }
          return conv;
        });
      });

    // Update messages if we're in the relevant conversation
      setMessages(prevMessages => {
      const currentConv = currentConversationRef.current;
      let isCurrentConv = false;
      
      if (currentConv?.id?.startsWith('instructor_')) {
        // For student viewing instructor conversations
        const instructorId = parseInt(currentConv.id.replace('instructor_', ''));
        // Student should receive messages from instructor OR messages they sent themselves
        isCurrentConv = message.sender_id === instructorId || message.sender_id === userId;
        console.log('👨‍🏫 Student conversation check:', {
          instructorId,
          messageSenderId: message.sender_id,
          currentUserId: userId,
          isCurrentConv
        });
      } else if (currentConv?.id?.startsWith('user_')) {
        // For instructor viewing user conversations
        const userIdFromConv = parseInt(currentConv.id.replace('user_', ''));
        // Instructor should receive messages from user OR messages they sent themselves
        isCurrentConv = message.sender_id === userIdFromConv || message.sender_id === userId;
        console.log('👤 Instructor conversation check:', {
          userIdFromConv,
          messageSenderId: message.sender_id,
          currentUserId: userId,
          isCurrentConv
        });
      } else {
        // Regular conversation
        isCurrentConv = currentConv?.id === message.conversation_id?.toString();
        console.log('💬 Regular conversation check:', {
          conversationId: currentConv?.id,
          messageConversationId: message.conversation_id,
          isCurrentConv
        });
      }
      
      const messageExists = prevMessages.some(m => m.id === message.id);
      
      if (isCurrentConv && !messageExists) {
        console.log('✅ Adding WebSocket message to current conversation');
        return [...prevMessages, message];
      }
      
      console.log('❌ Message not added to current conversation:', {
        isCurrentConv,
        messageExists,
        messageId: message.id,
        currentConversationId: currentConv?.id
      });
      
        return prevMessages;
      });
  };

  // WebSocket connection
  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`${baseWsUrl}/ws/${userId}`);
      
      ws.onopen = () => {
        console.log('Chat WebSocket connected for user:', userId);
        setIsConnected(true);
        // Send ping to verify connection
        ws.send(JSON.stringify({ type: 'ping' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🔍 WebSocket message received:', data);
          
          if (data.type === 'chat_message') {
            const message = data.data || data;
            handleWebSocketMessage(message);
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
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('Chat WebSocket disconnected');
        setIsConnected(false);
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

  // Mark messages as read
  const markMessagesAsRead = async (conversationId) => {
    try {
      console.log('📖 Marking messages as read for conversation:', conversationId);
      
      let result;
      if (conversationId.startsWith('instructor_')) {
        const instructorId = conversationId.replace('instructor_', '');
        console.log('👨‍🏫 Calling markInstructorMessagesAsRead with instructorId:', instructorId);
        result = await chatAPI.markInstructorMessagesAsRead(instructorId);
        console.log('✅ Mark instructor messages result:', result);
      } else if (conversationId.startsWith('user_')) {
        const userId = conversationId.replace('user_', '');
        console.log('👤 Calling markUserMessagesAsRead with userId:', userId);
        result = await chatAPI.markUserMessagesAsRead(userId);
        console.log('✅ Mark user messages result:', result);
      } else {
        console.log('💬 Calling markMessagesAsRead with conversationId:', conversationId);
        result = await chatAPI.markMessagesAsRead(conversationId);
        console.log('✅ Mark messages result:', result);
      }
      
      console.log('✅ Messages marked as read successfully');
      
      // Update local state immediately instead of reloading all conversations
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            console.log('🔄 Updating local conversation unread count to 0:', conv.id);
            return {
              ...conv,
              unread_count: 0
            };
          }
          return conv;
        });
      });
      
      // Also update current messages to mark them as read
      setMessages(prev => {
        return prev.map(msg => ({
          ...msg,
          is_read: true
        }));
      });
      
      console.log('✅ Local state updated - notifications cleared');
      
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      console.error('Error details:', error.response?.data);
    }
  };

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
    if (!currentConversation) {
      console.log('❌ No current conversation for image upload');
      return;
    }

    try {
      console.log('📸 ChatContext: Starting image upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        conversationId: currentConversation.id,
        conversationType: currentConversation.id?.startsWith('instructor_') ? 'instructor_grouped' : 
                         currentConversation.id?.startsWith('user_') ? 'user_grouped' : 'regular'
      });
      
      let newMessage;
      
      // Check if this is a grouped conversation
      if (currentConversation.id.startsWith('instructor_')) {
        // For grouped conversations, send to the most recent conversation
        const instructorId = currentConversation.id.replace('instructor_', '');
        console.log('👨‍🏫 Sending image to instructor:', instructorId);
        newMessage = await chatAPI.sendImageMessageToInstructor(instructorId, file);
      } else if (currentConversation.id.startsWith('user_')) {
        // For instructor sending image message to user
        const userId = currentConversation.id.replace('user_', '');
        console.log('👤 Sending image to user:', userId);
        newMessage = await chatAPI.sendImageMessageToUser(userId, file);
      } else {
        // Regular conversation
        console.log('💬 Sending image to regular conversation:', currentConversation.id);
        newMessage = await chatAPI.sendImageMessage(currentConversation.id, file);
      }
      
      console.log('✅ ChatContext: Image message created:', newMessage);
      
      // Validate the image message format
      if (!newMessage || !newMessage.id || !newMessage.content) {
        console.error('❌ Invalid image message format:', newMessage);
        throw new Error('Invalid image message format received from server');
      }
      
      // Ensure message_type is set to 'image'
      if (newMessage.message_type !== 'image') {
        console.warn('⚠️ Image message type not set correctly, fixing...');
        newMessage.message_type = 'image';
      }
      
      console.log('✅ Image message validated:', {
        id: newMessage.id,
        content: newMessage.content,
        message_type: newMessage.message_type,
        sender_id: newMessage.sender_id
      });
      
      // Add message to local state
      setMessages(prev => {
        console.log('🔄 Adding image message to local state, current count:', prev.length);
        return [...prev, newMessage];
      });
      
      // Update conversation list
      setConversations(prev => {
        console.log('🔄 Updating conversation list with new image message');
        return prev.map(conv => {
          if (conv.id === currentConversation.id) {
            console.log('✅ Updating conversation in list with image:', conv.id);
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
      console.error('❌ ChatContext: Error sending image message:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload image. ';
      if (err.response?.status === 413) {
        errorMessage += 'File is too large. Please select a smaller image.';
      } else if (err.response?.status === 415) {
        errorMessage += 'Invalid file type. Please select an image file.';
      } else if (err.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (err.response?.status === 401) {
        errorMessage += 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage += 'Permission denied. You cannot send messages to this conversation.';
      } else if (err.response?.status === 404) {
        errorMessage += 'Conversation not found. Please refresh and try again.';
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      console.error('❌ Detailed error info:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      setError(errorMessage);
      throw new Error(errorMessage);
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
      
      // Load ALL messages for the conversation to ensure nothing is missed
      await loadAllMessages(conversationId);
      
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
    isConnected,
    loadConversations,
    loadMessages,
    loadAllMessages, // Added for loading all messages
    syncWebSocketMessages, // Added for syncing WebSocket messages with database
    sendMessage,
    sendImageMessage,
    getCourseConversation,
    clearCurrentConversation,
    reopenConversation, // Added for better conversation management
    setCurrentConversation: (conversation) => {
      console.log('🔄 Setting current conversation:', {
        from: currentConversation?.id,
        to: conversation?.id,
        isSame: currentConversation?.id === conversation?.id
      });
      
      if (currentConversation?.id !== conversation?.id) {
        console.log('🔄 Switching to different conversation, clearing messages');
        setMessages([]); // Clear messages when switching conversations
      }
      
      // Mark messages as read when opening a conversation
      if (conversation?.id) {
        console.log('📖 Auto-marking messages as read for conversation:', conversation.id);
        // Use setTimeout to avoid blocking the UI update
        setTimeout(() => {
          markMessagesAsRead(conversation.id);
        }, 100);
      }
      
      setCurrentConversation(conversation);
    },
    markMessagesAsRead,
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