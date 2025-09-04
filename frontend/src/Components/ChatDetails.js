import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { getSender } from '../config/ChatLogics';
import { extractMedia, formatDate, searchMessages } from '../lib/chatUtils';
import { 
  toggleSearchInChat, 
  toggleEditContact, 
  exportChat, 
  pinChat, 
  muteChat, 
  clearChatMessages, 
  deleteChat,
  updateContactAlias,
  setPendingAction,
  updateGroupChatTitle
} from '../actions/chatActions';

import MediaGrid from './MediaGrid';
import { useNavigate } from 'react-router-dom';

const ChatDetails = ({ isOpen, chatId, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [mediaData, setMediaData] = useState({ photos: [], videos: [], files: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [editAlias, setEditAlias] = useState('');
  const [editNote, setEditNote] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  const { selectedChat, ui } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch messages for the current chat when ChatDetails opens
  useEffect(() => {
    if (isOpen && chatId && token) {
      const fetchChatMessages = async () => {
        try {
          setIsLoadingMessages(true);
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/message/${chatId}`, {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const messages = await response.json();
            setChatMessages(messages);
            console.log(`Fetched ${messages.length} messages for media extraction`);
          } else {
            console.error('Failed to fetch messages for media:', response.status);
            setChatMessages([]);
          }
        } catch (error) {
          console.error('Error fetching messages for media:', error);
          setChatMessages([]);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      
      fetchChatMessages();
    } else if (!isOpen) {
      // Clear messages when ChatDetails closes
      setChatMessages([]);
      setMediaData({ photos: [], videos: [], files: [] });
    }
  }, [isOpen, chatId, token]);

  useEffect(() => {
    // Extract media from the fetched chat messages
    const media = extractMedia(chatMessages);
    console.log('Media extracted:', { 
      chatId, 
      messagesCount: chatMessages.length, 
      photos: media.photos.length, 
      videos: media.videos.length, 
      files: media.files.length 
    });
    setMediaData(media);
  }, [chatMessages, chatId]);

  // Initialize edit form when opening
  useEffect(() => {
    if (selectedChat && !selectedChat.isGroupChat) {
      const otherUser = selectedChat.users?.find(u => u._id !== user?._id);
      setEditAlias(otherUser?.alias || otherUser?.username || '');
      setEditNote(otherUser?.note || '');
    }
  }, [selectedChat, user]);

  // Initialize edit title for group chats
  useEffect(() => {
    if (selectedChat && selectedChat.isGroupChat) {
      setEditTitle(selectedChat.chatName || '');
    }
  }, [selectedChat]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchMessages(chatMessages, searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, chatMessages]);

  useEffect(() => {
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Don't render if not open or no selected chat
  if (!isOpen || !selectedChat) return null;

  // Debug log to help identify when ChatDetails is being rendered
  console.log('ChatDetails render:', { 
    isOpen, 
    chatId, 
    selectedChat: selectedChat ? { id: selectedChat._id, name: selectedChat.chatName } : null,
    messages: chatMessages ? { count: chatMessages.length, sample: chatMessages[0] } : 'No messages'
  });


  const isGroupChat = selectedChat?.isGroupChat;
  const chatName = isGroupChat ? selectedChat?.chatName : getSender(user, selectedChat?.users);
  const otherUser = isGroupChat ? null : selectedChat?.users?.find(u => u._id !== user?._id);
  
  // Get last message timestamp
  const lastMessage = chatMessages && chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;
  const lastMessageTime = lastMessage?.createdAt || selectedChat?.updatedAt;

  const handleSearchInChat = () => {
    dispatch(toggleSearchInChat(!ui.isSearchOpen));
  };

  const handleExportChat = async (format) => {
    console.log('Export requested:', { format, chatId, messagesCount: chatMessages?.length || 0 });
    
    try {
      // Pass the current messages to the export function
      await dispatch(exportChat(chatId, format, chatMessages));
      toast.current?.show({ severity: 'success', summary: 'Export Complete', detail: `${format.toUpperCase()} file downloaded successfully!` });
    } catch (error) {
      console.error('Export failed:', error);
      toast.current?.show({ severity: 'error', summary: 'Export Failed', detail: 'Failed to export chat. Please try again.' });
    }
  };

  const handleEditContact = () => {
    if (!isGroupChat) {
      dispatch(toggleEditContact(!ui.isEditOpen));
    }
  };

  const handleSaveContact = () => {
    if (!isGroupChat && editAlias.trim()) {
      dispatch(updateContactAlias(chatId, { alias: editAlias.trim(), note: editNote.trim() }));
      dispatch(toggleEditContact(false));
      toast.current?.show({ severity: 'success', summary: 'Contact Updated', detail: 'Alias and note saved successfully' });
    }
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
    setEditTitle(selectedChat.chatName || '');
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Invalid Title', detail: 'Group chat title cannot be empty' });
      return;
    }

    setIsSavingTitle(true);
    try {
      // Call API to update group chat title
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/${chatId}/title`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatName: editTitle.trim() })
      });

      if (response.ok) {
        // Update Redux store
        dispatch(updateGroupChatTitle(chatId, editTitle.trim()));
        setIsEditingTitle(false);
        toast.current?.show({ severity: 'success', summary: 'Title Updated', detail: 'Group chat title updated successfully' });
      } else {
        throw new Error('Failed to update title');
      }
    } catch (error) {
      console.error('Error updating title:', error);
      toast.current?.show({ severity: 'error', summary: 'Update Failed', detail: 'Failed to update group chat title' });
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleCancelTitleEdit = () => {
    setIsEditingTitle(false);
    setEditTitle(selectedChat.chatName || '');
  };

  const handlePinToggle = () => {
    const isPinned = selectedChat?.isPinned || false;
    dispatch(pinChat(chatId, !isPinned));
    toast.current?.show({ 
      severity: 'success', 
      summary: isPinned ? 'Unpinned' : 'Pinned', 
      detail: isPinned ? 'Chat unpinned' : 'Chat pinned to top' 
    });
  };



  const handleClearMessages = () => {
    setShowConfirmClear(true);
  };

  const confirmClearMessages = () => {
    dispatch(clearChatMessages(chatId));
    setShowConfirmClear(false);
    toast.current?.show({ severity: 'success', summary: 'Messages Cleared', detail: 'All messages in this chat have been cleared' });
  };

  const handleDeleteChat = () => {
    setShowConfirmDelete(true);
  };

  const confirmDeleteChat = () => {
    dispatch(deleteChat(chatId));
    setShowConfirmDelete(false);
    onClose();
    toast.current?.show({ severity: 'success', summary: 'Chat Deleted', detail: 'Chat has been deleted successfully' });
  };

  const handleSearchResultClick = (result) => {
    // Scroll to message and highlight it
    const messageElement = document.querySelector(`[data-message-id="${result.messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('highlight-message');
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    }
  };

  const handleClose = () => {
    
    onClose();
  };

  const getPresenceStatus = () => {
    if (isGroupChat) {
      return `${selectedChat?.users?.length || 0} members`;
    }
    return 'Direct Message';
  };

  return (
    <div className="chat-details-overlay" onClick={handleClose}>
      <div className="chat-details-container" onClick={(e) => e.stopPropagation()}>
        <div className="chat-details-header">
          <div className="header-content">
            <h2>Chat Details</h2>
            <div className="chat-info">
              {isGroupChat && isEditingTitle ? (
                <div className="editable-title">
                  <InputText
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="title-input"
                    placeholder="Enter group chat title"
                    maxLength={50}
                    autoFocus
                  />
                  <div className="title-actions">
                    <Button
                      icon="pi pi-check"
                      onClick={handleSaveTitle}
                      disabled={isSavingTitle || !editTitle.trim()}
                      className="save-title-btn"
                      size="small"
                    />
                    <Button
                      icon="pi pi-times"
                      onClick={handleCancelTitleEdit}
                      disabled={isSavingTitle}
                      className="cancel-title-btn"
                      outlined
                      size="small"
                    />
                  </div>
                </div>
              ) : (
                <div className="title-display">
                  <h3>{chatName}</h3>
                  {isGroupChat && (
                    <Button
                      icon="pi pi-pencil"
                      onClick={handleEditTitle}
                      className="edit-title-btn"
                      text
                      size="small"
                      title="Edit group chat title"
                    />
                  )}
                </div>
              )}
              <p>{getPresenceStatus()}</p>
            </div>
          </div>
          <div className="header-actions">
            <Button
              icon="pi pi-times"
              onClick={handleClose}
              className="close-button"
              text
              size="small"
            />
          </div>
        </div>

        <div className="chat-details-content">
          {/* Chat Information Section */}
          <div className="info-section">
            <h4 className="section-title">CHAT INFORMATION</h4>
            <div className="info-cards">
              <div className="info-card">
                <div className="card-icon">
                  <i className="pi pi-calendar"></i>
                </div>
                <div className="card-content">
                  <h5>Created</h5>
                  <p>{formatDate(selectedChat?.createdAt)}</p>
                </div>
              </div>
              
              <div className="info-card">
                <div className="card-icon">
                  <i className="pi pi-clock"></i>
                </div>
                <div className="card-content">
                  <h5>Last Message</h5>
                  <p>{formatDate(lastMessageTime)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shared Media Section */}
          <div className="media-section">
            <h4 className="section-title">SHARED MEDIA</h4>
            {isLoadingMessages ? (
              <div className="media-loading">
                <i className="pi pi-spin pi-spinner"></i>
                <p>Loading media...</p>
              </div>
            ) : (
              <TabView
                activeIndex={activeTab}
                onTabChange={(e) => setActiveTab(e.index)}
                className="media-tabs"
              >
                <TabPanel header="Photos" leftIcon="pi pi-image">
                  <MediaGrid
                    items={mediaData.photos}
                    type="photo"
                  />
                </TabPanel>
                
                <TabPanel header="Videos" leftIcon="pi pi-video">
                  <MediaGrid
                    items={mediaData.videos}
                    type="video"
                  />
                </TabPanel>
                
                <TabPanel header="Files" leftIcon="pi pi-file">
                  <MediaGrid
                    items={mediaData.files}
                    type="file"
                  />
                </TabPanel>
              </TabView>
            )}
          </div>

          {/* Actions Section */}
          <div className="actions-section">
            <h4 className="section-title">ACTIONS</h4>
            
            {/* Search in Chat - Inline Panel */}
            <div className="action-item">
              <Button
                label={ui.isSearchOpen ? "Close Search" : "Search in Chat"}
                icon={ui.isSearchOpen ? "pi pi-times" : "pi pi-search"}
                onClick={handleSearchInChat}
                className="action-button"
                outlined
              />
              
              {ui.isSearchOpen && (
                <div className="inline-panel search-panel">
                  <div className="panel-header">
                    <InputText
                      placeholder="Type to search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                    <Button
                      icon="pi pi-times"
                      onClick={() => dispatch(toggleSearchInChat(false))}
                      text
                      size="small"
                    />
                  </div>
                  
                  <div className="search-results">
                    {searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <div
                          key={result.messageId}
                          className="search-result-item"
                          onClick={() => handleSearchResultClick(result)}
                        >
                          <div className="result-content">
                            <p className="result-snippet">{result.snippet}</p>
                            <span className="result-timestamp">{formatDate(result.timestamp)}</span>
                          </div>
                        </div>
                      ))
                    ) : searchQuery.trim() ? (
                      <p className="no-results">No messages found</p>
                    ) : (
                      <p className="search-hint">Start typing to search messages...</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Export Chat */}
            <div className="action-item">
              <div className="action-label">Export Chat</div>
              <div className="export-buttons">
                <Button
                  label="JSON"
                  icon="pi pi-download"
                  onClick={() => handleExportChat('json')}
                  className="export-button"
                  size="small"
                  loading={ui.pendingAction === 'export'}
                />
                <Button
                  label="TXT"
                  icon="pi pi-download"
                  onClick={() => handleExportChat('txt')}
                  className="export-button"
                  size="small"
                  loading={ui.pendingAction === 'export'}
                />
              </div>
            </div>

            {/* Edit Contact - Inline Panel (DM only) */}
            {!isGroupChat && (
              <div className="action-item">
                <Button
                  label={ui.isEditOpen ? "Close Edit" : "Edit Contact"}
                  icon={ui.isEditOpen ? "pi pi-times" : "pi pi-user-edit"}
                  onClick={handleEditContact}
                  className="action-button"
                  outlined
                />
                
                {ui.isEditOpen && (
                  <div className="inline-panel edit-panel">
                    <div className="edit-form">
                      <div className="form-field">
                        <label>Display Name (Alias)</label>
                        <InputText
                          value={editAlias}
                          onChange={(e) => setEditAlias(e.target.value)}
                          placeholder="Enter display name"
                          maxLength={40}
                        />
                      </div>
                      <div className="form-field">
                        <label>Note (Optional)</label>
                        <InputTextarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Add a note about this contact"
                          rows={3}
                        />
                      </div>
                      <div className="form-actions">
                        <Button
                          label="Save"
                          icon="pi pi-check"
                          onClick={handleSaveContact}
                          disabled={!editAlias.trim()}
                        />
                        <Button
                          label="Cancel"
                          icon="pi pi-times"
                          onClick={() => dispatch(toggleEditContact(false))}
                          outlined
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pin/Unpin Chat */}
            <div className="action-item">
              <Button
                label={selectedChat?.isPinned ? "Unpin Chat" : "Pin Chat"}
                icon={selectedChat?.isPinned ? "pi pi-bookmark-fill" : "pi pi-bookmark"}
                onClick={handlePinToggle}
                className="action-button"
                outlined
              />
            </div>



            {/* Clear Messages */}
            <div className="action-item">
              <Button
                label="Clear Messages"
                icon="pi pi-trash"
                onClick={handleClearMessages}
                className="action-button danger-button"
                outlined
                loading={ui.pendingAction === 'clear'}
              />
            </div>

            {/* Delete Chat (DM only) */}
            {!isGroupChat && (
              <div className="action-item">
                <Button
                  label="Delete Chat"
                  icon="pi pi-trash"
                  onClick={handleDeleteChat}
                  className="action-button danger-button"
                  outlined
                  loading={ui.pendingAction === 'delete'}
                />
              </div>
            )}
          </div>

          {/* Group Members Section (for group chats) */}
          {isGroupChat && selectedChat?.users && (
            <div className="members-section">
              <h4 className="section-title">MEMBERS</h4>
              <div className="members-list">
                {selectedChat.users.map((member) => (
                  <div key={member._id} className="member-item">
                    <div className="member-avatar">
                      {member.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="member-info">
                      <h5>{member.username}</h5>
                      <p>{member.email}</p>
                    </div>
                    {member._id === selectedChat?.sender?._id && (
                      <div className="admin-badge">
                        <i className="pi pi-crown"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {showConfirmClear && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Clear Messages</h3>
            <p>This will remove all messages in this chat on your device. This action cannot be undone.</p>
            <div className="dialog-actions">
              <Button
                label="Cancel"
                onClick={() => setShowConfirmClear(false)}
                outlined
              />
              <Button
                label="Clear Messages"
                onClick={confirmClearMessages}
                className="danger-button"
              />
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Delete Chat</h3>
            <p>This will permanently delete this chat and all its messages. This action cannot be undone.</p>
            <div className="dialog-actions">
              <Button
                label="Cancel"
                onClick={() => setShowConfirmDelete(false)}
                outlined
              />
              <Button
                label="Delete Chat"
                onClick={confirmDeleteChat}
                className="danger-button"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast for notifications */}
      <Toast ref={toast} />
    </div>
  );
};

export default ChatDetails;