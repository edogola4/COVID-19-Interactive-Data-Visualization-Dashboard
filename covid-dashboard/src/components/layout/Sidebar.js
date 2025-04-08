// src/components/layout/Sidebar.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/actions/uiActions';
import { FiMenu, FiX, FiSettings, FiBarChart2, FiEye } from 'react-icons/fi';
import '../../styles/components/sidebar.css';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  
  const handleToggle = () => {
    dispatch(toggleSidebar());
  };
  
  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      const toggleBtn = document.querySelector('.sidebar-toggle');
      
      if (sidebarOpen && sidebar && !sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
        dispatch(toggleSidebar());
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, dispatch]);

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={handleToggle}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <header className="sidebar-header">
          <h2>Explore Data</h2>
        </header>
        
        <nav className="sidebar-nav">
          <section className="nav-section">
            <div className="section-header">
              <FiEye className="section-icon" />
              <h3>Views</h3>
            </div>
            <ul>
              <li><a href="#overview" className="active">Overview</a></li>
              <li><a href="#trends">Trends & Forecasts</a></li>
              <li><a href="#vaccination">Vaccination Progress</a></li>
              <li><a href="#testing">Testing Data</a></li>
            </ul>
          </section>
          
          <section className="nav-section">
            <div className="section-header">
              <FiBarChart2 className="section-icon" />
              <h3>Analysis</h3>
            </div>
            <ul>
              <li><a href="#comparison">Country Comparison</a></li>
              <li><a href="#hotspots">Current Hotspots</a></li>
              <li><a href="#recovery">Recovery Rates</a></li>
            </ul>
          </section>
          
          <section className="nav-section">
            <div className="section-header">
              <FiSettings className="section-icon" />
              <h3>Settings</h3>
            </div>
            <ul>
              <li><a href="#preferences">Display Preferences</a></li>
              <li><a href="#data-sources">Data Sources</a></li>
              <li><a href="#notifications">Notifications</a></li>
            </ul>
          </section>
        </nav>
        
        <footer className="sidebar-footer">
          <div className="action-buttons">
            <button className="action-btn save-btn">Save Current View</button>
            <button className="action-btn export-btn">Export Data</button>
          </div>
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;