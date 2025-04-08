// src / components / dashboard / Dashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StatisticsPanel from './StatisticsPanel';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import WorldMap from '../charts/WorldMap';
// eslint-disable-next-line no-unused-vars
import PieChart from '../charts/PieChart';
import CountrySelector from './CountrySelector';
import DateRangePicker from './DateRangePicker';
import Card from '../common/Card';
import Loader from '../common/Loader';
import { fetchDashboardData, fetchAllCountriesData } from '../../redux/actions/dataActions';
import { formatDate, formatNumber } from '../../utils/formatters';
// eslint-disable-next-line no-unused-vars
import { transformTimeSeriesData, transformCountryData } from '../../utils/dataTransformers';
import { COLOR_SCALES } from '../../constants/colorScales';
import '../../styles/components/dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { 
    globalData,
    countriesData,
    timelineData,
    selectedCountry,
    selectedDateRange,
    isLoading,
    error
  } = useSelector(state => state.data);
  // eslint-disable-next-line no-unused-vars
  const { darkMode } = useSelector(state => state.ui);
  
  const [activeMetric, setActiveMetric] = useState('cases');
  const [topCountriesData, setTopCountriesData] = useState([]);
  const [mapData, setMapData] = useState(null);
  
  // Load initial dashboard data
  useEffect(() => {
    if (!globalData) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, globalData]);
  
  // Load top countries data when available
  useEffect(() => {
    if (countriesData && countriesData.length > 0) {
      const fetchTop = async () => {
        try {
          const topData = await fetchAllCountriesData(10, activeMetric);
          setTopCountriesData(topData);
        } catch (error) {
          console.error('Error fetching top countries:', error);
        }
      };
      
      fetchTop();
    }
  }, [countriesData, activeMetric]);
  
  // Process data for world map
  useEffect(() => {
    if (countriesData && countriesData.length > 0) {
      // Convert country data array to a format suitable for the map
      const processedData = countriesData.map(country => ({
        ...country,
        countryInfo: country.countryInfo || {}
      }));
      
      setMapData(processedData);
    }
  }, [countriesData]);
  
  // Transform timeline data for charts
  const processedTimelineData = useMemo(() => {
    if (!timelineData) return null;
    
    return transformTimeSeriesData(timelineData, selectedCountry, selectedDateRange);
  }, [timelineData, selectedCountry, selectedDateRange]);
  
  // Calculate daily new cases/deaths for line chart
  const dailyNewData = useMemo(() => {
    if (!processedTimelineData) return null;
    
    const metrics = ['cases', 'deaths', 'recovered'];
    const dailyData = {};
    
    metrics.forEach(metric => {
      if (processedTimelineData[metric]) {
        const data = processedTimelineData[metric];
        const entries = Object.entries(data);
        
        dailyData[metric] = entries.map(([date, total], index) => {
          const prevTotal = index > 0 ? entries[index - 1][1] : 0;
          const newValue = Math.max(0, total - prevTotal); // Ensure no negative values
          
          return {
            date,
            value: newValue,
            series: `new${metric.charAt(0).toUpperCase() + metric.slice(1)}`
          };
        });
      }
    });
    
    return dailyData;
  }, [processedTimelineData]);
  
  // Handle country selection
  const handleCountrySelect = (country) => {
    dispatch(fetchDashboardData(country === 'Global' ? 'all' : country));
  };
  
  // Handle date range change
  const handleDateRangeChange = (range) => {
    // Date range handling logic would go here
    console.log('Date range changed:', range);
  };
  
  // Handle metric change for different visualizations
  const handleMetricChange = (metric) => {
    setActiveMetric(metric);
  };
  
  if (isLoading && !globalData) {
    return (
      <div className="dashboard-loading">
        <Loader size="large" />
        <p>Loading COVID-19 dashboard data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchDashboardData())}>
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>COVID-19 Dashboard</h1>
        <p className="last-updated">
          Last updated: {globalData?.updated ? formatDate(new Date(globalData.updated)) : 'Loading...'}
        </p>
        
        <div className="dashboard-controls">
          <CountrySelector 
            selectedCountry={selectedCountry || 'Global'} 
            onSelectCountry={handleCountrySelect} 
          />
          
          <DateRangePicker 
            onChange={handleDateRangeChange} 
          />
          
          <div className="metric-selector">
            <button 
              className={activeMetric === 'cases' ? 'active' : ''} 
              onClick={() => handleMetricChange('cases')}
            >
              Cases
            </button>
            <button 
              className={activeMetric === 'deaths' ? 'active' : ''} 
              onClick={() => handleMetricChange('deaths')}
            >
              Deaths
            </button>
            <button 
              className={activeMetric === 'recovered' ? 'active' : ''} 
              onClick={() => handleMetricChange('recovered')}
            >
              Recovered
            </button>
          </div>
        </div>
      </div>
      
      <StatisticsPanel 
        data={selectedCountry === 'Global' ? globalData : countriesData?.find(c => c.country === selectedCountry)} 
      />
      
      <div className="dashboard-grid">
        <Card title="COVID-19 Spread Map" className="map-card grid-span-2">
          {mapData ? (
            <WorldMap 
              data={mapData} 
              metric={activeMetric}
              colorRange={COLOR_SCALES[activeMetric] || COLOR_SCALES.cases}
              onCountryClick={(country) => handleCountrySelect(country.country)}
              height={480}
            />
          ) : (
            <Loader />
          )}
        </Card>
        
        <Card title={`${selectedCountry || 'Global'} - ${activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)} Over Time`} className="timeline-card grid-span-2">
          {processedTimelineData && processedTimelineData[activeMetric] ? (
            <LineChart 
              data={Object.entries(processedTimelineData[activeMetric]).map(([date, value]) => ({
                date,
                value,
                series: activeMetric
              }))}
              xLabel="Date"
              yLabel={activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}
              title=""
              colors={[COLOR_SCALES[activeMetric][1]]}
              height={350}
            />
          ) : (
            <Loader />
          )}
        </Card>
        
        <Card title="Daily New Cases" className="daily-card">
          {dailyNewData && dailyNewData.cases ? (
            <LineChart 
              data={dailyNewData.cases.slice(-30)} // Show last 30 days
              xLabel="Date"
              yLabel="New Cases"
              title=""
              colors={[COLOR_SCALES.newCases[1]]}
              height={300}
            />
          ) : (
            <Loader />
          )}
        </Card>
        
        <Card title="Daily New Deaths" className="daily-card">
          {dailyNewData && dailyNewData.deaths ? (
            <LineChart 
              data={dailyNewData.deaths.slice(-30)} // Show last 30 days
              xLabel="Date"
              yLabel="New Deaths"
              title=""
              colors={[COLOR_SCALES.newDeaths[1]]}
              height={300}
            />
          ) : (
            <Loader />
          )}
        </Card>
        
        <Card title={`Top 10 Countries by ${activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}`} className="top-countries-card">
          {topCountriesData && topCountriesData.length > 0 ? (
            <BarChart 
              data={topCountriesData.map(country => ({
                label: country.country,
                value: country[activeMetric],
                series: activeMetric
              }))}
              horizontal={true}
              sortBy="desc"
              maxBars={10}
              xLabel={activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}
              yLabel="Country"
              title=""
              colors={[COLOR_SCALES[activeMetric][1]]}
              height={400}
              tooltipFormat={(d) => `${d.label}: ${formatNumber(d.value)}`}
            />
          ) : (
            <Loader />
          )}
        </Card>
        
        {/* Add more cards and visualizations as needed */}
      </div>
    </div>
  );
};

export default Dashboard;