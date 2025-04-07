// src/redux/reducers/uiReducer.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  sidebar: {
    open: false,
    width: 250,
  },
  activePage: 'dashboard',
  notifications: [],
  layout: {
    gridLayout: 'default', // 'default', 'compact', 'expanded'
    chartSize: 'medium', // 'small', 'medium', 'large'
  },
  dataUpdateInterval: 3600000, // 1 hour in milliseconds
  mapView: {
    zoom: 1,
    center: [0, 0],
    metric: 'cases'
  },
  filterPresets: [],
  dataView: 'map', // 'map', 'chart', 'table'
  comparisonMode: false,
  mobileBreakpoint: 768,
  isMobileView: window.innerWidth < 768,
  loading: {
    global: false,
    maps: false,
    charts: false,
  },
  error: null,
  lastUpdated: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.open = !state.sidebar.open;
    },
    setSidebarOpen: (state, action) => {
      state.sidebar.open = action.payload;
    },
    setSidebarWidth: (state, action) => {
      state.sidebar.width = action.payload;
    },
    
    // Page and layout actions
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    },
    setGridLayout: (state, action) => {
      state.layout.gridLayout = action.payload;
    },
    setChartSize: (state, action) => {
      state.layout.chartSize = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now().toString(),
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
    
    // Map and data view actions
    setMapView: (state, action) => {
      state.mapView = { ...state.mapView, ...action.payload };
    },
    setDataView: (state, action) => {
      state.dataView = action.payload;
    },
    
    // Comparison mode actions
    toggleComparisonMode: (state) => {
      state.comparisonMode = !state.comparisonMode;
    },
    setComparisonMode: (state, action) => {
      state.comparisonMode = action.payload;
    },
    
    // Data update actions
    setDataUpdateInterval: (state, action) => {
      state.dataUpdateInterval = action.payload;
    },
    setLastUpdated: (state, action) => {
      state.lastUpdated = action.payload;
    },
    
    // Filter preset actions
    addFilterPreset: (state, action) => {
      state.filterPresets.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload
      });
    },
    removeFilterPreset: (state, action) => {
      state.filterPresets = state.filterPresets.filter(
        preset => preset.id !== action.payload
      );
    },
    
    // Viewport and loading state actions
    updateViewportDimensions: (state, action) => {
      state.isMobileView = action.payload < state.mobileBreakpoint;
    },
    setLoading: (state, action) => {
      const { component, isLoading } = action.payload;
      state.loading[component] = isLoading;
    },
    
    // Error handling actions
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  // Theme exports
  toggleTheme,
  setTheme,
  
  // Sidebar exports
  toggleSidebar,
  setSidebarOpen,
  setSidebarWidth,
  
  // Page and layout exports
  setActivePage,
  setGridLayout,
  setChartSize,
  
  // Notification exports
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Map and data view exports
  setMapView,
  setDataView,
  
  // Comparison mode exports
  toggleComparisonMode,
  setComparisonMode,
  
  // Data update exports
  setDataUpdateInterval,
  setLastUpdated,
  
  // Filter preset exports
  addFilterPreset,
  removeFilterPreset,
  
  // Viewport and loading state exports
  updateViewportDimensions,
  setLoading,
  
  // Error handling exports
  setError,
  clearError
} = uiSlice.actions;

export default uiSlice.reducer;