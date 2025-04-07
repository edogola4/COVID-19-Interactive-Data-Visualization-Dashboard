// src / utils / formatters.js
/**
 * Formatting utilities for consistent data display
 */

// Format large numbers with commas and abbreviations
export const formatNumber = (num, abbreviate = false) => {
    if (num === null || num === undefined) {
      return 'N/A';
    }
    
    if (abbreviate) {
      // Abbreviate large numbers
      if (num >= 1000000000) {
        return `${(num / 1000000000).toFixed(1)}B`;
      }
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      }
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return num.toString();
    }
    
    // Format with commas
    return new Intl.NumberFormat().format(num);
  };
  
  // Format percentage with specified decimal places
  export const formatPercentage = (value, decimals = 2) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return `${value.toFixed(decimals)}%`;
  };
  
  // Format dates in consistent format
  export const formatDate = (date, format = 'short') => {
    if (!date) return 'N/A';
    
    const dateObj = new Date(date);
    
    switch (format) {
      case 'full':
        return dateObj.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'medium':
        return dateObj.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      case 'monthDay':
        return dateObj.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
      case 'yearMonth':
        return dateObj.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
        });
      case 'iso':
        return dateObj.toISOString().split('T')[0];
      case 'time':
        return dateObj.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        });
      case 'datetime':
        return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })}`;
      case 'short':
      default:
        return dateObj.toLocaleDateString();
    }
  };
  
  // Format a relative time (e.g., "2 hours ago")
  export const formatRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  };
  
  // Calculate growth rate between two values
  export const calculateGrowthRate = (current, previous) => {
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
  };
  
  // Get trend indicator (↑, ↓, or →) based on change
  export const getTrendIndicator = (change) => {
    if (!change && change !== 0) return '';
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };
  
  // Get color based on trend (green for good, red for bad)
  export const getTrendColor = (change, inverse = false) => {
    if (!change && change !== 0) return 'gray';
    
    // For metrics where decrease is good (e.g., deaths, cases)
    if (inverse) {
      return change > 0 ? 'red' : change < 0 ? 'green' : 'gray';
    }
    
    // For metrics where increase is good (e.g., recoveries, vaccinations)
    return change > 0 ? 'green' : change < 0 ? 'red' : 'gray';
  };