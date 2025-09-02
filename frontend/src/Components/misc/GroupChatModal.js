import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { setChats, setSelectedChat } from '../../actions/chatActions';
import { useDebounce } from '../../hooks/useDebounce';
import { useAbortableFetch } from '../../hooks/useAbortableFetch';

const MAX_MEMBERS = 25;

const GroupChatModal = ({ children }) => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Refs
  const toast = useRef(null);
  const groupNameInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  // Redux
  const dispatch = useDispatch();
  const { chats } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.auth);

  // Hooks
  const debouncedQuery = useDebounce(query, 300);
  const { abortableFetch, cancel } = useAbortableFetch();

  // Validation
  const isGroupNameValid = groupName.trim().length >= 2 && groupName.trim().length <= 60;
  const isMembersValid = selectedUsers.length >= 1;
  const isFormValid = isGroupNameValid && isMembersValid && selectedUsers.length < MAX_MEMBERS;

  // Search users
  const searchUsers = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const response = await abortableFetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/user/search?query=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const users = await response.json();
      
      // Transform and filter results
      const results = users
        .filter(u => u._id !== user?._id) // Exclude current user
        .filter(u => !selectedUsers.find(selected => selected._id === u._id)) // Exclude already selected
        .map(u => ({
          ...u,
          id: u._id,
          displayName: u.username || u.name || u.email || 'Unknown User',
        }));

      setSearchResults(results);
      setHighlightIndex(-1);
    } catch (err) {
      if (err instanceof Error && err.message !== 'Request was cancelled') {
        console.error('Search error:', err);
        setError('Failed to search users');
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, [token, user, selectedUsers, abortableFetch]);

  // Debounced search effect
  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    } else {
      setSearchResults([]);
      setHighlightIndex(-1);
    }
  }, [debouncedQuery, searchUsers]);

  // Focus management
  useEffect(() => {
    if (isOpen && groupNameInputRef.current) {
      groupNameInputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        handleClose();
        break;
      case 'ArrowDown':
        if (searchResults.length > 0) {
          e.preventDefault();
          setHighlightIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        if (searchResults.length > 0) {
          e.preventDefault();
          setHighlightIndex(prev => prev > 0 ? prev - 1 : -1);
        }
        break;
      case 'Enter':
        if (highlightIndex >= 0 && highlightIndex < searchResults.length) {
          e.preventDefault();
          handleSelectUser(searchResults[highlightIndex]);
        }
        break;
      case 'Backspace':
        if (query === '' && selectedUsers.length > 0) {
          e.preventDefault();
          handleRemoveUser(selectedUsers[selectedUsers.length - 1]);
        }
        break;
    }
  }, [isOpen, searchResults, highlightIndex, query, selectedUsers]);

  // Event handlers
  const handleOpen = () => {
    setIsOpen(true);
    setGroupName('');
    setQuery('');
    setSelectedUsers([]);
    setSearchResults([]);
    setError(null);
    setHighlightIndex(-1);
  };

  const handleClose = () => {
    setIsOpen(false);
    setGroupName('');
    setQuery('');
    setSelectedUsers([]);
    setSearchResults([]);
    setError(null);
    setHighlightIndex(-1);
    cancel();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSelectUser = (user) => {
    if (selectedUsers.length >= MAX_MEMBERS) {
      setError(`Maximum ${MAX_MEMBERS} members allowed`);
      return;
    }

    if (!selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers(prev => [...prev, user]);
      setQuery('');
      setSearchResults([]);
      setHighlightIndex(-1);
    }
  };

  const handleRemoveUser = (userToRemove) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userToRemove._id));
  };

  const handleCreateGroup = async () => {
    if (!isFormValid || !token) return;

    try {
      setIsCreating(true);
      setError(null);

      const requestBody = {
        name: groupName.trim(),
        users: selectedUsers.map(u => u._id),
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create group: ${errorText}`);
      }

      const newChat = await response.json();
      
      // Update Redux state
      dispatch(setChats([newChat, ...chats]));
      dispatch(setSelectedChat(newChat));

      // Show success message
      toast.current?.show({
        severity: 'success',
        summary: 'Group Created',
        detail: `Group "${newChat.chatName}" created successfully!`,
        life: 3000,
      });

      handleClose();
    } catch (err) {
      console.error('Create group error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
      setError(errorMessage);
      toast.current?.show({
        severity: 'error',
        summary: 'Creation Failed',
        detail: errorMessage,
        life: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Render helpers
  const renderSearchResult = (user, index) => {
    const isHighlighted = index === highlightIndex;
    const initial = user.displayName.charAt(0).toUpperCase();

    return (
      <div
        key={user._id}
        className={`search-result-item ${isHighlighted ? 'highlighted' : ''}`}
        onClick={() => handleSelectUser(user)}
        onMouseEnter={() => setHighlightIndex(index)}
      >
        <div className="search-result-avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} />
          ) : (
            initial
          )}
        </div>
        <div className="search-result-info">
          <div className="search-result-name">{user.displayName}</div>
          <div className="search-result-handle">@{user.username}</div>
        </div>
      </div>
    );
  };

  const renderSelectedUser = (user) => (
    <div key={user._id} className="selected-user-chip">
      <div className="chip-avatar">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.username} />
        ) : (
          user.username.charAt(0).toUpperCase()
        )}
      </div>
      <span className="chip-name">{user.username}</span>
      <button
        type="button"
        className="chip-remove"
        onClick={() => handleRemoveUser(user)}
        aria-label={`Remove ${user.username}`}
      >
        ×
      </button>
    </div>
  );

  return (
    <>
      <span onClick={handleOpen}>{children}</span>
      
      {isOpen && (
        <div 
          className="modal-overlay"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div 
            ref={modalRef}
            className="group-chat-modal"
            role="dialog"
            aria-labelledby="group-chat-title"
            aria-describedby="group-chat-description"
          >
            {/* Header */}
            <div className="modal-header">
              <div className="header-content">
                <h2 id="group-chat-title">Create Group Chat</h2>
                <p id="group-chat-description">Add members and create a new group conversation</p>
              </div>
              <Button
                icon="pi pi-times"
                className="close-button"
                onClick={handleClose}
                text
                rounded
                aria-label="Close modal"
              />
            </div>

            {/* Content */}
            <div className="modal-content">
              {/* Group Name */}
              <div className="form-section">
                <label htmlFor="group-name" className="form-label">
                  Group Name *
                </label>
                <InputText
                  ref={groupNameInputRef}
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className={`form-input ${!isGroupNameValid && groupName ? 'error' : ''}`}
                  maxLength={60}
                  aria-describedby="group-name-help"
                />
                <div id="group-name-help" className="form-help">
                  {groupName && !isGroupNameValid && (
                    <span className="error-text">
                      Group name must be 2-60 characters
                    </span>
                  )}
                  {groupName && isGroupNameValid && (
                    <span className="success-text">
                      {groupName.length}/60 characters
                    </span>
                  )}
                </div>
              </div>

              {/* Add Members */}
              <div className="form-section">
                <label htmlFor="search-users" className="form-label">
                  Add Members *
                </label>
                <div className="search-container">
                  <InputText
                    ref={searchInputRef}
                    id="search-users"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users to add..."
                    className="search-input"
                    aria-describedby="search-help"
                  />
                  {isSearching && (
                    <div className="search-loading">
                      <i className="pi pi-spinner pi-spin" />
                    </div>
                  )}
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="search-results" role="listbox">
                      {searchResults.map((user, index) => renderSearchResult(user, index))}
                    </div>
                  )}
                  
                  {query && searchResults.length === 0 && !isSearching && (
                    <div className="search-empty">
                      No users found for "{query}"
                    </div>
                  )}
                </div>
                <div id="search-help" className="form-help">
                  Type to search for users. Use arrow keys to navigate, Enter to select.
                </div>
              </div>

              {/* Selected Members */}
              {selectedUsers.length > 0 && (
                <div className="form-section">
                  <label className="form-label">
                    Selected Members ({selectedUsers.length}/{MAX_MEMBERS})
                  </label>
                  <div className="selected-users">
                    {selectedUsers.map(renderSelectedUser)}
                  </div>
                  {selectedUsers.length >= MAX_MEMBERS && (
                    <div className="error-text">
                      Maximum {MAX_MEMBERS} members allowed
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <Button
                label="Cancel"
                onClick={handleClose}
                className="action-button"
                outlined
                disabled={isCreating}
              />
              <Button
                label="Create Group"
                onClick={handleCreateGroup}
                className="action-button primary"
                loading={isCreating}
                disabled={!isFormValid}
              />
            </div>

            {/* Toast */}
            <Toast 
              ref={toast} 
              position="top-right"
              className="custom-toast"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;
