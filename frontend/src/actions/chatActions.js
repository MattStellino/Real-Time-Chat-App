export const SET_SELECTED_CHAT = 'SET_SELECTED_CHAT';
export const SELECTED_USER = 'SET_USER';
export const SET_NOTIFICATION = 'SET_NOTIFICATION';
export const SET_CHATS = 'SET_CHATS';
export const SET_LOADING_CHATS = 'SET_LOADING_CHATS';
export const SET_CHATS_ERROR = 'SET_CHATS_ERROR';
export const RESET_SELECTED_CHAT = 'RESET_SELECTED_CHAT';
export const USER_LOGOUT = 'LOGOUT';
export const UPDATE_CHAT = 'UPDATE_CHAT';
export const ADD_CHAT_USER = 'ADD_CHAT_USER';
export const REMOVE_CHAT_USER = 'REMOVE_CHAT_USER';
export const ENSURE_CHAT_IN_SIDEBAR = 'ENSURE_CHAT_IN_SIDEBAR';

// Chat Details Actions
export const OPEN_CHAT_DETAILS = 'OPEN_CHAT_DETAILS';
export const CLOSE_CHAT_DETAILS = 'CLOSE_CHAT_DETAILS';
export const TOGGLE_SEARCH_IN_CHAT = 'TOGGLE_SEARCH_IN_CHAT';
export const TOGGLE_EDIT_CONTACT = 'TOGGLE_EDIT_CONTACT';
export const PIN_CHAT = 'PIN_CHAT';
export const MUTE_CHAT = 'MUTE_CHAT';
export const CLEAR_CHAT_MESSAGES = 'CLEAR_CHAT_MESSAGES';
export const DELETE_CHAT = 'DELETE_CHAT';
export const UPDATE_CONTACT_ALIAS = 'UPDATE_CONTACT_ALIAS';
export const EXPORT_CHAT = 'EXPORT_CHAT';
export const SET_PENDING_ACTION = 'SET_PENDING_ACTION';
export const UPDATE_GROUP_CHAT_TITLE = 'UPDATE_GROUP_CHAT_TITLE';

// Group Chat Management Actions
export const ADD_USER_TO_GROUP = 'ADD_USER_TO_GROUP';
export const REMOVE_USER_FROM_GROUP = 'REMOVE_USER_FROM_GROUP';
export const LEAVE_GROUP = 'LEAVE_GROUP';
export const REFRESH_SELECTED_CHAT = 'REFRESH_SELECTED_CHAT';

// Read Receipt Actions
export const UPDATE_READ_RECEIPTS = 'UPDATE_READ_RECEIPTS';
export const UPDATE_UNREAD_COUNT = 'UPDATE_UNREAD_COUNT';
export const MARK_CHAT_AS_READ = 'MARK_CHAT_AS_READ';

export const updateChat = (updatedChat) => ({
  type: 'UPDATE_CHAT',
  payload: updatedChat,
});

export const addChatUser = (chat) => ({
  type: 'ADD_CHAT_USER',
  payload: chat,
});

export const removeChatUser = (chat) => ({
  type: 'REMOVE_CHAT_USER',
  payload: chat,
});

export const resetSelectedChat = (chat)  => ({
  type: RESET_SELECTED_CHAT
});

export const setSelectedChat = (chat) => ({
  type: SET_SELECTED_CHAT,
  payload: chat,
});

export const selectedUser = (user) => ({
  type: SELECTED_USER,
  payload: user,
});

export const setChats = (chats) => ({
  type: SET_CHATS,
  payload: chats,
});

export const setLoadingChats = (loading) => ({
  type: SET_LOADING_CHATS,
  payload: loading,
});

export const setChatsError = (error) => ({
  type: SET_CHATS_ERROR,
  payload: error,
});

export const logout = () => ({
  type: USER_LOGOUT,
});

/**
 * Ensure a chat appears in the sidebar (add if not present, don't duplicate)
 * @param {Object} chat - Chat object to ensure in sidebar
 * @returns {Object} Action object
 */
export const ensureChatInSidebar = (chat) => ({
  type: ENSURE_CHAT_IN_SIDEBAR,
  payload: chat,
});

// Chat Details Actions
export const openChatDetails = (chatId) => {
  return {
    type: OPEN_CHAT_DETAILS,
    payload: chatId,
  };
};

export const closeChatDetails = () => {
  return {
    type: CLOSE_CHAT_DETAILS,
  };
};

export const toggleSearchInChat = (open) => ({
  type: TOGGLE_SEARCH_IN_CHAT,
  payload: open,
});

export const toggleEditContact = (open) => ({
  type: TOGGLE_EDIT_CONTACT,
  payload: open,
});

export const pinChat = (chatId, isPinned) => ({
  type: PIN_CHAT,
  payload: { chatId, isPinned },
});

export const muteChat = (chatId, isMuted) => ({
  type: MUTE_CHAT,
  payload: { chatId, isMuted },
});

