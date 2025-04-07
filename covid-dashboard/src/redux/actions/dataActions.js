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
    return data;
  } catch (error) {
    dispatch(fetchGlobalDataFailure(error.message));
    throw error;
  }
};

// Fetch all countries data
export const fetchAllCountriesData = () => async (dispatch) => {
  dispatch(fetchCountriesStart());
  try {
    const data = await api.fetchAllCountries();
    dispatch(fetchCountriesSuccess(data));
    dispatch(setLastUpdated(new Date().toISOString()));
    return data;
  } catch (error) {
    dispatch(fetchCountriesFailure(error.message));
    throw error;
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
    return data;
  } catch (error) {
    dispatch(fetchHistoricalFailure(error.message));
    throw error;
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
    return data;
  } catch (error) {
    dispatch(fetchVaccineFailure(error.message));
    throw error;
  }
};

// Fetch all necessary data for the dashboard
export const fetchDashboardData = (country = 'all') => async (dispatch) => {
  try {
    // Fetch data in parallel for better performance
    await Promise.all([
      dispatch(fetchGlobalData()),
      dispatch(fetchAllCountriesData()),
      dispatch(fetchHistoricalData(country)),
      dispatch(fetchVaccineData(country)),
    ]);
    
    return true;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return false;
  }
};