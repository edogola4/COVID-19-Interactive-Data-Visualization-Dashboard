// src/redux/actions/uiActions.js
import {
    toggleTheme,
    setSidebarOpen,
    setSidebarWidth,
    setGridLayout,
    setChartSize,
    addNotification,
    removeNotification,
    setLoading,
    setError,
    clearError,
  } from '../reducers/uiReducer';
  
  // Toggle between light and dark theme
  export const toggleThemeAction = () => (dispatch) => {
    dispatch(toggleTheme());
  };
  
  // Control sidebar state
  export const toggleSidebar = (isOpen) => (dispatch) => {
    dispatch(setSidebarOpen(isOpen));
  };
  
  export const changeSidebarWidth = (width) => (dispatch) => {
    dispatch(setSidebarWidth(width));
  };
  
  // Layout customization
  export const changeGridLayout = (layout) => (dispatch) => {
    dispatch(setGridLayout(layout));
  };
  
  export const changeChartSize = (size) => (dispatch) => {
    dispatch(setChartSize(size));
  };
  
  // Notification system
  export const showNotification = (notification) => (dispatch) => {
    const { message, type = 'info', duration = 5000 } = notification;
    
    const notificationObj = {
      message,
      type,
      duration,
    };
    
    dispatch(addNotification(notificationObj));
    
    // Auto-remove notification after duration
    if (duration) {
      setTimeout(() => {
        dispatch(removeNotification(notificationObj.id));
      }, duration);
    }
  };
  
  export const dismissNotification = (id) => (dispatch) => {
    dispatch(removeNotification(id));
  };
  
  // Loading states
  export const setComponentLoading = (component, isLoading) => (dispatch) => {
    dispatch(setLoading({ component, isLoading }));
  };
  
  // Error handling
  export const setGlobalError = (error) => (dispatch) => {
    dispatch(setError(error));
    
    // Also show as notification
    dispatch(showNotification({
      message: error,
      type: 'error',
      duration: 10000, // Show errors for longer
    }));
  };
  
  export const clearGlobalError = () => (dispatch) => {
    dispatch(clearError());
  };

  // Action type
export const SET_SELECTED_COUNTRY = 'SET_SELECTED_COUNTRY';

// Action creator
export const setSelectedCountry = (country) => ({
  type: SET_SELECTED_COUNTRY,
  payload: country,
});

// Define action type
export const SET_DATE_RANGE = 'SET_DATE_RANGE';

// Define and export the action creator
export const setDateRange = (range) => ({
  type: SET_DATE_RANGE,
  payload: range,
});
