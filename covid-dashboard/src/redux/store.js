// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './reducers/dataReducer';
import uiReducer from './reducers/uiReducer';
import { createSelector } from 'reselect';

// Updated base selectors to match your actual state structure
const getGlobalData = state => state.data.global.data;
const getCountriesData = state => state.data.countries.list;
const getHistoricalData = state => state.data.historical.global;
const getSelectedCountry = state => state.data.selectedCountry;
const getDateRange = state => state.data.dateRange;
const getActiveMetric = state => state.data.filters.metric;

const store = configureStore({
  reducer: {
    data: dataReducer,
    ui: uiReducer,
  },
  // Enable Redux DevTools extension in development
  devTools: process.env.NODE_ENV !== 'production',
  // Add middleware if needed
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Disable for handling non-serializable data like Date objects
    }),
});

// Get sorted countries data
export const getSortedCountriesData = createSelector(
  [getCountriesData, getActiveMetric],
  (countriesData, activeMetric) => {
    if (!countriesData || !countriesData.length) return [];
    
    return [...countriesData].sort((a, b) => b[activeMetric] - a[activeMetric]);
  }
);

// Get top countries by active metric
export const getTopCountriesByMetric = createSelector(
  [getSortedCountriesData],
  (sortedCountries) => {
    return sortedCountries.slice(0, 10);
  }
);

// Get continent summary data
export const getContinentSummary = createSelector(
  [getCountriesData],
  (countriesData) => {
    if (!countriesData || !countriesData.length) return [];
    
    const continentData = {};
    
    countriesData.forEach(country => {
      if (!country.continent) return;
      
      if (!continentData[country.continent]) {
        continentData[country.continent] = {
          continent: country.continent,
          cases: 0,
          deaths: 0,
          recovered: 0,
          active: 0,
          tests: 0,
          population: 0,
          countries: 0
        };
      }
      
      continentData[country.continent].cases += country.cases || 0;
      continentData[country.continent].deaths += country.deaths || 0;
      continentData[country.continent].recovered += country.recovered || 0;
      continentData[country.continent].active += country.active || 0;
      continentData[country.continent].tests += country.tests || 0;
      continentData[country.continent].population += country.population || 0;
      continentData[country.continent].countries += 1;
    });
    
    return Object.values(continentData);
  }
);

// Get filtered historical data based on date range
export const getFilteredHistoricalData = createSelector(
  [getHistoricalData, getDateRange],
  (historicalData, dateRange) => {
    if (!historicalData) return null;
    
    const { start, end } = dateRange;
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const filteredData = {};
    
    for (const [metric, timelineData] of Object.entries(historicalData.timeline || historicalData)) {
      filteredData[metric] = {};
      
      for (const [dateStr, value] of Object.entries(timelineData)) {
        const [month, day, year] = dateStr.split('/');
        const date = new Date(`20${year}`, month - 1, day);
        
        if (date >= startDate && date <= endDate) {
          filteredData[metric][dateStr] = value;
        }
      }
    }
    
    return historicalData.timeline ? { ...historicalData, timeline: filteredData } : filteredData;
  }
);

// Get selected country data
export const getSelectedCountryData = createSelector(
  [getCountriesData, getSelectedCountry],
  (countriesData, selectedCountry) => {
    if (!selectedCountry || selectedCountry === 'all' || !countriesData || !countriesData.length) return null;
    
    return countriesData.find(country => country.country === selectedCountry);
  }
);

// Get global or selected country data
export const getCurrentViewData = createSelector(
  [getGlobalData, getSelectedCountryData, getSelectedCountry],
  (globalData, selectedCountryData, selectedCountry) => {
    return selectedCountry === 'all' ? globalData : selectedCountryData;
  }
);

export default store;