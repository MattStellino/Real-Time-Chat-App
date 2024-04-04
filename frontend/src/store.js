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
});

export const persistor = persistStore(store);

export default store; 