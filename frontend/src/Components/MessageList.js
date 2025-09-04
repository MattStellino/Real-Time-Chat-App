import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ScrollChat from './ScrollChat';
import { CONFIG } from '../config';

const AUTO_SCROLL_ON_SEND = false; // Kill-switch flag

const MessageList = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.auth);
  const messageScrollRef = useRef(null);

  const last = useRef({ height: 0, top: 0, client: 0 }); // Scroll tracking ref

  // Callback to update messages when read receipts change
  const updateMessageReadReceipt = (messageId, readBy) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message._id === messageId 
          ? { ...message, readBy: readBy }
          : message
      )
    );
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
  
      
      const response = await fetch(`${CONFIG.API_URL}/api/message/${selectedChat._id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Message fetch failed:', response.status, errorText);
        throw new Error('Failed to Load the Messages');
      }

      const data = await response.json();
      
      setMessages(data);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add debouncing to prevent rapid API calls
    const timer = setTimeout(() => {
      fetchMessages();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedChat, fetchAgain]);

  // Keep 'last' up to date when the user scrolls manually
  useEffect(() => {
    const el = messageScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      last.current = { height: el.scrollHeight, top: el.scrollTop, client: el.clientHeight };
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init once
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // When messages length changes, restore the previous viewport
  useLayoutEffect(() => {
    const el = messageScrollRef.current;
    if (!el) return;
    const fromBottom = last.current.height - last.current.top - last.current.client;
    const newHeight = el.scrollHeight;
    const newClient = el.clientHeight;
    el.scrollTop = newHeight - newClient - fromBottom;
    last.current = { height: newHeight, top: el.scrollTop, client: newClient };
  }, [messages.length]);

  if (!selectedChat) {
    return null;
  }

  return (
    <div ref={messageScrollRef} className="message-list-container" key={selectedChat?._id}>
      {loading ? (
        <div className="loading-spinner">
          <i className="pi pi-spin pi-spinner"></i>
        </div>
      ) : (
        <ScrollChat messages={messages} updateMessageReadReceipt={updateMessageReadReceipt} />
      )}
    </div>
  );
};

export default MessageList;
