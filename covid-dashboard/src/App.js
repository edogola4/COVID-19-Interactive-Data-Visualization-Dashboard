import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/global.css';

const App = () => {
  const { darkMode } = useSelector(state => state.ui);
  
  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);
  
  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="dashboard-container">
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;