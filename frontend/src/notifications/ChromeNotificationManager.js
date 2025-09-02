// ChromeNotificationManager.js
// Handles Chrome desktop notifications for new messages

class ChromeNotificationManager {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.notifications = new Map(); // Track active notifications
    this.appIcon = '/logo192.png'; // App icon for notifications
  }

  // Request notification permission from user
  async requestPermission() {
    if (!this.isSupported) {
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Check if notifications are enabled
  isEnabled() {
    return this.isSupported && this.permission === 'granted';
  }

  // Show notification for new message
  showMessageNotification(message, senderName, chatName, chatId) {
    if (!this.isEnabled()) {
      return null;
    }

    // Don't show notification if user is already in the chat
    if (this.isUserInChat(chatId)) {
      return null;
    }

    // Don't show notification if window is focused on this chat
    if (this.isWindowFocusedOnChat(chatId)) {
      return null;
    }

    // Truncate message content if too long
    const messagePreview = message.content.length > 50 
      ? message.content.substring(0, 50) + '...' 
      : message.content;

    // Create notification
    const notification = new Notification(`${senderName} in ${chatName}`, {
      body: messagePreview,
      icon: this.appIcon,
      tag: `chat-${chatId}`, // Group notifications by chat
      requireInteraction: false,
      silent: true, // No sound, just visual
      data: {
        chatId,
        messageId: message._id,
        senderId: message.senderId
      }
    });

    // Handle notification click
    notification.onclick = () => {
      this.handleNotificationClick(chatId, message._id);
      notification.close();
    };

    // Auto-close notification after 5 seconds
    setTimeout(() => {
      if (notification) {
        notification.close();
      }
    }, 5000);

    // Store notification reference
    this.notifications.set(message._id, notification);

    // Remove from tracking when closed
    notification.onclose = () => {
      this.notifications.delete(message._id);
    };

    return notification;
  }

  // Check if user is currently in the specified chat
  isUserInChat(chatId) {
    // This will be set by the hook that uses this manager
    return this._isUserInChat ? this._isUserInChat(chatId) : false;
  }

  // Check if window is focused on the specified chat
  isWindowFocusedOnChat(chatId) {
    // Check if window has focus and if the chat is currently selected
    return document.hasFocus() && this.isChatCurrentlySelected(chatId);
  }

  // Check if a specific chat is currently selected/active
  isChatCurrentlySelected(chatId) {
    // This will be set by the hook that uses this manager
    return this._isChatCurrentlySelected ? this._isChatCurrentlySelected(chatId) : false;
  }

  // Set the context checking functions
  setContextCheckers(isUserInChat, isChatCurrentlySelected) {
    this._isUserInChat = isUserInChat;
    this._isChatCurrentlySelected = isChatCurrentlySelected;
  }

  // Handle notification click - bring user to the chat
  handleNotificationClick(chatId, messageId) {
    // Focus the window
    window.focus();
    
    // Emit custom event that the app can listen to
    const event = new CustomEvent('notification-clicked', {
      detail: { chatId, messageId }
    });
    window.dispatchEvent(event);
  }

  // Close all active notifications
  closeAllNotifications() {
    this.notifications.forEach(notification => {
      notification.close();
    });
    this.notifications.clear();
  }

  // Close notifications for a specific chat
  closeChatNotifications(chatId) {
    this.notifications.forEach((notification, messageId) => {
      if (notification.data?.chatId === chatId) {
        notification.close();
      }
    });
  }

  // Get current permission status
  getPermissionStatus() {
    return this.permission;
  }

  // Check if browser supports notifications
  isSupported() {
    return this.isSupported;
  }
}

// Export singleton instance
export const chromeNotificationManager = new ChromeNotificationManager();
export default chromeNotificationManager;
