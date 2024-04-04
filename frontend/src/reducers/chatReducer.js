import { SET_SELECTED_CHAT, SELECTED_USER, SET_NOTIFICATION, SET_CHATS, SET_LOADING_CHATS, SET_CHATS_ERROR, USER_LOGOUT, RESET_SELECTED_CHAT, UPDATE_CHAT, ADD_CHAT_USER, REMOVE_CHAT_USER } from '../actions/chatActions';

const initialState = {
  selectedChat: null,
  user: null,
  notification: [],
  chats: [],
  isLoadingChats: false,
  chatError: null,
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SELECTED_CHAT:
      return { ...state, selectedChat: action.payload };
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
      return { ...initialState }; 
    case RESET_SELECTED_CHAT:
      return {...state, selectedChat: null };
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

    default:
      return state;
  }
};

export default chatReducer;
