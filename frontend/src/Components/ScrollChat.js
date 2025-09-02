import React, { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import ImageCarousel from './ImageCarousel';
import { updateReadReceipts, updateUnreadCount, markChatAsRead } from '../actions/chatActions';
import socketService from '../services/socketService';

// Format file size helper
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ScrollChat = ({messages, updateMessageReadReceipt}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { selectedChat } = useSelector(state => state.chat);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);

  // Mark messages as read when chat is opened and messages are visible
  useEffect(() => {
    if (selectedChat && messages.length > 0 && !isMarkingAsRead) {
      // Only mark as read if this is a new chat selection or if there are unread messages
      const hasUnreadMessages = messages.some(msg => 
        msg.senderId !== user._id && 
        (!msg.readBy || !msg.readBy.includes(user._id))
      );
      
                              if (hasUnreadMessages) {
          handleMarkChatAsRead();
        }
      }
    }, [selectedChat?._id, messages.length]);

  // Listen for real-time read receipt updates from other users
  useEffect(() => {
    if (socketService.isSocketConnected()) {
      // Listen for read receipt updates from other users
      const handleReadReceiptUpdate = (data) => {
        if (data.messageId && data.readBy) {
          // Update Redux state
          dispatch(updateReadReceipts(data.messageId, data.readBy));
          // Update local messages state
          if (updateMessageReadReceipt) {
            updateMessageReadReceipt(data.messageId, data.readBy);
          }
        }
      };

      // Listen for chat read updates
      const handleChatReadUpdate = (data) => {
        if (data.chatId && data.userId) {
          dispatch(updateUnreadCount(data.chatId, data.userId, 0));
        }
      };

      socketService.onReadReceiptUpdate(handleReadReceiptUpdate);
      socketService.onChatReadUpdate(handleChatReadUpdate);
      
      // Cleanup function
      return () => {
        // Note: socketService methods don't have cleanup methods
      };
    }
  }, [updateMessageReadReceipt]); // Add updateMessageReadReceipt to dependencies

  const handleMarkChatAsRead = async () => {
    if (isMarkingAsRead) {
      return;
    }

    try {
      setIsMarkingAsRead(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setIsMarkingAsRead(false);
        return;
      }
      
      // Call the backend API to mark all messages as read
      const response = await fetch(`http://localhost:5000/api/message/chat/${selectedChat._id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update local Redux state immediately
        dispatch(markChatAsRead(selectedChat._id, user._id));
        
        // Emit socket event for real-time updates to other users
        socketService.markChatAsRead(selectedChat._id);
        
        // Update all messages in this chat to show as read
        if (updateMessageReadReceipt && messages.length > 0) {
          messages.forEach(message => {
            if (message.sender._id !== user._id) { // Only update messages from other users
              const updatedReadBy = message.readBy || [];
              const alreadyRead = updatedReadBy.some(read => read.user === user._id);
              if (!alreadyRead) {
                updatedReadBy.push({ user: user._id, readAt: new Date() });
                updateMessageReadReceipt(message._id, updatedReadBy);
              }
            }
          });
        }
        
      } else {
        const errorText = await response.text();
        console.error('Failed to mark chat as read:', response.status, errorText);
      }
    } catch (error) {
      console.error('Exception in handleMarkChatAsRead:', error);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  // Get read receipt status for a message
  const getReadReceiptStatus = (message) => {
    // Read receipts only apply to messages sent by the current user
    // They show whether the recipient has read the message
    if (message.sender._id !== user._id) {
      return null; // No read receipt for incoming messages
    }
    
    // Check if the message has been read by any recipient
    if (!message.readBy || message.readBy.length === 0) {
      return 'sent'; // Single check mark - sent but not delivered/read
    }
    
    // Check if any recipient has read this message
    const hasBeenRead = message.readBy.some(read => read.user !== user._id);
    if (hasBeenRead) {
      return 'read'; // Blue double check mark - recipient has read it
    }
    
    return 'delivered'; // Gray double check mark - delivered but not read
  };

  // Collect all images from messages for carousel
  const allImages = useMemo(() => {
    const images = [];
    messages.forEach(message => {
      if (message.attachments) {
        message.attachments.forEach(attachment => {
          if (attachment.type === 'image') {
            images.push(attachment);
          }
        });
      }
    });
    return images;
  }, [messages]);

  const handleImageClick = (clickedImage) => {
    const imageIndex = allImages.findIndex(img => img.url === clickedImage.url);
    setCurrentImageIndex(imageIndex);
    setCarouselOpen(true);
  };

  const closeCarousel = () => {
    setCarouselOpen(false);
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isGrouped = (messages, m, i) => {
    if (i === 0) return false;
    const prevMessage = messages[i - 1];
    return (
      prevMessage.sender._id === m.sender._id &&
      new Date(m.createdAt) - new Date(prevMessage.createdAt) < 5 * 60 * 1000 // 5 minutes
    );
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="empty-chat-state">
        <div className="empty-chat-icon">💬</div>
        <h2>No messages yet</h2>
        <p>Start the conversation by sending a message</p>
      </div>
    );
  }

  return (
    <>
      <div className="messages-content">
        {messages.map((m, i) => {
          const isOwnMessage = m.sender._id === user._id;
          const showAvatar = !isOwnMessage && (isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id));
          const grouped = isGrouped(messages, m, i);
          const readStatus = getReadReceiptStatus(m);
          
          return (
            <div 
              className={`message-row ${isOwnMessage ? 'outgoing' : 'incoming'} ${grouped ? 'grouped' : ''}`} 
              key={m._id}
            >
              {showAvatar && (
                <div className="message-avatar">
                  {m.sender.username.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className={`bubble ${isOwnMessage ? 'outgoing' : 'incoming'} ${m.attachments && m.attachments.length > 0 ? 'has-attachments' : ''}`}>
                {/* Attachments */}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="message-attachments">
                    {m.attachments.map((attachment, attIndex) => (
                      <div key={attIndex} className="message-attachment">
                        {attachment.type === 'image' ? (
                          <img 
                            src={`http://localhost:5000${attachment.url}`}
                            alt={attachment.filename || 'Image'}
                            className="attachment-image"
                            loading="lazy"
                            onClick={() => handleImageClick(attachment)}
                          />
                        ) : attachment.type === 'video' ? (
                          <div className="attachment-video">
                            <video 
                              src={`http://localhost:5000${attachment.url}`}
                              controls
                              className="attachment-video-player"
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ) : (
                          <div className="attachment-file">
                            <div className="attachment-file-icon">📎</div>
                            <div className="attachment-file-info">
                              <div className="attachment-file-name">{attachment.filename}</div>
                              <div className="attachment-file-size">
                                {attachment.size ? formatFileSize(attachment.size) : ''}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Text content */}
                {m.content && (
                  <div className="content">
                    {m.content}
                  </div>
                )}
                
                <div className="meta">
                  {formatTime(m.createdAt)}
                  {isOwnMessage && (
                    <div 
                      className={`read-receipts ${readStatus}`}
                      data-status={readStatus === 'sent' ? 'Sent' : readStatus === 'delivered' ? 'Delivered' : 'Seen'}
                      title={readStatus === 'sent' ? 'Sent' : readStatus === 'delivered' ? 'Delivered' : 'Seen'}
                    >
                      {readStatus === 'sent' && <i className="pi pi-check"></i>}
                      {readStatus === 'delivered' && (
                        <>
                          <i className="pi pi-check"></i>
                          <i className="pi pi-check"></i>
                        </>
                      )}
                      {readStatus === 'read' && (
                        <>
                          <i className="pi pi-check"></i>
                          <i className="pi pi-check"></i>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Carousel */}
      {carouselOpen && (
        <ImageCarousel
          images={allImages}
          currentIndex={currentImageIndex}
          onClose={closeCarousel}
        />
      )}
    </>
  );
};

export default ScrollChat;