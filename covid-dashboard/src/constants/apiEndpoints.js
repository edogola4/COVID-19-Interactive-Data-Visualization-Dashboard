// src/constants/apiEndpoints.js
/**
 * API endpoints for COVID-19 data
 * Using Disease.sh (https://disease.sh/) as the primary data source
 */

export const BASE_URL = 'https://disease.sh/v3/covid-19';

export const ENDPOINTS = {
  // Global data
  GLOBAL: `${BASE_URL}/all`,
  
  // Country-specific data
  COUNTRIES: `${BASE_URL}/countries`,
  COUNTRY: (country) => `${BASE_URL}/countries/${country}`,
  
  // Historical data for time-series charts
  HISTORICAL_ALL: `${BASE_URL}/historical/all`,
  HISTORICAL_COUNTRY: (country, days = 30) => 
    `${BASE_URL}/historical/${country}?lastdays=${days}`,
  
  // Vaccine data
  VACCINE: `${BASE_URL}/vaccine/coverage`,
  VACCINE_COUNTRY: (country) => 
    `${BASE_URL}/vaccine/coverage/countries/${country}`,
  
  // Continent data
  CONTINENTS: `${BASE_URL}/continents`,
};

// Secondary API for more detailed vaccination data
export const VACCINATION_API = {
  BASE: 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations',
  LATEST: 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json',
};

// JHU CSSE historical time series data (alternative source)
export const JHU_TIMESERIES = {
  CONFIRMED: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv',
  DEATHS: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv',
  RECOVERED: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv',
};