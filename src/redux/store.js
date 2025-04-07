// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './reducers/dataReducer';
import uiReducer from './reducers/uiReducer';

const store = configureStore({
  reducer: {
    data: dataReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;