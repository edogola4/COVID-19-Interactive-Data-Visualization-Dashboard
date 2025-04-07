// src/redux/reducers/dataReducer.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  global: {
    data: null,
    loading: false,
    error: null,
  },
  countries: {
    list: [],
    data: {},
    loading: false,
    error: null,
  },
  historical: {
    global: null,
    countries: {},
    loading: false,
    error: null,
  },
  vaccines: {
    global: null,
    countries: {},
    loading: false,
    error: null,
  },
  selectedCountry: 'all',
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  },
  filters: {
    metric: 'cases', // 'cases', 'deaths', 'recovered', 'active', 'tests', 'vaccinated'
    perCapita: false,
    showAverage: false,
    compareMode: false,
    comparedCountries: [],
  },
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Global data actions
    fetchGlobalDataStart(state) {
      state.global.loading = true;
      state.global.error = null;
    },
    fetchGlobalDataSuccess(state, action) {
      state.global.loading = false;
      state.global.data = action.payload;
    },
    fetchGlobalDataFailure(state, action) {
      state.global.loading = false;
      state.global.error = action.payload;
    },
    
    // Countries data actions
    fetchCountriesStart(state) {
      state.countries.loading = true;
      state.countries.error = null;
    },
    fetchCountriesSuccess(state, action) {
      state.countries.loading = false;
      state.countries.list = action.payload;
      
      // Create a map for quick access to country data by country code
      const countryMap = {};
      action.payload.forEach((country) => {
        countryMap[country.countryInfo.iso3] = country;
      });
      state.countries.data = countryMap;
    },
    fetchCountriesFailure(state, action) {
      state.countries.loading = false;
      state.countries.error = action.payload;
    },
    
    // Historical data actions
    fetchHistoricalStart(state) {
      state.historical.loading = true;
      state.historical.error = null;
    },
    fetchHistoricalSuccess(state, action) {
      state.historical.loading = false;
      if (action.payload.country === 'all') {
        state.historical.global = action.payload.data;
      } else {
        state.historical.countries[action.payload.country] = action.payload.data;
      }
    },
    fetchHistoricalFailure(state, action) {
      state.historical.loading = false;
      state.historical.error = action.payload;
    },
    
    // Vaccine data actions
    fetchVaccineStart(state) {
      state.vaccines.loading = true;
      state.vaccines.error = null;
    },
    fetchVaccineSuccess(state, action) {
      state.vaccines.loading = false;
      if (action.payload.country === 'all') {
        state.vaccines.global = action.payload.data;
      } else {
        state.vaccines.countries[action.payload.country] = action.payload.data;
      }
    },
    fetchVaccineFailure(state, action) {
      state.vaccines.loading = false;
      state.vaccines.error = action.payload;
    },
    
    // UI interaction actions
    setSelectedCountry(state, action) {
      state.selectedCountry = action.payload;
    },
    setDateRange(state, action) {
      state.dateRange = action.payload;
    },
    setMetric(state, action) {
      state.filters.metric = action.payload;
    },
    togglePerCapita(state) {
      state.filters.perCapita = !state.filters.perCapita;
    },
    toggleShowAverage(state) {
      state.filters.showAverage = !state.filters.showAverage;
    },
    toggleCompareMode(state) {
      state.filters.compareMode = !state.filters.compareMode;
    },
    addComparedCountry(state, action) {
      if (!state.filters.comparedCountries.includes(action.payload)) {
        state.filters.comparedCountries.push(action.payload);
      }
    },
    removeComparedCountry(state, action) {
      state.filters.comparedCountries = state.filters.comparedCountries.filter(
        (country) => country !== action.payload
      );
    },
  },
});

export const {
  fetchGlobalDataStart,
  fetchGlobalDataSuccess,
  fetchGlobalDataFailure,
  fetchCountriesStart,
  fetchCountriesSuccess,
  fetchCountriesFailure,
  fetchHistoricalStart,
  fetchHistoricalSuccess,
  fetchHistoricalFailure,
  fetchVaccineStart,
  fetchVaccineSuccess,
  fetchVaccineFailure,
  setSelectedCountry,
  setDateRange,
  setMetric,
  togglePerCapita,
  toggleShowAverage,
  toggleCompareMode,
  addComparedCountry,
  removeComparedCountry,
} = dataSlice.actions;

export default dataSlice.reducer;