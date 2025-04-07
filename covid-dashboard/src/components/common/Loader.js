// src / components / common / Loader.js
import React from 'react';
import '../../styles/components/charts.css';

const Loader = ({ size = 'medium', text = 'Loading data...' }) => {
  return (
    <div className={`loader-container size-${size}`}>
      <div className="loader-spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;