export const clearChatMessages = (chatId) => (dispatch) => {
  dispatch(setPendingAction('clear'));
  // Simulate API call delay for better UX
  setTimeout(() => {
    dispatch({
      type: CLEAR_CHAT_MESSAGES,
      payload: chatId,
    });
    dispatch(setPendingAction(null));
  }, 500);
};

export const deleteChat = (chatId) => (dispatch) => {
  dispatch(setPendingAction('delete'));
  // Simulate API call delay for better UX
  setTimeout(() => {
    dispatch({
      type: DELETE_CHAT,
      payload: chatId,
    });
    dispatch(setPendingAction(null));
  }, 500);
};

export const updateContactAlias = (chatId, aliasData) => ({
  type: UPDATE_CONTACT_ALIAS,
  payload: { chatId, aliasData },
});

export const setPendingAction = (action) => ({
  type: SET_PENDING_ACTION,
  payload: action,
});

export const exportChat = (chatId, format) => (dispatch, getState) => {
  dispatch(setPendingAction('export'));
  const { chats, messages } = getState().chat;
  const chat = chats.find(c => c._id === chatId);
  
  if (!chat) {
    console.error('Chat not found for export');
    dispatch(setPendingAction(null));
    return;
  }

  // Import the export utilities
  import('../lib/chatUtils').then(({ exportAsJson, exportAsTxt, downloadBlob, generateExportFilename }) => {
    const chatMessages = messages.filter(m => m.chat === chatId);
    const participants = chat.users || [];
    
    let blob;
    if (format === 'json') {
      blob = exportAsJson(chat, chatMessages, participants);
    } else {
      blob = exportAsTxt(chat, chatMessages, participants);
    }
    
    const filename = generateExportFilename(chat, format);
    downloadBlob(blob, filename);
    dispatch(setPendingAction(null));
  }).catch(error => {
    console.error('Export failed:', error);
    dispatch(setPendingAction(null));
  });
};

// Read Receipt Actions
export const updateReadReceipts = (messageId, readBy) => ({
  type: UPDATE_READ_RECEIPTS,
  payload: { messageId, readBy }
});

export const updateUnreadCount = (chatId, userId, count) => ({
  type: UPDATE_UNREAD_COUNT,
  payload: { chatId, userId, count }
});

export const markChatAsRead = (chatId, userId) => ({
  type: MARK_CHAT_AS_READ,
  payload: { chatId, userId }
});

export const updateGroupChatTitle = (chatId, newTitle) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/${chatId}/title`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ chatName: newTitle })
    });

    if (!response.ok) {
      throw new Error('Failed to update group title');
    }

    const updatedChat = await response.json();
    
    // Update Redux state
    dispatch({
      type: UPDATE_GROUP_CHAT_TITLE,
      payload: { chatId, newTitle }
    });

    // Emit socket event for real-time updates
    const socketService = await import('../services/socketService');
    socketService.default.emitGroupUpdate(chatId, 'title', { chatName: newTitle });

    return updatedChat;
  } catch (error) {
    console.error('Error updating group title:', error);
    throw error;
  }
};

// Group Chat Management Actions
export const addUserToGroup = (chatId, userId) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/groupadd`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ chatId, userId })
    });

    if (!response.ok) {
      throw new Error('Failed to add user to group');
    }

    const updatedChat = await response.json();
    
    // Update Redux state
    dispatch({
      type: ADD_USER_TO_GROUP,
      payload: { chatId, userId }
    });

    // Emit socket event for real-time updates
    const socketService = await import('../services/socketService');
    socketService.default.emitGroupUpdate(chatId, 'addUser', { userId });

    return updatedChat;
  } catch (error) {
    console.error('Error adding user to group:', error);
    throw error;
  }
};

export const removeUserFromGroup = (chatId, userId) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/groupleave`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ chatId, userId })
    });

    if (!response.ok) {
      throw new Error('Failed to remove user from group');
    }

    const updatedChat = await response.json();
    
    // Update Redux state
    dispatch({
      type: REMOVE_USER_FROM_GROUP,
      payload: { chatId, userId }
    });

    // Emit socket event for real-time updates
    const socketService = await import('../services/socketService');
    socketService.default.emitGroupUpdate(chatId, 'removeUser', { userId });

    return updatedChat;
  } catch (error) {
    console.error('Error removing user from group:', error);
    throw error;
  }
};

export const leaveGroup = (chatId) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/${chatId}/leave`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to leave group');
    }

    const updatedChat = await response.json();
    
    // Update Redux state
    dispatch({
      type: LEAVE_GROUP,
      payload: { chatId }
    });

    // Emit socket event for real-time updates
    const socketService = await import('../services/socketService');
    socketService.default.emitGroupUpdate(chatId, 'leaveGroup', { userId: getState().user.user._id });

    return updatedChat;
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};


