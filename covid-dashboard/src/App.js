// src / App.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ThemeProvider from './components/ui/ThemeProvider';
//import { ThemeProvider } from '@/components/ui/ThemeProvider';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loader from './components/common/Loader';
import { fetchDashboardData } from './redux/actions/dataActions';
import { toggleSidebar } from './redux/actions/uiActions';
import './styles/global.css';

const App = () => {
  const dispatch = useDispatch();
  const { darkMode, sidebarOpen, isLoading } = useSelector(state => state.ui);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load initial data on component mount
  useEffect(() => {
    dispatch(fetchDashboardData())
      .finally(() => setInitialLoadComplete(true));
      
    // Handle responsive sidebar based on screen size
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        dispatch(toggleSidebar(false));
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

  return (
    <ThemeProvider defaultTheme={darkMode ? 'dark' : 'light'}>
      <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <ErrorBoundary>
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