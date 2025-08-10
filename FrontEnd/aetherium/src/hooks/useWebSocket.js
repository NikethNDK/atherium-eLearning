import { useEffect } from 'react';
import websocketService from '../services/websocketService';

export const useWebSocket = (userId) => {
  useEffect(() => {
    if (!userId) {
      console.log('useWebSocket: No userId provided');
      return;
    }

    console.log(`useWebSocket: Connecting for user ${userId}`);
    
    // Connect to WebSocket when component mounts
    websocketService.connect(userId);

    // Cleanup when component unmounts
    return () => {
      console.log(`useWebSocket: Component unmounting for user ${userId}`);
      // Don't disconnect here as the service manages connections globally
      // The service will handle reconnection if needed
    };
  }, [userId]);

  // Global cleanup when app unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('useWebSocket: App unloading, disconnecting all');
      websocketService.disconnectAll();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    isConnected: (userId) => {
      const connected = websocketService.isConnected(userId);
      console.log(`useWebSocket: Connection status for user ${userId}:`, connected);
      return connected;
    },
    send: (userId, message) => websocketService.send(userId, message),
    onMessage: (userId, handler) => websocketService.onMessage(userId, handler),
    onTyping: (userId, handler) => websocketService.onTyping(userId, handler),
    removeMessageHandler: (userId) => websocketService.removeMessageHandler(userId),
    removeTypingHandler: (userId) => websocketService.removeTypingHandler(userId),
    getConnectedUsers: () => websocketService.getConnectedUsers()
  };
};
