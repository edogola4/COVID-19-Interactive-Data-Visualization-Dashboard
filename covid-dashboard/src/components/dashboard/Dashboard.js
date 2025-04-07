// src / components / dashboard / Dashboard.js
import React from 'react';
import { useSelector } from 'react-redux';
import StatisticsPanel from './StatisticsPanel';
import CountrySelector from './CountrySelector';
import DateRangePicker from './DateRangePicker';
import WorldMap from '../charts/WorldMap';
import LineChart from '../charts/LineChart';
import Loader from '../common/Loader';
import ErrorBoundary from '../common/ErrorBoundary';

const Dashboard = () => {
  const { globalData, countryData, loading } = useSelector((state) => state.data);

  if (loading) return <Loader />;

  return (
    <ErrorBoundary>
      <div className="dashboard">
        <StatisticsPanel stats={globalData} />
        <CountrySelector />
        <DateRangePicker />
        <WorldMap data={countryData} />
        <LineChart data={countryData.historical || []} />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;