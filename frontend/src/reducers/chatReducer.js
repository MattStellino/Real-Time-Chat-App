import { 
  SET_SELECTED_CHAT, SELECTED_USER, SET_NOTIFICATION, SET_CHATS, SET_LOADING_CHATS, SET_CHATS_ERROR, 
  USER_LOGOUT, RESET_SELECTED_CHAT, UPDATE_CHAT, ADD_CHAT_USER, REMOVE_CHAT_USER, ENSURE_CHAT_IN_SIDEBAR,
  OPEN_CHAT_DETAILS, CLOSE_CHAT_DETAILS, TOGGLE_SEARCH_IN_CHAT, TOGGLE_EDIT_CONTACT,
  PIN_CHAT, MUTE_CHAT, CLEAR_CHAT_MESSAGES, DELETE_CHAT, UPDATE_CONTACT_ALIAS, EXPORT_CHAT,
  SET_PENDING_ACTION, UPDATE_READ_RECEIPTS, UPDATE_UNREAD_COUNT, MARK_CHAT_AS_READ, UPDATE_GROUP_CHAT_TITLE,
  ADD_USER_TO_GROUP, REMOVE_USER_FROM_GROUP, LEAVE_GROUP, REFRESH_SELECTED_CHAT
} from '../actions/chatActions';

