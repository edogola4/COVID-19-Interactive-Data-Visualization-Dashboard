// src/components/dashboard/Dashboard.js
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobalStats, fetchAllCountries, fetchHistoricalTimeline } from '../../redux/reducers/dataReducer';
import { setActivePage, addNotification } from '../../redux/reducers/uiReducer';
import StatisticsPanel from './StatisticsPanel';
import CountrySelector from './CountrySelector';
import DateRangePicker from './DateRangePicker';
import WorldMap from '../charts/WorldMap';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import PieChart from '../charts/PieChart';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Filter from '../common/Filter';
import { formatNumber, calculateGrowthRate } from '../../utils/formatters';
import '../../styles/components/dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { 
    global,
    countries,
    historical,
    selectedMetric,
    selectedCountries,
    dateRange
  } = useSelector(state => state.data);
  
  const { 
    theme, 
    dataView, 
    isMobileView,
    dataUpdateInterval 
  } = useSelector(state => state.ui);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Set active page on component mount
  useEffect(() => {
    dispatch(setActivePage('dashboard'));
  }, [dispatch]);

  // Initial data fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          dispatch(fetchGlobalStats()),
          dispatch(fetchAllCountries()),
          dispatch(fetchHistoricalTimeline({ days: 30 }))
        ]);
        
        dispatch(addNotification({
          type: 'success',
          message: 'Dashboard data loaded successfully',
          duration: 3000
        }));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to load dashboard data',
          duration: 5000
        }));
      }
    };

    fetchInitialData();
    
    // Set up interval for data refreshing
    const intervalId = setInterval(() => {
      refreshData();
    }, dataUpdateInterval);
    
    return () => clearInterval(intervalId);
  }, [dispatch, dataUpdateInterval]);

  // Manual data refresh
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchGlobalStats()),
        dispatch(fetchAllCountries())
      ]);
      
      dispatch(addNotification({
        type: 'info',
        message: 'Dashboard data refreshed',
        duration: 2000
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to refresh data',
        duration: 5000
      }));
    } finally {
      setRefreshing(false);
    }
  };

  // Process data for charts
  const processedData = useMemo(() => {
    if (!countries.data.length || !historical.data) return null;
    
    // Format data for charts based on selectedMetric and dateRange
    return {
      mapData: countries.data.map(country => ({
        id: country.countryInfo.iso3,
        name: country.country,
        value: country[selectedMetric],
        valuePerMillion: country[`${selectedMetric}PerOneMillion`] || 0,
        lat: country.countryInfo.lat,
        long: country.countryInfo.long,
        flag: country.countryInfo.flag
      })),
      timelineData: historical.data?.timeline || historical.data
    };
  }, [countries.data, historical.data, selectedMetric]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!global.data) return null;
    
    const data = global.data;
    return [
      {
        title: 'Total Cases',
        value: formatNumber(data.cases),
        today: formatNumber(data.todayCases),
        growth: calculateGrowthRate(data.cases - data.todayCases, data.cases),
        color: 'blue'
      },
      {
        title: 'Active Cases',
        value: formatNumber(data.active),
        percent: ((data.active / data.cases) * 100).toFixed(1) + '%',
        color: 'orange'
      },
      {
        title: 'Recovered',
        value: formatNumber(data.recovered),
        percent: ((data.recovered / data.cases) * 100).toFixed(1) + '%',
        color: 'green'
      },
      {
        title: 'Deaths',
        value: formatNumber(data.deaths),
        today: formatNumber(data.todayDeaths),
        growth: calculateGrowthRate(data.deaths - data.todayDeaths, data.deaths),
        color: 'red'
      }
    ];
  }, [global.data]);

  // Loading state handling
  if (global.loading && countries.loading && !global.data) {
    return <Loader message="Loading dashboard data..." />;
  }

  return (
    <div className={`dashboard dashboard--${theme}`}>
      <div className="dashboard__header">
        <h1 className="dashboard__title">COVID-19 Global Dashboard</h1>
        <div className="dashboard__actions">
          <button 
            className="dashboard__refresh-btn"
            onClick={refreshData}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <Filter />
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="dashboard__summary">
        {summaryStats && summaryStats.map((stat, index) => (
          <Card key={index} className={`stat-card stat-card--${stat.color}`}>
            <h3 className="stat-card__title">{stat.title}</h3>
            <p className="stat-card__value">{stat.value}</p>
            {stat.today && (
              <p className="stat-card__today">
                Today: <span>{stat.today}</span>
              </p>
            )}
            {stat.growth && (
              //</Card><p className={`stat-car
              <p className={`stat-card__growth ${stat.growth > 0 ? 'positive' : 'negative'}`}>
                  {stat.growth > 0 ? '+' : ''}{stat.growth}%
                </p>
              )}
            {stat.percent && (
              <p className="stat-card__percent">{stat.percent}</p>
            )}
          </Card>
        ))}
      </div>
      
      {/* Control Panel */}
      <div className="dashboard__controls">
        <div className="control-panel">
          <div className="control-panel__section">
            <h3>View Options</h3>
            <div className="tab-selector">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
                onClick={() => setActiveTab('trends')}
              >
                Trends
              </button>
              <button 
                className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
                onClick={() => setActiveTab('comparison')}
              >
                Comparison
              </button>
            </div>
          </div>
          
          <div className="control-panel__section">
            <CountrySelector />
          </div>
          
          <div className="control-panel__section">
            <DateRangePicker />
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="dashboard__content">
        {activeTab === 'overview' && (
          <>
            <Card className="map-container">
              <h2>Global {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Distribution</h2>
              {processedData ? (
                <WorldMap 
                  data={processedData.mapData} 
                  metric={selectedMetric}
                />
              ) : (
                <Loader size="medium" />
              )}
            </Card>
            
            <div className="chart-grid">
              <Card className="chart-container">
                <h2>Top 10 Countries by {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}</h2>
                {countries.data.length > 0 ? (
                  <BarChart 
                    data={countries.data.slice(0, 10)} 
                    metric={selectedMetric} 
                    horizontal={true}
                  />
                ) : (
                  <Loader size="medium" />
                )}
              </Card>
              
              <Card className="chart-container">
                <h2>Global Distribution</h2>
                {global.data ? (
                  <PieChart 
                    data={{
                      active: global.data.active,
                      recovered: global.data.recovered,
                      deaths: global.data.deaths
                    }} 
                  />
                ) : (
                  <Loader size="medium" />
                )}
              </Card>
            </div>
          </>
        )}
        
        {activeTab === 'trends' && (
          <Card className="chart-container chart-container--full">
            <h2>Global Trends Over Time</h2>
            {processedData?.timelineData ? (
              <LineChart 
                data={processedData.timelineData} 
                dateRange={dateRange} 
                metrics={['cases', 'deaths', 'recovered']} 
              />
            ) : (
              <Loader size="medium" />
            )}
          </Card>
        )}
        
        {activeTab === 'comparison' && (
          <div className="comparison-container">
            {selectedCountries.length > 0 ? (
              <>
                <Card className="chart-container chart-container--full">
                  <h2>Country Comparison: {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}</h2>
                  <BarChart 
                    data={countries.data.filter(country => 
                      selectedCountries.includes(country.countryInfo.iso3)
                    )} 
                    metric={selectedMetric} 
                    horizontal={false}
                    showLabels={true}
                  />
                </Card>
                
                <Card className="chart-container chart-container--full">
                  <h2>Per Million Comparison</h2>
                  <BarChart 
                    data={countries.data.filter(country => 
                      selectedCountries.includes(country.countryInfo.iso3)
                    )} 
                    metric={`${selectedMetric}PerOneMillion`} 
                    horizontal={false}
                    showLabels={true}
                  />
                </Card>
              </>
            ) : (
              <div className="empty-state">
                <p>Select countries to compare using the country selector</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Last Updated Info */}
      <div className="dashboard__footer">
        <p className="last-updated">
          Last updated: {global.lastUpdated ? new Date(global.lastUpdated).toLocaleString() : 'Never'}
        </p>
        <p className="data-source">
          Data source: <a href="https://disease.sh/" target="_blank" rel="noopener noreferrer">disease.sh</a>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;