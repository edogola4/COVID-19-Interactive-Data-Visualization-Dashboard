// src / components / common / Card.js
import React from 'react';
import '../../styles/components/charts.css';

const Card = ({
  title,
  value,
  subtitle,
  icon,
  // `trend` can be a number (e.g. 25 or -10) or a string ('up' or 'down')
  trend = null,
  // For numeric trends, if no trendValue is provided, we'll use Math.abs(trend)
  trendValue = null,
  color = 'primary',
  onClick = null,
  loading = false
}) => {
  // Format the value if it's a number
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  // Compute trend direction and value
  const computedTrend = (() => {
    if (trend === null) return null;
    if (typeof trend === 'number') {
      return trend > 0 ? 'up' : 'down';
    }
    return trend;
  })();

  const computedTrendValue = (() => {
    if (trend === null) return null;
    if (typeof trend === 'number') {
      return trendValue === null ? Math.abs(trend) : trendValue;
    }
    return trendValue;
  })();

  // Determine trend styling class
  const getTrendColor = () => {
    if (computedTrend === null) return '';
    return computedTrend === 'up' ? 'trend-up' : 'trend-down';
  };

  // Render an SVG arrow based on trend
  const getTrendIcon = () => {
    if (computedTrend === null) return null;
    return computedTrend === 'up' ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    );
  };

  return (
    <div 
      className={`stat-card ${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      {loading ? (
        <div className="card-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <div className="card-header">
            <h3 className="card-title">{title}</h3>
            {icon && <div className="card-icon">{icon}</div>}
          </div>
          
          <div className="card-value">
            {formattedValue}
            {computedTrend !== null && (
              <div className={`card-trend ${getTrendColor()}`}>
                {getTrendIcon()}
                {computedTrendValue !== null && <span className="trend-value">{computedTrendValue}</span>}
              </div>
            )}
          </div>
          
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </>
      )}
    </div>
  );
};

export default React.memo(Card);
