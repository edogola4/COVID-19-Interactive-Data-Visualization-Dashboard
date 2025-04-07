// src/api/services.js
import axios from 'axios';
import { handleApiError } from '../utils/errorHandlers';

const BASE_URL = process.env.REACT_APP_COVID_API_URL || 'https://disease.sh/v3';
const VACCINATION_URL = process.env.REACT_APP_VACCINATION_API_URL || 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data';

// Create axios instances with default configs
const covidApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for API calls
covidApi.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
covidApi.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error)
);

// API service functions
export const fetchGlobalData = async () => {
  try {
    const response = await covidApi.get('/covid-19/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching global data:', error);
    throw error;
  }
};

export const fetchCountriesData = async () => {
  try {
    const response = await covidApi.get('/covid-19/countries');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries data:', error);
    throw error;
  }
};

export const fetchCountryData = async (countryCode) => {
  try {
    const response = await covidApi.get(`/covid-19/countries/${countryCode}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for country ${countryCode}:`, error);
    throw error;
  }
};

export const fetchHistoricalData = async (countryCode = 'all', lastDays = 'all') => {
  try {
    const endpoint = countryCode === 'all' 
      ? `/covid-19/historical/all?lastdays=${lastDays}` 
      : `/covid-19/historical/${countryCode}?lastdays=${lastDays}`;
    
    const response = await covidApi.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching historical data:`, error);
    throw error;
  }
};

export const fetchVaccinationData = async () => {
  try {
    const response = await axios.get(`${VACCINATION_URL}/vaccinations/vaccinations.json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vaccination data:', error);
    throw error;
  }
};

export const fetchCountryComparisonData = async (countries = []) => {
  if (!countries.length) return [];
  
  try {
    const countryCodes = countries.join(',');
    const response = await covidApi.get(`/covid-19/countries/${countryCodes}`);
    return Array.isArray(response.data) ? response.data : [response.data];
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    throw error;
  }
};

// Export a default object with all services
export default {
  fetchGlobalData,
  fetchCountriesData,
  fetchCountryData,
  fetchHistoricalData,
  fetchVaccinationData,
  fetchCountryComparisonData
};