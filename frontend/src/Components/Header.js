import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSender } from '../config/ChatLogics';
import { openChatDetails, REFRESH_SELECTED_CHAT } from '../actions/chatActions';
import UserProfileModal from './UserProfileModal';
import GroupChatModal from './GroupChatModal';
import socketService from '../services/socketService';

function Header() {
  const { user } = useSelector(state => state.chat);
  const dispatch = useDispatch();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false);

  const { selectedChat } = useSelector((state) => state.chat);
  const contactName = selectedChat 
    ? (!selectedChat.isGroupChat 
        ? getSender(user, selectedChat.users)
        : selectedChat.chatName)
    : 'ChatApp';

  const contactAvatar = selectedChat
    ? (!selectedChat.isGroupChat 
        ? getSender(user, selectedChat.users).charAt(0).toUpperCase()
        : selectedChat.chatName.charAt(0).toUpperCase())
    : (user?.username?.charAt(0)?.toUpperCase() || 'U');

  // Get the other user's ID for direct messages
  const getOtherUserId = () => {
    if (selectedChat && !selectedChat.isGroupChat && user) {
      return selectedChat.users.find(u => u._id !== user._id)?._id;
    }
    return null;
  };

  const handleProfileClick = () => {
    try {
      if (selectedChat && !selectedChat.isGroupChat) {
        setIsProfileModalOpen(true);
      } else if (selectedChat && selectedChat.isGroupChat) {
        setIsGroupChatModalOpen(true);
      }
    } catch (error) {
      console.error('❌ Error handling profile click:', error);
    }
  };

  const isDirectMessage = selectedChat && !selectedChat.isGroupChat;
  const isGroupChat = selectedChat && selectedChat.isGroupChat;
  const otherUserId = getOtherUserId();

  // Listen for group updates to refresh the selectedChat
  useEffect(() => {
    if (socketService.isSocketConnected() && isGroupChat) {
      const handleGroupUpdate = (data) => {
        if (data.chatId === selectedChat._id) {
          // Refresh the selectedChat by dispatching an action
          // This will trigger a re-render with the latest data
          dispatch({ type: REFRESH_SELECTED_CHAT });
        }
      };

      socketService.onGroupUpdate(handleGroupUpdate);

      return () => {
        // Cleanup will be handled by socketService
      };
    }
  }, [selectedChat?._id, isGroupChat, dispatch]);

  return (
    <>
      <div className="chat-header">
        <div className="chat-header-left">
          <div 
            className={`chat-header-avatar ${isDirectMessage || isGroupChat ? 'clickable' : ''}`}
            onClick={isDirectMessage || isGroupChat ? handleProfileClick : undefined}
            title={isDirectMessage ? 'Click to view profile' : isGroupChat ? 'Click to manage group' : undefined}
            data-tooltip={contactName}
          >
            {contactAvatar}
          </div>
          
          <div className="chat-header-user-info">
            <h3 
              className={`chat-header-name ${isDirectMessage || isGroupChat ? 'clickable' : ''}`}
              onClick={isDirectMessage || isGroupChat ? handleProfileClick : undefined}
              title={isDirectMessage ? 'Click to view profile' : isGroupChat ? 'Click to manage group' : undefined}
            >
              {contactName}
            </h3>
            <div className="chat-header-status">
              {selectedChat && (
                selectedChat.isGroupChat ? (
                  `${selectedChat.users.length} members`
                ) : (
                  'Direct Message'
                )
              )}
            </div>
          </div>
        </div>
        
        <div className="chat-header-center">
          {/* Empty center space for future use */}
        </div>
        
        {selectedChat && (
          <div className="chat-header-actions">
            <button 
              className="header-button call"
              onClick={() => {
                // TODO: Implement call functionality
              }}
              aria-label="Voice call"
            >
              <i className="pi pi-phone"></i>
            </button>
            
            <button 
              className="header-button video"
              onClick={() => {
                // TODO: Implement video call functionality
              }}
              aria-label="Video call"
            >
              <i className="pi pi-video"></i>
            </button>
            
            <button
              className="header-button"
              onClick={() => dispatch(openChatDetails(selectedChat._id))}
              aria-label="Chat Details"
            >
              <i className="pi pi-ellipsis-v"></i>
            </button>
          </div>
        )}
      </div>
      
      {/* User Profile Modal for Direct Messages */}
      {isProfileModalOpen && otherUserId && (
        <UserProfileModal 
          isOpen={isProfileModalOpen}
          userId={otherUserId} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      )}

      {/* Group Chat Modal for Group Chats */}
      {isGroupChatModalOpen && selectedChat && (
        <GroupChatModal 
          isOpen={isGroupChatModalOpen}
          chat={selectedChat}
          onClose={() => setIsGroupChatModalOpen(false)} 
        />
      )}
    </>
  );
}

export default Header;
