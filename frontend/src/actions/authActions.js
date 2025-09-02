// actionTypes.js
export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGOUT = 'USER_LOGOUT';

export const loginUser = (userInfo) =>  {
  // Save token to localStorage for persistence
  if (userInfo && userInfo.token) {
    localStorage.setItem('token', userInfo.token);
  }
  
  return {
    type: USER_LOGIN,
    payload: userInfo,
  };
};

export const logout = () => {
  // Remove token from localStorage
  localStorage.removeItem('token');
  
  return {
    type: USER_LOGOUT,
  };
};
