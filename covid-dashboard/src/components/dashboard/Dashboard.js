// src / components / dashboard / Dashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StatisticsPanel from './StatisticsPanel';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import WorldMap from '../charts/WorldMap';
import PieChart from '../charts/PieChart';
import CountrySelector from './CountrySelector';
import DateRangePicker from './DateRangePicker';
import Card from '../common/Card';
import Loader from '../common/Loader';
import { fetchDashboardData, fetchAllCountriesData } from '../../redux/actions/dataActions';
import { formatDate, formatNumber } from '../../utils/formatters';
import { transformTimeSeriesData, transformCountryData } from '../../utils/dataTransformers';
import { COLOR_SCALES } from '../../constants/colorScales';
import '../../styles/components/dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();

  
<DateRangePicker 
  onChange={handleDateRangeChange} 
  startDate={dateRange?.start}
  endDate={dateRange?.end}
/>

  // Correctly access data from the Redux store based on your actual reducer structure
  const { 
    global,
    countries,
    historical,
    selectedCountry,
    dateRange,
    filters
  } = useSelector(state => state.data);
  
  const { theme, loading: uiLoading } = useSelector(state => state.ui);
  const darkMode = theme === 'dark';
  
  const [activeMetric, setActiveMetric] = useState(filters.metric || 'cases');
  const [topCountriesData, setTopCountriesData] = useState([]);
  const [mapData, setMapData] = useState(null);
  
  // Check if any data is loading
  const isLoading = global.loading || countries.loading || historical.loading;
  // Get current error state
  const error = global.error || countries.error || historical.error;
  
  // Load initial dashboard data if not available
  useEffect(() => {
    if (!global.data) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, global.data]);
  
  // Process countries data for top countries chart when available
  useEffect(() => {
    if (countries.list && countries.list.length > 0) {
      // Sort countries by active metric and take top 10
      const sorted = [...countries.list].sort((a, b) => 
        (b[activeMetric] || 0) - (a[activeMetric] || 0)
      ).slice(0, 10);
      
      setTopCountriesData(sorted);
    }
  }, [countries.list, activeMetric]);
  
  // Process data for world map
  useEffect(() => {
    if (countries.list && countries.list.length > 0) {
      setMapData(countries.list);
    }
  }, [countries.list]);
  
  // Transform timeline data for charts
  const processedTimelineData = useMemo(() => {
    if (!historical.global) return null;
    
    // You would need to implement this function in your dataTransformers.js file
    // For now, we'll just return the raw historical data structure
    return historical.global;
  }, [historical.global]);
  
  // Calculate daily new cases/deaths for line chart
  const dailyNewData = useMemo(() => {
    if (!processedTimelineData) return null;
    
    const metrics = ['cases', 'deaths', 'recovered'];
    const dailyData = {};
    
    // Simple placeholder logic - this should be replaced with your actual implementation
    metrics.forEach(metric => {
      const timeline = processedTimelineData.timeline?.[metric] || {};
      const entries = Object.entries(timeline);
      
      dailyData[metric] = entries.map(([date, total], index) => {
        const prevTotal = index > 0 ? entries[index - 1][1] : 0;
        const newValue = Math.max(0, total - prevTotal);
        
        return {
          date,
          value: newValue,
          series: `new${metric.charAt(0).toUpperCase() + metric.slice(1)}`
        };
      });
    });
    
    return dailyData;
  }, [processedTimelineData]);
  
  // Handle country selection
  const handleCountrySelect = (country) => {
    dispatch({ 
      type: 'data/setSelectedCountry', 
      payload: country === 'Global' ? 'all' : country 
    });
    dispatch(fetchDashboardData(country === 'Global' ? 'all' : country));
  };
  
  // Handle date range change
  const handleDateRangeChange = (range) => {
    dispatch({ 
      type: 'data/setDateRange', 
      payload: range 
    });
  };
  
  // Handle metric change for different visualizations
  const handleMetricChange = (metric) => {
    setActiveMetric(metric);
    dispatch({ 
      type: 'data/setMetric', 
      payload: metric 
    });
  };


  const initialState = {
    // other state...
    dateRange: {
      start: null,
      end: null,
      preset: 30  // Default to 30 days
    },
    // other state...
  };
  
  if (isLoading && !global.data) {
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
  
  // Get the appropriate data for the currently selected country
  const currentData = selectedCountry === 'all' ? 
    global.data : 
    countries.list?.find(c => c.country === selectedCountry);
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>COVID-19 Dashboard</h1>
        <p className="last-updated">
          Last updated: {global.data?.updated ? formatDate(new Date(global.data.updated)) : 'Loading...'}
        </p>
        
        <div className="dashboard-controls">
          <CountrySelector 
            selectedCountry={selectedCountry === 'all' ? 'Global' : selectedCountry} 
            onSelectCountry={handleCountrySelect} 
          />
          
          <DateRangePicker 
            onChange={handleDateRangeChange} 
            startDate={dateRange.start}
            endDate={dateRange.end}
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
      
      <StatisticsPanel data={currentData} />
      
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
        
        {/* Only render timeline chart if data is available */}
        {processedTimelineData && processedTimelineData.timeline && (
          <Card title={`${selectedCountry === 'all' ? 'Global' : selectedCountry} - ${activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)} Over Time`} className="timeline-card grid-span-2">
            {processedTimelineData.timeline[activeMetric] ? (
              <LineChart 
                data={Object.entries(processedTimelineData.timeline[activeMetric]).map(([date, value]) => ({
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
        )}
        
        {dailyNewData && dailyNewData.cases && dailyNewData.cases.length > 0 && (
          <Card title="Daily New Cases" className="daily-card">
            <LineChart 
              data={dailyNewData.cases.slice(-30)} // Show last 30 days
              xLabel="Date"
              yLabel="New Cases"
              title=""
              colors={[COLOR_SCALES.newCases ? COLOR_SCALES.newCases[1] : '#FF9F00']}
              height={300}
            />
          </Card>
        )}
        
        {dailyNewData && dailyNewData.deaths && dailyNewData.deaths.length > 0 && (
          <Card title="Daily New Deaths" className="daily-card">
            <LineChart 
              data={dailyNewData.deaths.slice(-30)} // Show last 30 days
              xLabel="Date"
              yLabel="New Deaths"
              title=""
              colors={[COLOR_SCALES.newDeaths ? COLOR_SCALES.newDeaths[1] : '#FF5252']}
              height={300}
            />
          </Card>
        )}
        
        {topCountriesData && topCountriesData.length > 0 && (
          <Card title={`Top 10 Countries by ${activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}`} className="top-countries-card">
            <BarChart 
              data={topCountriesData.map(country => ({
                label: country.country,
                value: country[activeMetric] || 0,
                series: activeMetric
              }))}
              horizontal={true}
              sortBy="desc"
              maxBars={10}
              xLabel={activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}
              yLabel="Country"
              title=""
              colors={[COLOR_SCALES[activeMetric] ? COLOR_SCALES[activeMetric][1] : '#4CAF50']}
              height={400}
              tooltipFormat={(d) => `${d.label}: ${formatNumber(d.value)}`}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;