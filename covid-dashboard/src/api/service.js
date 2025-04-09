// src/api/service.js
import axios from 'axios';
import { ENDPOINTS } from '../constants/apiEndpoints';
import { 
  mockGlobalData,
  mockCountriesData,
  mockHistoricalData,
  mockVaccineData
} from './mockData';

// Create axios instance with default configurations
const apiClient = axios.create({
  timeout: 15000, // 15 seconds timeout
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

// Check if we should use mock data (for development or during API failures)
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

// Global data service
export const fetchGlobalData = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.GLOBAL);
    return response.data;
  } catch (error) {
    console.error(`Error fetching global data: ${error.message}`);
    
    // Use mock data in development or if specifically enabled
    if (USE_MOCK_DATA) {
      console.warn('Using mock global data due to API failure');
      return mockGlobalData;
    }
    
    throw new Error(`Error fetching global data: ${error.message}`);
  }
};

// Country data services
export const fetchAllCountries = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.COUNTRIES);
    return response.data;
  } catch (error) {
    console.error(`Error fetching countries data: ${error.message}`);
    
    if (USE_MOCK_DATA) {
      console.warn('Using mock countries data due to API failure');
      return mockCountriesData;
    }
    
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
    console.error(`Error fetching data for ${country}: ${error.message}`);
    
    if (USE_MOCK_DATA) {
      console.warn(`Using mock data for country ${country} due to API failure`);
      return mockCountriesData.find(c => c.country.toLowerCase() === country.toLowerCase()) || mockCountriesData[0];
    }
    
    throw new Error(`Error fetching data for ${country}: ${error.message}`);
  }
};

// Historical data services
export const fetchHistoricalAllData = async (days = 30) => {
  try {
    const response = await apiClient.get(ENDPOINTS.HISTORICAL_ALL(days));
    return response.data;
  } catch (error) {
    console.error(`Error fetching historical global data: ${error.message}`);
    
    if (USE_MOCK_DATA) {
      console.warn('Using mock historical data due to API failure');
      return mockHistoricalData;
    }
    
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
    console.error(`Error fetching historical data for ${country}: ${error.message}`);
    
    if (USE_MOCK_DATA) {
      console.warn(`Using mock historical data for country ${country} due to API failure`);
      return { country, timeline: mockHistoricalData };
    }
    
    throw new Error(`Error fetching historical data for ${country}: ${error.message}`);
  }
};

// Vaccination data services
export const fetchVaccineData = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.VACCINE);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vaccine data: ${error.message}`);
    
    if (USE_MOCK_DATA) {
      console.warn('Using mock vaccine data due to API failure');
      return mockVaccineData;
    }
    
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
    console.error(`Error fetching vaccine data for ${country}: ${error.message}`);
    
    if (USE_MOCK_DATA) {
      console.warn(`Using mock vaccine data for country ${country} due to API failure`);
      return { country, timeline: mockVaccineData.timeline };
    }
    
    throw new Error(`Error fetching vaccine data for ${country}: ${error.message}`);
  }
};

// Continent data service
export const fetchContinentsData = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.CONTINENTS);
    return response.data;
  } catch (error) {
    console.error(`Error fetching continents data: ${error.message}`);
    
    if (USE_MOCK_DATA) {
      console.warn('Using mock continents data due to API failure');
      // Create mock continent data from countries
      const continents = {};
      mockCountriesData.forEach(country => {
        if (!continents[country.continent]) {
          continents[country.continent] = {
            continent: country.continent,
            cases: 0,
            deaths: 0,
            recovered: 0,
            active: 0,
            population: 0,
            countries: []
          };
        }
        
        continents[country.continent].cases += country.cases;
        continents[country.continent].deaths += country.deaths;
        continents[country.continent].recovered += country.recovered;
        continents[country.continent].active += country.active;
        continents[country.continent].population += country.population;
        continents[country.continent].countries.push(country.country);
      });
      
      return Object.values(continents);
    }
    
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
    
    if (USE_MOCK_DATA) {
      console.warn('Using mock dashboard data due to API failure');
      return {
        current: country === 'all' ? mockGlobalData : 
          mockCountriesData.find(c => c.country.toLowerCase() === country.toLowerCase()) || mockCountriesData[0],
        historical: country === 'all' ? mockHistoricalData : 
          { country, timeline: mockHistoricalData },
        vaccine: country === 'all' ? mockVaccineData : 
          { country, timeline: mockVaccineData.timeline },
        lastUpdated: new Date().toISOString(),
      };
    }
    
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
    console.error(`Error fetching top countries: ${error.message}`);
    
    if (USE_MOCK_DATA) {
      console.warn('Using mock top countries data due to API failure');
      return mockCountriesData
        .sort((a, b) => b[sortBy] - a[sortBy])
        .slice(0, limit);
    }
    
    throw new Error(`Error fetching top countries: ${error.message}`);
  }
};