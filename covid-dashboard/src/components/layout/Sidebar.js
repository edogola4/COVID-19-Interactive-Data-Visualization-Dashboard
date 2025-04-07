// src / components / layout / Sidebar.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/actions/uiActions';
import '../../styles/components/layout.css';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector(state => state.ui);
  
  const handleToggle = () => {
    dispatch(toggleSidebar());
  };
  
  return (
    <>
      <button 
        className="sidebar-toggle" 
        onClick={handleToggle}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? '×' : '☰'}
      </button>
      
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Explore Data</h2>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Views</h3>
            <ul>
              <li><a href="#overview" className="active">Overview</a></li>
              <li><a href="#trends">Trends & Forecasts</a></li>
              <li><a href="#vaccination">Vaccination Progress</a></li>
              <li><a href="#testing">Testing Data</a></li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h3>Analysis</h3>
            <ul>
              <li><a href="#comparison">Country Comparison</a></li>
              <li><a href="#hotspots">Current Hotspots</a></li>
              <li><a href="#recovery">Recovery Rates</a></li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h3>Settings</h3>
            <ul>
              <li><a href="#preferences">Display Preferences</a></li>
              <li><a href="#data-sources">Data Sources</a></li>
              <li><a href="#notifications">Notifications</a></li>
            </ul>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <button className="save-dashboard-btn">Save Current View</button>
          <button className="export-data-btn">Export Data</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;