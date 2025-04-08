// src / components / dashboard / Dashboard.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGlobalData, fetchAllCountriesData } from '../../redux/actions/dataActions';
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
    // Fetch data on component mount
    dispatch(fetchGlobalData());
    dispatch(fetchAllCountriesData());
  }, [dispatch]);

  // Handle initial loading state for the entire dashboard
  if (loading && !globalData && !countriesData) {
    return (
      <div className="loading-container">
        <Loader />
        <p className="loading-text">Loading COVID-19 dashboard data...</p>
      </div>
    );
  }

  // Handle overall error state
  if (error) {
    return (
      <div className="error-container">
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={() => {
            dispatch(fetchGlobalData());
            dispatch(fetchAllCountriesData());
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Get the appropriate data for the selected country or global
  const selectedData = selectedCountry && countriesData ? 
    countriesData.find(c => c.country === selectedCountry) : 
    globalData;

  // Validate that data is available before rendering
  const isDataReady = Boolean(globalData && countriesData && historicalData);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>COVID-19 Dashboard</h1>
        <div className="dashboard-controls">
          <CountrySelector 
            countries={countriesData ? countriesData.map(c => c.country) : []} 
            disabled={!isDataReady} 
          />
          <DateRangePicker disabled={!isDataReady} />
          <Filter
            options={metrics}
            activeOption={activeMetric}
            onChange={setActiveMetric}
            label="Metric"
            disabled={!isDataReady}
          />
        </div>
      </div>

      {/* Only render components when data is available */}
      {isDataReady ? (
        <>
          <ErrorBoundary fallback={<div className="panel-error">Unable to display statistics</div>}>
            <StatisticsPanel data={selectedData} />
          </ErrorBoundary>
          
          <div className="dashboard-grid">
            <Card title="Global Distribution" className="map-card">
              <ErrorBoundary fallback={<div className="chart-error">Unable to display map</div>}>
                {countriesData.length > 0 ? (
                  <WorldMap
                    data={countriesData}
                    metric={activeMetric}
                  />
                ) : (
                  <div className="no-data">No country data available</div>
                )}
              </ErrorBoundary>
            </Card>
            
            <Card title={`${activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)} Over Time`} className="line-chart-card">
              <ErrorBoundary fallback={<div className="chart-error">Unable to display timeline</div>}>
                {historicalData ? (
                  <LineChart
                    data={historicalData}
                    metric={activeMetric}
                    country={selectedCountry}
                    dateRange={dateRange}
                  />
                ) : (
                  <div className="no-data">No historical data available</div>
                )}
              </ErrorBoundary>
            </Card>
            
            <Card title="Top 10 Countries" className="bar-chart-card">
              <ErrorBoundary fallback={<div className="chart-error">Unable to display country ranking</div>}>
                {countriesData.length > 0 ? (
                  <BarChart
                    data={countriesData}
                    metric={activeMetric}
                    limit={10}
                  />
                ) : (
                  <div className="no-data">No country data available</div>
                )}
              </ErrorBoundary>
            </Card>
            
            <Card title="Distribution by Continent" className="pie-chart-card">
              <ErrorBoundary fallback={<div className="chart-error">Unable to display continent data</div>}>
                {countriesData.length > 0 ? (
                  <PieChart
                    data={countriesData}
                    metric={activeMetric}
                    groupBy="continent"
                  />
                ) : (
                  <div className="no-data">No continent data available</div>
                )}
              </ErrorBoundary>
            </Card>
          </div>
        </>
      ) : (
        <div className="partial-loading">
          <Loader />
          <p>Loading visualization data...</p>
        </div>
      )}
      
      <div className="dashboard-footer">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p>Data source: disease.sh API, Johns Hopkins CSSE, WHO</p>
      </div>
    </div>
  );
};

export default Dashboard;