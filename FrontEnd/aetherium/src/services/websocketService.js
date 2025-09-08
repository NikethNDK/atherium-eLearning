class WebSocketService {
  constructor() {
    this.connections = new Map(); // userId -> WebSocket
    this.messageHandlers = new Map(); // userId -> handler function
    this.typingHandlers = new Map(); // userId -> typing handler function
    this.baseWsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
    this.reconnectAttempts = new Map(); // userId -> reconnect count
    this.maxReconnectAttempts = 10; // Increased for production
    this.heartbeatInterval = null;
    this.heartbeatIntervalMs = 30000; // 30 seconds
    this.connectionTimeout = 10000; // 10 seconds
  }

  // Connect to WebSocket for a specific user
  connect(userId) {
    if (this.connections.has(userId)) {
      const ws = this.connections.get(userId);
      if (ws.readyState === WebSocket.OPEN) {
        console.log(`WebSocket already connected for user: ${userId}`);
        return;
      } else {
        // Clean up broken connection
        this.connections.delete(userId);
      }
    }

    // Determine WebSocket URL based on environment
    const isProduction = window.location.protocol === 'https:';
    const wsProtocol = isProduction ? 'wss:' : 'ws:';
    const wsHost = isProduction ? 'api.aetherium.wiki' : 'localhost:8000';
    const wsUrl = `${wsProtocol}//${wsHost}/ws/${userId}`;
    
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    
    // Set connection timeout
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        console.warn(`WebSocket connection timeout for user: ${userId}`);
        ws.close();
      }
    }, this.connectionTimeout);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for user: ${userId}`);
      clearTimeout(connectionTimeout);
      this.reconnectAttempts.set(userId, 0); // Reset reconnect attempts
      
      // Start heartbeat for this connection
      this.startHeartbeat(userId);
      
      // Send ping to verify connection
      ws.send(JSON.stringify({ type: 'ping' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`WebSocket message received for user ${userId}:`, data);
        
        if (data.type === 'pong') {
          console.log(`WebSocket pong received for user: ${userId}`);
          return;
        }
        
        if (data.type === 'chat_message') {
          const message = data.data || data;
          console.log(`Chat message for user ${userId}:`, message);
          
          // Call the message handler if registered
          const handler = this.messageHandlers.get(userId);
          if (handler) {
            handler(message);
          }
        }
        
        if (data.type === 'typing_start') {
          const typingData = data.data || data;
          console.log(`Typing start for user ${userId}:`, typingData);
          
          // Call the typing handler if registered
          const handler = this.typingHandlers.get(userId);
          if (handler) {
            handler({ type: 'typing_start', ...typingData });
          }
        }
        
        if (data.type === 'typing_stop') {
          const typingData = data.data || data;
          console.log(`Typing stop for user ${userId}:`, typingData);
          
          // Call the typing handler if registered
          const handler = this.typingHandlers.get(userId);
          if (handler) {
            handler({ type: 'typing_stop', ...typingData });
          }
        }
      } catch (error) {
        console.error(`WebSocket message error for user ${userId}:`, error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
    };

    ws.onclose = (event) => {
      console.log(`WebSocket disconnected for user: ${userId}, code: ${event.code}, reason: ${event.reason}`);
      clearTimeout(connectionTimeout);
      this.stopHeartbeat(userId);
      this.connections.delete(userId);
      
      // Only reconnect if it wasn't a manual disconnect
      if (event.code !== 1000) {
        const attempts = this.reconnectAttempts.get(userId) || 0;
        if (attempts < this.maxReconnectAttempts) {
          this.reconnectAttempts.set(userId, attempts + 1);
          const delay = Math.min(1000 * Math.pow(2, attempts), 30000); // Exponential backoff, max 30s
          console.log(`Attempting to reconnect for user ${userId} in ${delay}ms (attempt ${attempts + 1}/${this.maxReconnectAttempts})`);
          setTimeout(() => {
            this.connect(userId);
          }, delay);
        } else {
          console.error(`Max reconnect attempts reached for user ${userId}`);
          this.reconnectAttempts.delete(userId);
        }
      }
    };

    this.connections.set(userId, ws);
  }

  // Disconnect WebSocket for a specific user
  disconnect(userId) {
    const ws = this.connections.get(userId);
    if (ws) {
      console.log(`Disconnecting WebSocket for user: ${userId}`);
      ws.close(1000, 'Manual disconnect');
      this.connections.delete(userId);
      this.messageHandlers.delete(userId);
      this.typingHandlers.delete(userId);
      this.reconnectAttempts.delete(userId);
    }
  }

  // Register a message handler for a user
  onMessage(userId, handler) {
    this.messageHandlers.set(userId, handler);
  }

  // Register a typing handler for a user
  onTyping(userId, handler) {
    this.typingHandlers.set(userId, handler);
  }

  // Remove message handler for a user
  removeMessageHandler(userId) {
    this.messageHandlers.delete(userId);
  }

  // Remove typing handler for a user
  removeTypingHandler(userId) {
    this.typingHandlers.delete(userId);
  }

  // Send a message through WebSocket
  send(userId, message) {
    const ws = this.connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn(`WebSocket not connected for user: ${userId}`);
    }
  }

  // Send typing indicator
  sendTyping(userId, typingData) {
    const ws = this.connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'typing',
        data: typingData
      }));
    } else {
      console.warn(`WebSocket not connected for user: ${userId}`);
    }
  }

  // Check if WebSocket is connected for a user
  isConnected(userId) {
    const ws = this.connections.get(userId);
    return ws && ws.readyState === WebSocket.OPEN;
  }

  // Get all connected user IDs
  getConnectedUsers() {
    return Array.from(this.connections.keys());
  }

  // Disconnect all WebSocket connections
  disconnectAll() {
    console.log('Disconnecting all WebSocket connections');
    for (const [userId, ws] of this.connections) {
      ws.close(1000, 'App shutdown');
    }
    this.connections.clear();
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    this.reconnectAttempts.clear();
    this.stopAllHeartbeats();
  }

  // Start heartbeat for a specific user
  startHeartbeat(userId) {
    this.stopHeartbeat(userId); // Clear any existing heartbeat
    
    this.heartbeatInterval = setInterval(() => {
      const ws = this.connections.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log(`Sending heartbeat for user: ${userId}`);
        ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        console.warn(`WebSocket not open for user ${userId}, stopping heartbeat`);
        this.stopHeartbeat(userId);
      }
    }, this.heartbeatIntervalMs);
  }

  // Stop heartbeat for a specific user
  stopHeartbeat(userId) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Stop all heartbeats
  stopAllHeartbeats() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
