// actionTypes.js
export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGOUT = 'USER_LOGOUT';

export const loginUser = (userInfo) =>  {
  return {
    type: USER_LOGIN,
    payload: userInfo,
  };
};


export const logout = () => ({
  type: USER_LOGOUT,
});
