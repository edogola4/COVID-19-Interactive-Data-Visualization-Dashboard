// src / App.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ThemeProvider from './components/ui/ThemeProvider';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loader from './components/common/Loader';
import { fetchDashboardData } from './redux/actions/dataActions';
import { toggleSidebar, setTheme } from './redux/actions/uiActions';
import './styles/global.css';

const App = () => {
  const dispatch = useDispatch();
  const { theme, sidebar, loading } = useSelector(state => state.ui);
  const darkMode = theme === 'dark';
  const sidebarOpen = sidebar.open;
  
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load initial data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchDashboardData());
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setInitialLoadComplete(true);
      }
    };
    
    loadData();
    
    // Handle responsive sidebar based on screen size
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        dispatch(toggleSidebar());
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, sidebarOpen]);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Determine if any part of the UI is loading
  const isLoading = loading.global || loading.maps || loading.charts;

  return (
    <ThemeProvider defaultTheme={darkMode ? 'dark' : 'light'}>
      <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <ErrorBoundary showDetails={true} onRetry={() => dispatch(fetchDashboardData())}>
              {(!initialLoadComplete || isLoading) ? (
                <div className="loading-container">
                  <Loader size="large" />
                  <p>Loading COVID-19 dashboard data...</p>
                </div>
              ) : (
                <Dashboard />
              )}
            </ErrorBoundary>
          </main>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;