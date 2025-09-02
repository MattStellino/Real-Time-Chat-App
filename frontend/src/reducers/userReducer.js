import { SET_USER, CLEAR_USER, UPDATE_USER, SET_VIEWING_USER, CLEAR_VIEWING_USER } from '../actions/userActions';

const initialState = {
  user: null,
  viewingUser: null, // For viewing other users' profiles
  loading: false,
  error: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    case CLEAR_USER:
      return {
        ...state,
        user: null,
      };
    case SET_VIEWING_USER:
      return {
        ...state,
        viewingUser: action.payload,
      };
    case CLEAR_VIEWING_USER:
      return {
        ...state,
        viewingUser: null,
      };
    // Handle async thunk actions
    case 'user/fetchMe/pending':
    case 'user/saveProfile/pending':
    case 'user/savePreferences/pending':
    case 'user/savePassword/pending':
    case 'user/fetchUserProfile/pending':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'user/fetchMe/fulfilled':
    case 'user/saveProfile/fulfilled':
    case 'user/savePreferences/fulfilled':
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null,
      };
    case 'user/fetchUserProfile/fulfilled':
      return {
        ...state,
        loading: false,
        viewingUser: action.payload,
        error: null,
      };
    case 'user/savePassword/fulfilled':
      return {
        ...state,
        loading: false,
        error: null,
      };
    case 'user/fetchMe/rejected':
    case 'user/saveProfile/rejected':
    case 'user/savePreferences/rejected':
    case 'user/savePassword/rejected':
    case 'user/fetchUserProfile/rejected':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;