const initialState = {
  selectedChat: null,
  user: null,
  notification: [],
  chats: [],
  isLoadingChats: false,
  chatError: null,
  messages: [],
  // UI state for modals and panels
  ui: {
    isDetailsOpen: false,
    detailsForChatId: null,
    isSearchOpen: false,      // for inline search section
    isEditOpen: false,        // for inline edit contact
    pendingAction: null       // 'export'|'clear'|'delete' etc. (for spinners)
  },
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SELECTED_CHAT:
      return { 
        ...state, 
        selectedChat: action.payload,
        // Close any open modals when selecting a new chat
        ui: {
          ...state.ui,
          isDetailsOpen: false,
          detailsForChatId: null,
          isSearchOpen: false,
          isEditOpen: false,
          pendingAction: null,
        }
      };
    case SELECTED_USER:
      return { ...state, user: action.payload };
    case SET_NOTIFICATION:
      return { ...state, notification: action.payload };
    case SET_CHATS:
      return { ...state, chats: action.payload };
    case SET_LOADING_CHATS:
      return { ...state, isLoadingChats: action.payload };
    case SET_CHATS_ERROR:
      return { ...state, chatError: action.payload };
    case USER_LOGOUT:
      return { 
        ...initialState,
        // Ensure all modal states are closed on logout
        ui: {
          isDetailsOpen: false,
          detailsForChatId: null,
          isSearchOpen: false,
          isEditOpen: false,
          pendingAction: null,
        }
      }; 
    case RESET_SELECTED_CHAT:
      return {
        ...state, 
        selectedChat: null,
        // Close any open modals when resetting selected chat
        ui: {
          ...state.ui,
          isDetailsOpen: false,
          detailsForChatId: null,
          isSearchOpen: false,
          isEditOpen: false,
          pendingAction: null,
        }
      };
    case UPDATE_CHAT:
      return {
        ...state,
        chats: state.chats.map(chat => 
          chat._id === action.payload._id ? action.payload : chat
        ),
      };
    case ADD_CHAT_USER:
    case REMOVE_CHAT_USER:
      return {
        ...state,
        selectedChat: action.payload,
      };
    case ENSURE_CHAT_IN_SIDEBAR:
      const chatToAdd = action.payload;
      const existingChatIndex = state.chats.findIndex(chat => 
        chat._id === chatToAdd._id || chat.id === chatToAdd.id || chat.id === chatToAdd._id
      );
      
      if (existingChatIndex === -1) {
        // Chat doesn't exist, add it to the top of the list
        return {
          ...state,
          chats: [chatToAdd, ...state.chats]
        };
      } else {
        // Chat exists, update it
        return {
          ...state,
          chats: state.chats.map((chat, index) => 
            index === existingChatIndex ? chatToAdd : chat
          )
        };
      }
    
    // Read Receipt Actions
    case UPDATE_READ_RECEIPTS:
      return {
        ...state,
        messages: state.messages.map(message => 
          message._id === action.payload.messageId 
            ? { ...message, readBy: action.payload.readBy }
            : message
        )
      };
    
    case UPDATE_UNREAD_COUNT:
      return {
        ...state,
        chats: state.chats.map(chat => {
          if (chat._id === action.payload.chatId) {
            const chatObj = { ...chat };
            
            // Create a new unreadCounts array
            let newUnreadCounts = [...(chatObj.unreadCounts || [])];
            
            const existingCountIndex = newUnreadCounts.findIndex(
              uc => uc.user === action.payload.userId
            );
            
            if (existingCountIndex !== -1) {
              // Update existing count with new immutable array
              newUnreadCounts = [
                ...newUnreadCounts.slice(0, existingCountIndex),
                { ...newUnreadCounts[existingCountIndex], count: action.payload.count },
                ...newUnreadCounts.slice(existingCountIndex + 1)
              ];
            } else {
              // Add new unread count
              newUnreadCounts = [
                ...newUnreadCounts,
                { user: action.payload.userId, count: action.payload.count }
              ];
            }
            
            // Return new chat object with immutable updates
            return {
              ...chatObj,
              unreadCounts: newUnreadCounts,
              unreadCount: action.payload.count
            };
          }
          return chat;
        })
      };
    
    case MARK_CHAT_AS_READ:
      return {
        ...state,
        chats: state.chats.map(chat => {
          if (chat._id === action.payload.chatId) {
            const chatObj = { ...chat };
            if (!chatObj.unreadCounts) {
              chatObj.unreadCounts = [];
            }
            
            const userUnreadCount = chatObj.unreadCounts.find(
              uc => uc.user === action.payload.userId
            );
            
            if (userUnreadCount) {
              userUnreadCount.count = 0;
            }
            
            // Update the unreadCount for display
            chatObj.unreadCount = 0;
            return chatObj;
          }
          return chat;
        })
      };

    case UPDATE_GROUP_CHAT_TITLE:
      return {
        ...state,
        chats: state.chats.map(chat => {
          if (chat._id === action.payload.chatId) {
            return {
              ...chat,
              chatName: action.payload.newTitle
            };
          }
          return chat;
        }),
        selectedChat: state.selectedChat && state.selectedChat._id === action.payload.chatId
          ? { ...state.selectedChat, chatName: action.payload.newTitle }
          : state.selectedChat
      };

    case ADD_USER_TO_GROUP:
      return {
        ...state,
        chats: state.chats.map(chat => {
          if (chat._id === action.payload.chatId) {
            // Find the user to add from other chats
            let userToAdd = null;
            state.chats.forEach(otherChat => {
              otherChat.users.forEach(user => {
                if (user._id === action.payload.userId) {
                  userToAdd = user;
                }
              });
            });
            
            if (userToAdd && !chat.users.find(u => u._id === userToAdd._id)) {
              return {
                ...chat,
                users: [...chat.users, userToAdd]
              };
            }
          }
          return chat;
        }),
        selectedChat: state.selectedChat && state.selectedChat._id === action.payload.chatId
          ? (() => {
              // Find the user to add from other chats
              let userToAdd = null;
              state.chats.forEach(otherChat => {
                otherChat.users.forEach(user => {
                  if (user._id === action.payload.userId) {
                    userToAdd = user;
                  }
                });
              });
              
              if (userToAdd && !state.selectedChat.users.find(u => u._id === userToAdd._id)) {
                return {
                  ...state.selectedChat,
                  users: [...state.selectedChat.users, userToAdd]
                };
              }
              return state.selectedChat;
            })()
          : state.selectedChat
      };

    case REMOVE_USER_FROM_GROUP:
      return {
        ...state,
        chats: state.chats.map(chat => {
          if (chat._id === action.payload.chatId) {
            return {
              ...chat,
              users: chat.users.filter(user => user._id !== action.payload.userId)
            };
          }
          return chat;
        }),
        selectedChat: state.selectedChat && state.selectedChat._id === action.payload.chatId
          ? {
              ...state.selectedChat,
              users: state.selectedChat.users.filter(user => user._id !== action.payload.userId)
            }
          : state.selectedChat
      };

    case LEAVE_GROUP:
      return {
        ...state,
        chats: state.chats.filter(chat => chat._id !== action.payload.chatId),
        selectedChat: state.selectedChat && state.selectedChat._id === action.payload.chatId
          ? null
          : state.selectedChat
      };

    case REFRESH_SELECTED_CHAT:
      return {
        ...state,
        selectedChat: state.chats.find(chat => chat._id === state.selectedChat?._id) || state.selectedChat
      };

    // Chat Details Actions
    case OPEN_CHAT_DETAILS:
      return {
        ...state,
        ui: {
          ...state.ui,
          isDetailsOpen: true,
          detailsForChatId: action.payload,
        }
      };

    case CLOSE_CHAT_DETAILS:
      return {
        ...state,
        ui: {
          ...state.ui,
          isDetailsOpen: false,
          detailsForChatId: null,
        }
      };

    case TOGGLE_SEARCH_IN_CHAT:
      return {
        ...state,
        ui: {
          ...state.ui,
          isSearchOpen: !state.ui.isSearchOpen,
        }
      };

    case TOGGLE_EDIT_CONTACT:
      return {
        ...state,
        ui: {
          ...state.ui,
          isEditOpen: !state.ui.isEditOpen,
        }
      };

    case SET_PENDING_ACTION:
      return {
        ...state,
        ui: {
          ...state.ui,
          pendingAction: action.payload,
        }
      };

    default:
      return state;
  }
};

export default chatReducer;
