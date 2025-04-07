// src / components / dashboard / StatisticsPanel.js
import React from 'react';
// eslint-disable-next-line no-unused-vars
import Card from '../common/Card';
import { formatNumber, calculatePercentageChange } from '../../utils/formatters';
import '../../styles/components/dashboard.css';

const StatisticItem = ({ label, value, previousValue, className }) => {
  const percentChange = previousValue ? calculatePercentageChange(value, previousValue) : null;
  
  return (
    <div className={`statistic-item ${className}`}>
      <h3>{label}</h3>
      <div className="statistic-value">{formatNumber(value)}</div>
      {percentChange !== null && (
        <div className={`statistic-change ${percentChange > 0 ? 'increase' : percentChange < 0 ? 'decrease' : ''}`}>
          {percentChange > 0 ? '↑' : percentChange < 0 ? '↓' : ''} {Math.abs(percentChange).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

const StatisticsPanel = ({ data }) => {
  if (!data) return <div className="statistics-panel empty">No data available</div>;
  
  const { cases, deaths, recovered, active, todayCases, todayDeaths, todayRecovered, tests } = data;
  
  return (
    <div className="statistics-panel">
      <StatisticItem 
        label="Total Cases" 
        value={cases} 
        previousValue={cases - todayCases} 
        className="cases"
      />
      <StatisticItem 
        label="Active Cases" 
        value={active} 
        className="active"
      />
      <StatisticItem 
        label="Recovered" 
        value={recovered} 
        previousValue={recovered - todayRecovered} 
        className="recovered"
      />
      <StatisticItem 
        label="Deaths" 
        value={deaths} 
        previousValue={deaths - todayDeaths} 
        className="deaths"
      />
      <StatisticItem 
        label="Total Tests" 
        value={tests} 
        className="tests"
      />
      <StatisticItem 
        label="Case Fatality Rate" 
        value={(deaths / cases * 100).toFixed(2) + '%'} 
        className="rate"
      />
    </div>
  );
};

export default StatisticsPanel;