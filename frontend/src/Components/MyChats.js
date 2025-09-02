// Chat sidebar component displaying list of user's conversations
// Handles chat fetching, selection, and group chat creation
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import { setSelectedChat, setChats, resetSelectedChat, updateUnreadCount, markChatAsRead } from '../actions/chatActions';
import { getSender } from '../config/ChatLogics';
import GroupChatModal from './misc/GroupChatModal';
import socketService from '../services/socketService';

const MyChats = () => {
  const dispatch = useDispatch();
  const { chats, selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.auth);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChats = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load chats:', response.status, errorText);
        throw new Error(`Failed to load the chats: ${response.status}`);
      }

      const data = await response.json();
      dispatch(setChats(data));
      
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, token, isRefreshing]);

  useEffect(() => {
    fetchChats();
    
    // Set up real-time listeners
    if (socketService.isSocketConnected()) {
  
      const socket = socketService.getSocket();
      
      const handleNewMessage = (message) => {

        if (message.chatId && (!selectedChat || selectedChat._id !== message.chatId)) {
          dispatch(updateUnreadCount(message.chatId, message.senderId, 1));
        }
      };
      
      const handleReadReceiptUpdate = (data) => {

        if (data.chatId && (!selectedChat || selectedChat._id !== data.chatId)) {
          dispatch(updateUnreadCount(data.chatId, data.userId, 0));
        }
      };
      
      const handleChatReadUpdate = (data) => {

        if (data.chatId && (!selectedChat || selectedChat._id !== data.chatId)) {
          dispatch(updateUnreadCount(data.chatId, data.userId, 0));
        }
      };

      const handleGroupUpdate = (data) => {
        if (data.chatId) {
          // Refresh chats to get the latest group state
          fetchChats();
        }
      };
      
      socket.on('message:new', handleNewMessage);
      socketService.onReadReceiptUpdate(handleReadReceiptUpdate);
      socketService.onChatReadUpdate(handleChatReadUpdate);
      socketService.onGroupUpdate(handleGroupUpdate);
      
      return () => {
    
        socket.off('message:new', handleNewMessage);
        // Note: socketService methods don't have cleanup methods, but we'll log the cleanup
      };
    }
  }, [dispatch, selectedChat?._id]); // Only depend on selectedChat._id, not the entire object

  // Handle chat selection and immediately mark as read
  const handleChatSelection = useCallback(async (chat) => {
    
    
    // Check if this chat is already selected
    if (selectedChat && selectedChat._id === chat._id) {
      
      dispatch(resetSelectedChat());
      return;
    }
    
    // Immediately update the UI to show 0 unread
    if (chat.unreadCount > 0) {
      
      dispatch(updateUnreadCount(chat._id, user._id, 0));
    }
    
    // Set the selected chat
    
    dispatch(setSelectedChat(chat));
    
    // If there were unread messages, also update the backend
    if (chat.unreadCount > 0) {
      try {

        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/message/chat/${chat._id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {

          // Emit socket event for real-time updates
          socketService.markChatAsRead(chat._id);
        } else {
          console.error('❌ Backend failed to mark chat as read');
        }
      } catch (error) {
        console.error('💥 Error marking chat as read:', error);
      }
    }
  }, [dispatch, user._id, token, selectedChat]);

  const ChatItem = ({ chat, setSelectedChat, selectedChat }) => {
    const isSelected = selectedChat?._id === chat._id;
    const unreadCount = chat.unreadCount || 0;
    const [isBadgeVisible, setIsBadgeVisible] = useState(unreadCount > 0);



    // Update badge visibility when unread count changes
    useEffect(() => {
      if (unreadCount === 0 && isBadgeVisible) {
        // Animate badge out
        setIsBadgeVisible(false);
      } else if (unreadCount > 0 && !isBadgeVisible) {
        // Animate badge in
        setIsBadgeVisible(true);
      }
    }, [unreadCount, isBadgeVisible]);

    return (
      <div 
        onClick={() => setSelectedChat(chat)} 
        className={`chat-item ${isSelected ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`} 
      >
        <div className="chat-item-avatar">
          {!chat.isGroupChat ? getSender(user, chat.users).charAt(0).toUpperCase() : chat.chatName.charAt(0).toUpperCase()}
        </div>
        <div className="chat-item-info">
          <div className="chat-item-name">
            {!chat.isGroupChat ? getSender(user, chat.users) : chat.chatName}
          </div>
          <div className="chat-item-last-message">
            {chat.latestMessage ? chat.latestMessage.content : 'No messages'}
          </div>
        </div>
        {isBadgeVisible && (
          <div className={`unread-badge ${unreadCount === 0 ? 'hide' : ''}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>
    );
  };



  return (
    <div className="chat-sidebar-content">
      <div className="chat-sidebar-header">
        <h1>My Chats</h1>
        <GroupChatModal>
          <Button className="modern-button">
            New Group Chat
          </Button>
        </GroupChatModal>
      </div>
      
      <div className="chat-list">
        {chats && chats.length > 0 ? (
          chats.map(chat => (
            <ChatItem 
              key={chat._id}
              chat={chat}
              setSelectedChat={handleChatSelection}
              selectedChat={selectedChat}
            />
          ))
        ) : (
          <div style={{
            padding: '20px', 
            textAlign: 'center', 
            color: 'var(--text-muted)',
            background: 'var(--panel-2)',
            borderRadius: '8px',
            margin: '20px',
            border: '1px solid var(--border)'
          }}>
            {chats === undefined ? (
              <div>
                <div style={{fontSize: '24px', marginBottom: '10px'}}>⏳</div>
                <div>Loading chats...</div>
                <div style={{fontSize: '12px', marginTop: '10px', opacity: 0.7}}>
                  Please wait while we fetch your conversations
                </div>
              </div>
            ) : chats === null ? (
              <div>
                <div style={{fontSize: '24px', marginBottom: '10px'}}>❌</div>
                <div>Failed to load chats</div>
                <div style={{fontSize: '12px', marginTop: '10px', opacity: 0.7}}>
                  Check console for errors. Backend server might not be running.
                </div>
              </div>
            ) : chats.length === 0 ? (
              <div>
                <div style={{fontSize: '24px', marginBottom: '10px'}}>💬</div>
                <div>No chats found</div>
                <div style={{fontSize: '12px', marginTop: '10px', opacity: 0.7}}>
                  Start a conversation to see it here
                </div>
              </div>
            ) : (
              <div>
                <div style={{fontSize: '24px', marginBottom: '10px'}}>❓</div>
                <div>Unknown error</div>
                <div style={{fontSize: '12px', marginTop: '10px', opacity: 0.7}}>
                  Something went wrong. Check console for details.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChats;
