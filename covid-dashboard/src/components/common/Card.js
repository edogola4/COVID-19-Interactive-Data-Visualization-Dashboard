// src / components / common / Card.js
import React from 'react';

const Card = ({ title, value, trend }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{value.toLocaleString()}</p>
      <span className={trend > 0 ? 'trend-up' : 'trend-down'}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}</span>
    </div>
  );
};

export default React.memo(Card);