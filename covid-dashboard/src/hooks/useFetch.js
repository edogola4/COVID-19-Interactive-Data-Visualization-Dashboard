// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for data fetching with loading, error handling, and caching
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Object} - { data, loading, error, refetch, timestamp }
 *
 * Note: To optimize performance and prevent unnecessary refetches, memoize the options object
 * using useMemo if it includes dependencies that change, e.g.:
 * const options = useMemo(() => ({ dependencies: [someState], autoFetch: true }), [someState]);
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  const {
    initialData = null,
    dependencies = [],
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache time
    autoFetch = true,
    enabled = true,
  } = options;

  // Initialize with initial data if provided
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  // Fetch data function
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Skip fetch if not enabled
    if (!enabled) return;

    // Check cache validity unless force refresh
    if (!forceRefresh && timestamp && (Date.now() - timestamp < cacheTime)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(url);
      setData(response.data);
      setTimestamp(Date.now());
    } catch (err) {
      setError(err.message || 'Error fetching data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [url, cacheTime, timestamp, enabled]);

  // Initial fetch on mount or when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, dependencies]); // Fixed: Removed spread operator

  // Refetch function to expose to components
  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, refetch, timestamp };
};

export default useFetch;