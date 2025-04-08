// src/redux/actions/dataActions.js
import * as api from '../../api';
import {
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
} from '../reducers/dataReducer';
import { setLastUpdated } from '../reducers/uiReducer';

// Fetch global COVID data
export const fetchGlobalData = () => async (dispatch) => {
  dispatch(fetchGlobalDataStart());
  try {
    const data = await api.fetchGlobalData();
    dispatch(fetchGlobalDataSuccess(data));
    dispatch(setLastUpdated(new Date().toISOString()));
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching global data:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unable to fetch global data';
    dispatch(fetchGlobalDataFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Fetch all countries data
export const fetchAllCountriesData = () => async (dispatch) => {
  dispatch(fetchCountriesStart());
  try {
    const data = await api.fetchAllCountries();
    dispatch(fetchCountriesSuccess(data));
    dispatch(setLastUpdated(new Date().toISOString()));
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching countries data:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unable to fetch countries data';
    dispatch(fetchCountriesFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Fetch historical data
export const fetchHistoricalData = (country = 'all', days = 30) => async (dispatch) => {
  dispatch(fetchHistoricalStart());
  try {
    let data;
    if (country === 'all') {
      data = await api.fetchHistoricalAllData();
    } else {
      data = await api.fetchHistoricalCountryData(country, days);
    }
    dispatch(fetchHistoricalSuccess({
      country,
      data,
    }));
    dispatch(setLastUpdated(new Date().toISOString()));
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unable to fetch historical data';
    dispatch(fetchHistoricalFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Fetch vaccine data
export const fetchVaccineData = (country = 'all') => async (dispatch) => {
  dispatch(fetchVaccineStart());
  try {
    let data;
    if (country === 'all') {
      data = await api.fetchVaccineData();
    } else {
      data = await api.fetchCountryVaccineData(country);
    }
    dispatch(fetchVaccineSuccess({
      country,
      data,
    }));
    dispatch(setLastUpdated(new Date().toISOString()));
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching vaccine data:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unable to fetch vaccine data';
    dispatch(fetchVaccineFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Fetch all necessary data for the dashboard
export const fetchDashboardData = (country = 'all') => async (dispatch) => {
  try {
    // Better error handling for parallel requests
    const results = await Promise.allSettled([
      dispatch(fetchGlobalData()),
      dispatch(fetchAllCountriesData()),
      dispatch(fetchHistoricalData(country)),
      dispatch(fetchVaccineData(country)),
    ]);
    
    // Check if any of the requests failed
    const failedRequests = results
      .filter(result => result.status === 'fulfilled' && result.value.success === false)
      .map(result => result.value.error);
    
    if (failedRequests.length > 0) {
      console.warn('Some dashboard data requests failed:', failedRequests);
      return { success: false, errors: failedRequests };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { success: false, error: error.message || 'Failed to load dashboard data' };
  }
};