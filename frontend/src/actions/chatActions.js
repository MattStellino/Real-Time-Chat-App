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



