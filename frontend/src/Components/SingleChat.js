// Single chat view component for displaying messages in a conversation
// Handles message fetching and scroll position management
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ScrollChat from './ScrollChat';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  // Removed all scroll tracking - no auto scroll functionality
  const { selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);
  


  // ALL SCROLL FUNCTIONALITY REMOVED - NO AUTO SCROLL
  
  // Smart scroll position lock - only lock if not at bottom
  useEffect(() => {
    const messagesContainer = document.querySelector('.chat-pane__messages');
    if (messagesContainer) {
      let lockedScrollTop = messagesContainer.scrollTop;
      const SCROLL_EPS = 24; // px tolerance for "near bottom"
      
      const isNearBottom = () => {
        return messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - SCROLL_EPS;
      };
      
      const lockScrollPosition = () => {
        // Only lock position if user is NOT at the bottom
        if (!isNearBottom()) {
          messagesContainer.scrollTop = lockedScrollTop;
        }
        // If user is at bottom, let it scroll naturally to show new message
      };
      
      // Lock scroll position on any content change
      const observer = new MutationObserver(lockScrollPosition);
      observer.observe(messagesContainer, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
      
      // Update locked position when user manually scrolls
      const updateLockPosition = () => {
        lockedScrollTop = messagesContainer.scrollTop;
      };
      
      messagesContainer.addEventListener('scroll', updateLockPosition, { passive: true });
      
      return () => {
        observer.disconnect();
        messagesContainer.removeEventListener('scroll', updateLockPosition);
      };
    }
  }, []);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/message/${selectedChat._id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!response.ok) throw new Error('Failed to Load the Messages');

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat, fetchAgain]);



  if (!selectedChat) {
    return null;
  }

  return (
    <>
      {loading ? (
        <div className="loading-spinner">
          <i className="pi pi-spin pi-spinner"></i>
        </div>
      ) : (
        <>
          <ScrollChat messages={messages} />
        </>
      )}
    </>
  );
};

export default SingleChat;


