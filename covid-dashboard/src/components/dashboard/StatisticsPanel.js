// src / components / dashboard / StatisticsPanel.js
import React from 'react';
import Card from '../common/Card';

const StatisticsPanel = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="statistics-panel">
      <Card title="Total Cases" value={stats.cases} trend={stats.newCases} />
      <Card title="Total Deaths" value={stats.deaths} trend={stats.newDeaths} />
      <Card title="Total Recoveries" value={stats.recoveries} trend={stats.newRecoveries} />
    </div>
  );
};

export default StatisticsPanel;