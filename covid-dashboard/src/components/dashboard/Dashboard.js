// src / components / dashboard / Dashboard.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGlobalData, fetchCountriesData } from '../../redux/actions/dataActions';

import StatisticsPanel from './StatisticsPanel';
import CountrySelector from './CountrySelector';
import DateRangePicker from './DateRangePicker';
import WorldMap from '../charts/WorldMap';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import PieChart from '../charts/PieChart';
import Card from '../common/Card';
import Loader from '../common/Loader';
import ErrorBoundary from '../common/ErrorBoundary';
import Filter from '../common/Filter';
import '../../styles/components/dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { 
    globalData, 
    countriesData, 
    historicalData, 
    loading, 
    error 
  } = useSelector(state => state.data);
  const { selectedCountry, dateRange } = useSelector(state => state.ui);
  
  const [activeMetric, setActiveMetric] = useState('cases');
  const metrics = ['cases', 'deaths', 'recovered', 'active'];
  
  useEffect(() => {
    dispatch(fetchGlobalData());
    dispatch(fetchCountriesData());
  }, [dispatch]);
  
  if (loading) return <Loader />;
  if (error) return <div className="error-container">Error: {error}</div>;
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>COVID-19 Dashboard</h1>
        <div className="dashboard-controls">
          <CountrySelector />
          <DateRangePicker />
          <Filter 
            options={metrics}
            activeOption={activeMetric}
            onChange={setActiveMetric}
            label="Metric"
          />
        </div>
      </div>
      
      <ErrorBoundary>
        <StatisticsPanel data={selectedCountry ? countriesData.find(c => c.country === selectedCountry) : globalData} />
      </ErrorBoundary>
      
      <div className="dashboard-grid">
        <Card title="Global Distribution" className="map-card">
          <ErrorBoundary>
            <WorldMap 
              data={countriesData} 
              metric={activeMetric} 
            />
          </ErrorBoundary>
        </Card>
        
        <Card title={`${activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)} Over Time`} className="line-chart-card">
          <ErrorBoundary>
            <LineChart 
              data={historicalData} 
              metric={activeMetric}
              country={selectedCountry}
              dateRange={dateRange}
            />
          </ErrorBoundary>
        </Card>
        
        <Card title="Top 10 Countries" className="bar-chart-card">
          <ErrorBoundary>
            <BarChart 
              data={countriesData} 
              metric={activeMetric}
              limit={10}
            />
          </ErrorBoundary>
        </Card>
        
        <Card title="Distribution by Continent" className="pie-chart-card">
          <ErrorBoundary>
            <PieChart 
              data={countriesData} 
              metric={activeMetric}
              groupBy="continent"
            />
          </ErrorBoundary>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;