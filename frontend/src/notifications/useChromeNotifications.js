// useChromeNotifications.js
// Hook for handling Chrome desktop notifications for new messages

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import chromeNotificationManager from './ChromeNotificationManager';
import { getSender } from '../config/ChatLogics';
import { setSelectedChat } from '../actions/chatActions';

export default function useChromeNotifications({ socket, currentUserId, onIncomingMessageUpsert }) {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector(state => state.chat);
  const { chats } = useSelector(state => state.chat);
  const { user } = useSelector(state => state.user);
  
  const hasRequestedPermission = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    if (!hasRequestedPermission.current) {
      chromeNotificationManager.requestPermission();
      hasRequestedPermission.current = true;
    }
  }, []);

  // Listen for new messages and show notifications
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleNewMessage = (message) => {
      // Skip if it's our own message
      if (message.senderId === currentUserId) {
        return;
      }

      // Find the chat details
      const chat = chats.find(c => c._id === message.chatId);
      if (!chat) {
        return;
      }

      // Get sender name
      const senderName = chat.isGroupChat 
        ? getSender(user, chat.users) 
        : chat.users.find(u => u._id === message.senderId)?.username || 'Unknown User';

      // Get chat name
      const chatName = chat.isGroupChat ? chat.chatName : 'Direct Message';

      // Check if chat is muted (you can implement this based on your mute system)
      const isChatMuted = false; // TODO: Implement chat mute checking

      if (isChatMuted) {
        return;
      }

      // Show Chrome notification
      if (chromeNotificationManager.isEnabled()) {
        chromeNotificationManager.showMessageNotification(
          message,
          senderName,
          chatName,
          message.chatId
        );
      }

      // Call the original message handler if provided
      if (onIncomingMessageUpsert) {
        onIncomingMessageUpsert(message);
      }
    };

    // Listen for new messages
    socket.on('message:new', handleNewMessage);

    // Cleanup
    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, currentUserId, chats, user, onIncomingMessageUpsert]);

  // Listen for notification clicks and navigate to chat
  useEffect(() => {
    const handleNotificationClick = (event) => {
      const { chatId, messageId } = event.detail;
      
      // Find the chat and set it as selected
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        dispatch(setSelectedChat(chat));
        // Focus the window to bring user back to the app
        window.focus();
      }
    };

    window.addEventListener('notification-clicked', handleNotificationClick);

    return () => {
      window.removeEventListener('notification-clicked', handleNotificationClick);
    };
  }, [chats, dispatch]);

  // Update notification manager with current chat context
  useEffect(() => {
    if (chromeNotificationManager.isEnabled()) {
      // Set the context checking functions
      chromeNotificationManager.setContextCheckers(
        (chatId) => selectedChat?._id === chatId,
        (chatId) => selectedChat?._id === chatId
      );
    }
  }, [selectedChat]);

  return {
    isEnabled: chromeNotificationManager.isEnabled(),
    permissionStatus: chromeNotificationManager.getPermissionStatus(),
    requestPermission: chromeNotificationManager.requestPermission.bind(chromeNotificationManager)
  };
}
