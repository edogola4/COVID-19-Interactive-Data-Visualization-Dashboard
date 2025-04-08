// src/components/layout/Sidebar.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/actions/uiActions';
//import '../../styles/components/sidebar.css';
import '../../styles/components/layout.css';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);

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

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <header className="sidebar-header">
          <h2>Explore Data</h2>
        </header>

        <nav className="sidebar-nav">
          <section className="nav-section">
            <h3>Views</h3>
            <ul>
              <li><a href="#overview" className="active">Overview</a></li>
              <li><a href="#trends">Trends &amp; Forecasts</a></li>
              <li><a href="#vaccination">Vaccination Progress</a></li>
              <li><a href="#testing">Testing Data</a></li>
            </ul>
          </section>

          <section className="nav-section">
            <h3>Analysis</h3>
            <ul>
              <li><a href="#comparison">Country Comparison</a></li>
              <li><a href="#hotspots">Current Hotspots</a></li>
              <li><a href="#recovery">Recovery Rates</a></li>
            </ul>
          </section>

          <section className="nav-section">
            <h3>Settings</h3>
            <ul>
              <li><a href="#preferences">Display Preferences</a></li>
              <li><a href="#data-sources">Data Sources</a></li>
              <li><a href="#notifications">Notifications</a></li>
            </ul>
          </section>
        </nav>

        <footer className="sidebar-footer">
          <button className="action-btn save-btn">Save Current View</button>
          <button className="action-btn export-btn">Export Data</button>
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;
