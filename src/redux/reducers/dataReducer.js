// src/redux/reducers/dataReducer.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as apiService from '../../api/services';

// Async thunks for data fetching
export const fetchGlobalStats = createAsyncThunk(
  'data/fetchGlobalStats',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.fetchGlobalData();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllCountries = createAsyncThunk(
  'data/fetchAllCountries',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.fetchCountriesData();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchHistoricalTimeline = createAsyncThunk(
  'data/fetchHistoricalTimeline',
  async ({ country = 'all', days = 'all' }, { rejectWithValue }) => {
    try {
      return await apiService.fetchHistoricalData(country, days);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVaccinations = createAsyncThunk(
  'data/fetchVaccinations',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.fetchVaccinationData();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  global: {
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  },
  countries: {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  historical: {
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  },
  vaccinations: {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  selectedCountries: [],
  selectedMetric: 'cases',
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  }
};

// Create the slice
const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setSelectedCountries: (state, action) => {
      state.selectedCountries = action.payload;
    },
    setSelectedMetric: (state, action) => {
      state.selectedMetric = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    clearErrors: (state) => {
      state.global.error = null;
      state.countries.error = null;
      state.historical.error = null;
      state.vaccinations.error = null;
    }
  },
  extraReducers: (builder) => {
    // Global stats reducers
    builder
      .addCase(fetchGlobalStats.pending, (state) => {
        state.global.loading = true;
      })
      .addCase(fetchGlobalStats.fulfilled, (state, action) => {
        state.global.loading = false;
        state.global.data = action.payload;
        state.global.lastUpdated = new Date().toISOString();
        state.global.error = null;
      })
      .addCase(fetchGlobalStats.rejected, (state, action) => {
        state.global.loading = false;
        state.global.error = action.payload;
      });

    // Countries data reducers
    builder
      .addCase(fetchAllCountries.pending, (state) => {
        state.countries.loading = true;
      })
      .addCase(fetchAllCountries.fulfilled, (state, action) => {
        state.countries.loading = false;
        state.countries.data = action.payload;
        state.countries.lastUpdated = new Date().toISOString();
        state.countries.error = null;
      })
      .addCase(fetchAllCountries.rejected, (state, action) => {
        state.countries.loading = false;
        state.countries.error = action.payload;
      });

    // Historical data reducers
    builder
      .addCase(fetchHistoricalTimeline.pending, (state) => {
        state.historical.loading = true;
      })
      .addCase(fetchHistoricalTimeline.fulfilled, (state, action) => {
        state.historical.loading = false;
        state.historical.data = action.payload;
        state.historical.lastUpdated = new Date().toISOString();
        state.historical.error = null;
      })
      .addCase(fetchHistoricalTimeline.rejected, (state, action) => {
        state.historical.loading = false;
        state.historical.error = action.payload;
      });

    // Vaccination data reducers
    builder
      .addCase(fetchVaccinations.pending, (state) => {
        state.vaccinations.loading = true;
      })
      .addCase(fetchVaccinations.fulfilled, (state, action) => {
        state.vaccinations.loading = false;
        state.vaccinations.data = action.payload;
        state.vaccinations.lastUpdated = new Date().toISOString();
        state.vaccinations.error = null;
      })
      .addCase(fetchVaccinations.rejected, (state, action) => {
        state.vaccinations.loading = false;
        state.vaccinations.error = action.payload;
      });
  }
});

// Export actions and reducer
export const { 
  setSelectedCountries, 
  setSelectedMetric, 
  setDateRange,
  clearErrors
} = dataSlice.actions;

export default dataSlice.reducer;