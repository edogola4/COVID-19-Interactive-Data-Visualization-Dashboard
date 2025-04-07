// src/redux/selectors/index.js
import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectGlobalData = state => state.data.global.data;
export const selectCountriesList = state => state.data.countries.list;
export const selectCountriesData = state => state.data.countries.data;
export const selectHistoricalData = state => state.data.historical;
export const selectVaccinesData = state => state.data.vaccines;
export const selectSelectedCountry = state => state.data.selectedCountry;
export const selectDateRange = state => state.data.dateRange;
export const selectFilters = state => state.data.filters;

// UI selectors
export const selectTheme = state => state.ui.theme;
export const selectSidebar = state => state.ui.sidebar;
export const selectLayout = state => state.ui.layout;
export const selectLoadingState = state => state.ui.loading;
export const selectError = state => state.ui.error;
export const selectLastUpdated = state => state.ui.lastUpdated;

// Memoized selectors for derived data

// Returns global data if "all" is selected, otherwise returns data for the selected country
export const selectCurrentCountryData = createSelector(
  [selectCountriesData, selectSelectedCountry, selectGlobalData],
  (countriesData, selectedCountry, globalData) => {
    if (selectedCountry === 'all') {
      return globalData;
    }
    return countriesData[selectedCountry] || null;
  }
);

// Returns historical data for the selected country (or global historical data if "all" is selected)
export const selectCountryHistoricalData = createSelector(
  [selectHistoricalData, selectSelectedCountry],
  (historicalData, selectedCountry) => {
    if (selectedCountry === 'all') {
      return historicalData.global;
    }
    return historicalData.countries[selectedCountry] || null;
  }
);

// Additional memoized selectors

// Selector to determine if any part of the app is loading
export const selectIsLoading = createSelector(
  [selectLoadingState],
  loading => Object.values(loading).some(isLoading => isLoading)
);

// Selector for dashboard data combining global, countries list, and countries data
export const selectDashboardData = createSelector(
  [selectGlobalData, selectCountriesList, selectCountriesData],
  (globalData, countriesList, countriesData) => ({
    global: globalData,
    countriesList,
    countriesData,
  })
);

// Selector for filtered countries based on filters from state.data.filters
// This example assumes filters is an array of objects like { key, value } and that each country object has corresponding keys.
export const selectFilteredCountries = createSelector(
  [selectCountriesList, selectFilters],
  (countries, filters) => {
    if (!filters || filters.length === 0) return countries;
    return countries.filter(country =>
      filters.every(filter => country[filter.key] === filter.value)
    );
  }
);
