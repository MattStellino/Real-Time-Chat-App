import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMe, updateProfile, updatePreferences, changePassword, getUserProfile } from '../lib/userApi';

export const SET_USER = 'SET_USER';
export const CLEAR_USER = 'CLEAR_USER';
export const UPDATE_USER = 'UPDATE_USER';
export const SET_VIEWING_USER = 'SET_VIEWING_USER';
export const CLEAR_VIEWING_USER = 'CLEAR_VIEWING_USER';

export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const clearUser = () => ({
  type: CLEAR_USER,
});

export const updateUser = (user) => ({
  type: UPDATE_USER,
  payload: user,
});

export const setViewingUser = (user) => ({
  type: SET_VIEWING_USER,
  payload: user,
});

export const clearViewingUser = () => ({
  type: CLEAR_VIEWING_USER,
});

// Async thunk actions for profile management
export const fetchMe = createAsyncThunk(
  'user/fetchMe',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) throw new Error('No authentication token');
      
      const user = await getMe(token);
      return user;
    } catch (error) {
      console.error('Fetch user error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId, { getState, rejectWithValue }) => {
    try {
      // Get token from localStorage instead of Redux state
      const token = localStorage.getItem('token');
      
      if (!token) throw new Error('No authentication token');
      
      const user = await getUserProfile(userId, token);
      return user;
    } catch (error) {
      console.error('❌ fetchUserProfile thunk error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const saveProfile = createAsyncThunk(
  'user/saveProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) throw new Error('No authentication token');
      
      const updatedUser = await updateProfile(profileData, token);
      return updatedUser;
    } catch (error) {
      console.error('Save profile error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const savePreferences = createAsyncThunk(
  'user/savePreferences',
  async (preferences, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) throw new Error('No authentication token');
      
      const updatedUser = await updatePreferences(preferences, token);
      return updatedUser;
    } catch (error) {
      console.error('Save preferences error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const savePassword = createAsyncThunk(
  'user/savePassword',
  async (passwordData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) throw new Error('No authentication token');
      
      const result = await changePassword(passwordData, token);
      return result;
    } catch (error) {
      console.error('Change password error:', error);
      return rejectWithValue(error.message);
    }
  }
);