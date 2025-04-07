// src/redux/reducers/uiReducer.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  sidebarOpen: false,
  dataUpdateInterval: 3600000, // 1 hour in milliseconds
  activePage: 'dashboard',
  notifications: [],
  mapView: {
    zoom: 1,
    center: [0, 0],
    metric: 'cases'
  },
  filterPresets: [],
  dataView: 'map', // 'map', 'chart', 'table'
  comparisonMode: false,
  mobileBreakpoint: 768,
  isMobileView: window.innerWidth < 768
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarState: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setMapView: (state, action) => {
      state.mapView = { ...state.mapView, ...action.payload };
    },
    setDataView: (state, action) => {
      state.dataView = action.payload;
    },
    toggleComparisonMode: (state) => {
      state.comparisonMode = !state.comparisonMode;
    },
    setComparisonMode: (state, action) => {
      state.comparisonMode = action.payload;
    },
    setDataUpdateInterval: (state, action) => {
      state.dataUpdateInterval = action.payload;
    },
    addFilterPreset: (state, action) => {
      state.filterPresets.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload
      });
    },
    removeFilterPreset: (state, action) => {
      state.filterPresets = state.filterPresets.filter(
        preset => preset.id !== action.payload
      );
    },
    updateViewportDimensions: (state, action) => {
      state.isMobileView = action.payload < state.mobileBreakpoint;
    }
  }
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarState,
  setActivePage,
  addNotification,
  removeNotification,
  clearNotifications,
  setMapView,
  setDataView,
  toggleComparisonMode,
  setComparisonMode,
  setDataUpdateInterval,
  addFilterPreset,
  removeFilterPreset,
  updateViewportDimensions
} = uiSlice.actions;

export default uiSlice.reducer;