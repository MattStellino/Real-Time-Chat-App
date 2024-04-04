import { USER_LOGIN, USER_LOGOUT} from '../actions/authActions';

const initialState = {
  isAuthenticated: false, 
  token: null, 
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGIN:
      
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
      };
    case USER_LOGOUT:
      
      return {
        ...state,
        isAuthenticated: false,
        token: null,
      };
    default:
      return state;
  }
};

export default authReducer;