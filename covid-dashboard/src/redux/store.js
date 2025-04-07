// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './reducers/dataReducer';
import uiReducer from './reducers/uiReducer';

const store = configureStore({
  reducer: {
    data: dataReducer,
    ui: uiReducer,
  },
  // Enable Redux DevTools extension in development
  devTools: process.env.NODE_ENV !== 'production',
  // Add middleware if needed
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Disable for handling non-serializable data like Date objects
    }),
});

export default store;