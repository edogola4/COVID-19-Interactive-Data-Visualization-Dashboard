// src / utils / dataTransformers.js
/**
 * Data transformation utilities for processing API data for visualization
 */

import { formatDate } from './formatters';

// Transform time series data for line charts
export const transformTimeSeriesData = (data, metric = 'cases', startDate = null, endDate = null) => {
  if (!data || !data.timeline || !data.timeline[metric]) {
    return [];
  }
  
  const timeline = data.timeline[metric];
  const result = Object.entries(timeline)
    .map(([date, value]) => {
      const dateObj = new Date(date);
      return {
        date: dateObj,
        formattedDate: formatDate(dateObj, 'MM/dd/yyyy'), // Using formatDate here
        [metric]: value,
      };
    })
    .sort((a, b) => a.date - b.date);
  
  // Filter by date range if specified
  if (startDate || endDate) {
    return result.filter(item => {
      if (startDate && item.date < new Date(startDate)) return false;
      if (endDate && item.date > new Date(endDate)) return false;
      return true;
    });
  }
  
  return result;
};

// Transform global historical data for multiple metrics
export const transformGlobalHistorical = (data, startDate = null, endDate = null) => {
  if (!data || !data.cases) {
    return [];
  }
  
  const metrics = ['cases', 'deaths', 'recovered'];
  const dates = Object.keys(data.cases);
  
  const result = dates.map(date => {
    const dateObj = new Date(date);
    const item = {
      date: dateObj,
      formattedDate: formatDate(dateObj, 'MM/dd/yyyy'), // Using formatDate here as well
    };
    
    metrics.forEach(metric => {
      if (data[metric] && data[metric][date] !== undefined) {
        item[metric] = data[metric][date];
      }
    });
    
    return item;
  }).sort((a, b) => a.date - b.date);
  
  // Filter by date range if specified
  if (startDate || endDate) {
    return result.filter(item => {
      if (startDate && item.date < new Date(startDate)) return false;
      if (endDate && item.date > new Date(endDate)) return false;
      return true;
    });
  }
  
  return result;
};

// Calculate daily changes from cumulative data
export const calculateDailyChanges = (timeseriesData, metric = 'cases') => {
  if (!timeseriesData || timeseriesData.length < 2) {
    return [];
  }
  
  const result = [];
  
  for (let i = 1; i < timeseriesData.length; i++) {
    const currentDay = timeseriesData[i];
    const previousDay = timeseriesData[i - 1];
    
    // Skip if we don't have both current and previous data
    if (!currentDay[metric] || !previousDay[metric]) continue;
    
    const dailyChange = currentDay[metric] - previousDay[metric];
    
    result.push({
      date: currentDay.date,
      formattedDate: formatDate(currentDay.date, 'MM/dd/yyyy'),
      [`daily${metric.charAt(0).toUpperCase() + metric.slice(1)}`]: dailyChange > 0 ? dailyChange : 0,
    });
  }
  
  return result;
};

// Transform country data for map visualization
export const transformCountriesForMap = (countries, metric = 'cases', perCapita = false) => {
  if (!countries || !countries.length) {
    return [];
  }
  
  return countries.map(country => {
    const { countryInfo, population } = country;
    
    // Skip countries with no geo information
    if (!countryInfo || !countryInfo.lat || !countryInfo.long) {
      return null;
    }
    
    let value = country[metric];
    
    // Calculate per million if needed
    if (perCapita && population) {
      value = (value / population) * 1000000;
    }
    
    return {
      id: countryInfo.iso3,
      name: country.country,
      value,
      latitude: countryInfo.lat,
      longitude: countryInfo.long,
      countryInfo,
      ...country,
    };
  }).filter(Boolean); // Remove null entries
};

// Calculate 7-day moving average
export const calculateMovingAverage = (data, metric, days = 7) => {
  if (!data || data.length < days) {
    return [];
  }
  
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    const startIndex = Math.max(0, i - days + 1);
    const endIndex = i;
    const window = data.slice(startIndex, endIndex + 1);
    
    const sum = window.reduce((acc, item) => acc + (item[metric] || 0), 0);
    const average = sum / window.length;
    
    result.push({
      date: data[i].date,
      formattedDate: formatDate(data[i].date, 'MM/dd/yyyy'),
      [`${metric}Average`]: average,
      ...data[i], // Keep original data
    });
  }
  
  return result;
};

// Group data by continent for visualization
export const groupByContinent = (countries, metric = 'cases') => {
  if (!countries || !countries.length) {
    return [];
  }
  
  const continentMap = {};
  
  countries.forEach(country => {
    const continent = country.continent || 'Unknown';
    
    if (!continentMap[continent]) {
      continentMap[continent] = {
        name: continent,
        [metric]: 0,
        countries: 0,
        population: 0,
      };
    }
    
    continentMap[continent][metric] += country[metric] || 0;
    continentMap[continent].countries += 1;
    continentMap[continent].population += country.population || 0;
  });
  
  return Object.values(continentMap).sort((a, b) => b[metric] - a[metric]);
};

// Prepare data for pie charts
export const preparePieChartData = (data, metric = 'cases', maxSlices = 10) => {
  if (!data || data.length === 0) {
    return [];
  }
  
  // Sort by metric in descending order
  const sortedData = [...data].sort((a, b) => b[metric] - a[metric]);
  
  // Take top N items
  const topItems = sortedData.slice(0, maxSlices);
  
  // Calculate total for "Others" category
  const others = sortedData.slice(maxSlices);
  const othersTotal = others.reduce((sum, item) => sum + (item[metric] || 0), 0);
  
  // Create final dataset
  const result = topItems.map(item => ({
    name: item.country || item.name,
    value: item[metric] || 0,
  }));
  
  // Add "Others" category if there are more items
  if (others.length > 0) {
    result.push({
      name: 'Others',
      value: othersTotal,
    });
  }
  
  return result;
};
