// src / compnents / layout / Header.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleThemeAction } from '../../redux/actions/uiActions';
import '../../styles/components/layout.css';

const Header = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  
  const handleThemeToggle = () => {
    dispatch(toggleThemeAction());
  };
  
  return (
    <header className="app-header">
      <div className="logo-container">
        <span className="logo">COVID-19 Tracker</span>
      </div>
      
      <nav className="main-nav">
        <ul>
          <li><a href="#dashboard" className="active">Dashboard</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#resources">Resources</a></li>
        </ul>
      </nav>
      
      <div className="header-actions">
        <button 
          className="theme-toggle" 
          onClick={handleThemeToggle}
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        
        <select className="data-source-selector">
          <option value="jhu">Johns Hopkins University</option>
          <option value="who">World Health Organization</option>
        </select>
        
        <div className="last-updated">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </header>
  );
};

export default Header;