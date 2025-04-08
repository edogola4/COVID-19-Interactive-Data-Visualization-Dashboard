// src/api/service.js
import axios from 'axios';
import { ENDPOINTS } from '../constants/apiEndpoints';

// Create axios instance with default configurations
const apiClient = axios.create({
  timeout: 15000, // 15 seconds timeout - increased for potentially slow API responses
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        endpoint: error.config.url
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Error Request:', error.request);
    } else {
      // Something else caused the error
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Request interceptor to add timestamp to prevent caching
apiClient.interceptors.request.use(
  (config) => {
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}t=${new Date().getTime()}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global data service
export const fetchGlobalData = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.GLOBAL);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching global data: ${error.message}`);
  }
};

// Country data services
export const fetchAllCountries = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.COUNTRIES);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching countries data: ${error.message}`);
  }
};

export const fetchCountryData = async (country) => {
  if (!country) {
    throw new Error('Country parameter is required');
  }
  
  try {
    const response = await apiClient.get(ENDPOINTS.COUNTRY(country));
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching data for ${country}: ${error.message}`);
  }
};

// Historical data services
export const fetchHistoricalAllData = async (days = 30) => {
  try {
    const response = await apiClient.get(ENDPOINTS.HISTORICAL_ALL(days));
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching historical global data: ${error.message}`);
  }
};

export const fetchHistoricalCountryData = async (country, days = 30) => {
  if (!country) {
    throw new Error('Country parameter is required');
  }
  
  try {
    const response = await apiClient.get(ENDPOINTS.HISTORICAL_COUNTRY(country, days));
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching historical data for ${country}: ${error.message}`);
  }
};

// Vaccination data services
export const fetchVaccineData = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.VACCINE);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching vaccine data: ${error.message}`);
  }
};

export const fetchCountryVaccineData = async (country) => {
  if (!country) {
    throw new Error('Country parameter is required');
  }
  
  try {
    const response = await apiClient.get(ENDPOINTS.VACCINE_COUNTRY(country));
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching vaccine data for ${country}: ${error.message}`);
  }
};

// Continent data service
export const fetchContinentsData = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.CONTINENTS);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching continents data: ${error.message}`);
  }
};

// Combined data for dashboard with better error handling and retry mechanism
export const fetchDashboardData = async (country = 'all') => {
  const fetchWithRetry = async (fetchFunction, retries = 2, delay = 1000) => {
    try {
      return await fetchFunction();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fetchFunction, retries - 1, delay * 1.5);
    }
  };

  try {
    // Define request functions to be used with retry
    const requests = [
      () => country === 'all' ? fetchGlobalData() : fetchCountryData(country),
      () => fetchHistoricalAllData(30),
      () => fetchVaccineData(),
    ];

    // Execute requests with retry mechanism in parallel
    const [currentData, historicalData, vaccineData] = await Promise.all(
      requests.map(req => fetchWithRetry(req))
    );

    return {
      current: currentData,
      historical: historicalData,
      vaccine: vaccineData,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    throw new Error(`Error fetching dashboard data: ${error.message}`);
  }
};

// Get top affected countries
export const fetchTopCountries = async (limit = 10, sortBy = 'cases') => {
  try {
    const countries = await fetchAllCountries();
    return countries
      .sort((a, b) => b[sortBy] - a[sortBy])
      .slice(0, limit);
  } catch (error) {
    throw new Error(`Error fetching top countries: ${error.message}`);
  }
};