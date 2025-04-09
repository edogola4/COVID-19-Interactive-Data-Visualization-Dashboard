// src/api/mockData.js
export const mockGlobalData = {
    updated: Date.now(),
    cases: 775230420,
    todayCases: 37832,
    deaths: 7000000,
    todayDeaths: 183,
    recovered: 747082008,
    active: 21148412,
    critical: 37661,
    tests: 6924488127,
    population: 7944935131
  };
  
  export const mockCountriesData = [
    {
      country: "USA",
      countryInfo: {
        _id: 840,
        iso2: "US",
        iso3: "USA",
        lat: 38,
        long: -97,
        flag: "https://disease.sh/assets/img/flags/us.png"
      },
      cases: 103488598,
      deaths: 1127152,
      recovered: 100766999,
      active: 1694447,
      continent: "North America",
      population: 331002651
    },
    {
      country: "India",
      countryInfo: {
        _id: 356,
        iso2: "IN",
        iso3: "IND",
        lat: 20,
        long: 77,
        flag: "https://disease.sh/assets/img/flags/in.png"
      },
      cases: 44986461,
      deaths: 531832,
      recovered: 44446514,
      active: 8115,
      continent: "Asia",
      population: 1380004385
    },
    {
      country: "France",
      countryInfo: {
        _id: 250,
        iso2: "FR",
        iso3: "FRA",
        lat: 46,
        long: 2,
        flag: "https://disease.sh/assets/img/flags/fr.png"
      },
      cases: 39908640,
      deaths: 164752,
      recovered: 39701887,
      active: 42001,
      continent: "Europe",
      population: 65273511
    }
  ];
  
  export const mockHistoricalData = {
    cases: {
      "4/9/24": 775230420,
      "4/8/24": 775200000,
      "4/7/24": 775150000,
      // Add more dates as needed
    },
    deaths: {
      "4/9/24": 7000000,
      "4/8/24": 6999800,
      "4/7/24": 6999600,
      // Add more dates as needed
    },
    recovered: {
      "4/9/24": 747082008,
      "4/8/24": 747050000,
      "4/7/24": 747020000,
      // Add more dates as needed
    }
  };
  
  export const mockVaccineData = {
    timeline: {
      "4/9/24": 13900000000,
      "4/8/24": 13890000000,
      "4/7/24": 13880000000,
      // Add more dates as needed
    }
  };