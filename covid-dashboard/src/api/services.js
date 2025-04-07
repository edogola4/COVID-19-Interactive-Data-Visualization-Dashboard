// src/api/service.js
import axios from 'axios';
import { ENDPOINTS } from '../constants/apiEndpoints';

// Create axios instance with default configurations
const apiClient = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors or perform global error handling
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Global data service
export const fetchGlobalData = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.GLOBAL);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching global data');
  }
};

// Country data services
export const fetchAllCountries = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.COUNTRIES);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching countries data');
  }
};

export const fetchCountryData = async (country) => {
  try {
    const response = await apiClient.get(ENDPOINTS.COUNTRY(country));
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching data for ${country}`);
  }
};

// Historical data services
export const fetchHistoricalAllData = async (days = 30) => {
  try {
    const response = await apiClient.get(ENDPOINTS.HISTORICAL_ALL);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching historical global data');
  }
};

export const fetchHistoricalCountryData = async (country, days = 30) => {
  try {
    const response = await apiClient.get(ENDPOINTS.HISTORICAL_COUNTRY(country, days));
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching historical data for ${country}`);
  }
};

// Vaccination data services
export const fetchVaccineData = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.VACCINE);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching vaccine data');
  }
};

export const fetchCountryVaccineData = async (country) => {
  try {
    const response = await apiClient.get(ENDPOINTS.VACCINE_COUNTRY(country));
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching vaccine data for ${country}`);
  }
};

// Continent data service
export const fetchContinentsData = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.CONTINENTS);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching continents data');
  }
};

// Combined data for dashboard
export const fetchDashboardData = async (country = 'all') => {
  try {
    // Fetch data in parallel for better performance
    const requests = [
      country === 'all' ? fetchGlobalData() : fetchCountryData(country),
      fetchHistoricalAllData(),
      fetchVaccineData(),
    ];
    
    const [currentData, historicalData, vaccineData] = await Promise.all(requests);
    
    return {
      current: currentData,
      historical: historicalData,
      vaccine: vaccineData,
    };
  } catch (error) {
    throw new Error('Error fetching dashboard data');
  }
};