// socketService.js
// Enhanced socket service with real-time read receipts and notifications

class MockSocket {
  constructor() {
    this.listeners = new Map();
    this.isConnected = false;
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  off(event, handler) {
    if (this.listeners.has(event)) {
      const handlers = this.listeners.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, -1);
      }
    }
  }

  emit(event, data) {
    // Simulate server responses for testing
    if (event === 'message:read') {
      setTimeout(() => {
        this.triggerEvent('message:read-update', {
          messageId: data.messageId,
          chatId: data.chatId,
          userId: data.userId,
          readBy: [{ user: data.userId, readAt: new Date() }]
        });
      }, 100);
    }
    
    if (event === 'chat:read') {
      setTimeout(() => {
        this.triggerEvent('chat:read-update', {
          chatId: data.chatId,
          userId: data.userId,
          count: 0
        });
      }, 100);
    }

    if (event === 'group:update') {
      setTimeout(() => {
        this.triggerEvent('group:update', {
          chatId: data.chatId,
          updateType: data.updateType,
          data: data.data
        });
      }, 100);
    }
  }

  triggerEvent(event, data) {
    if (this.listeners.has(event)) {
      const handlers = this.listeners.get(event);
      handlers.forEach(handler => handler(data));
    }
  }

  disconnect() {
    this.listeners.clear();
    this.isConnected = false;
  }
}

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }
    
    this.socket = new MockSocket();
    this.isConnected = true;

    // Simulate connection events
    setTimeout(() => {
      this.isConnected = true;
    }, 100);

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }

  // Enhanced method to simulate receiving a message (for testing)
  simulateMessage(message) {
    if (this.socket && this.socket.listeners.has('message:new')) {
      const handlers = this.socket.listeners.get('message:new');
      handlers.forEach(handler => handler(message));
    }
  }

  // Method to mark message as read via socket
  markMessageAsRead(messageId, chatId) {
    if (this.socket) {
      this.socket.emit('message:read', { messageId, chatId });
    }
  }

  // Method to mark chat as read via socket
  markChatAsRead(chatId) {
    if (this.socket) {
      this.socket.emit('chat:read', { chatId });
    }
  }

  // Method to listen for read receipt updates
  onReadReceiptUpdate(handler) {
    if (this.socket) {
      this.socket.on('message:read-update', handler);
    }
  }

  // Method to listen for chat read updates
  onChatReadUpdate(handler) {
    if (this.socket) {
      this.socket.on('chat:read-update', handler);
    }
  }

  // Method to emit new message events
  emitNewMessage(message) {
    if (this.socket) {
      this.socket.triggerEvent('message:new', message);
    }
  }

  // Method to simulate real-time updates for testing
  simulateRealTimeUpdate(type, data) {
    if (this.socket) {
      this.socket.triggerEvent(type, data);
    }
  }

  // Method to emit group chat updates
  emitGroupUpdate(chatId, updateType, data) {
    if (this.socket) {
      this.socket.emit('group:update', { chatId, updateType, data });
    }
  }

  // Method to listen for group chat updates
  onGroupUpdate(handler) {
    if (this.socket) {
      this.socket.on('group:update', handler);
    }
  }
}

// Export singleton instance
export default new SocketService();
