// Redux store configuration with persistence
// Combines chat, auth, and user reducers with localStorage persistence
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import chatReducer from './reducers/chatReducer';
import authReducer from './reducers/authReducer';
import userReducer from './reducers/userReducer';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({
  chat: chatReducer,
  auth: authReducer,
  user: userReducer,
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['_persist'],
      },
    }).concat(),
});

export const persistor = persistStore(store);

export default store; 