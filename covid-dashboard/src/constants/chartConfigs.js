// src / constants / chartConfigs.js
/**
 * Configuration settings for chart components
 */

// Line chart configuration
export const LINE_CHART_CONFIG = {
  margin: { top: 20, right: 30, bottom: 40, left: 50 },
  xAxisLabel: 'Date',
  animations: {
    duration: 500,
    easing: 'cubic-in-out'
  },
  tooltip: {
    enabled: true
  },
  metrics: {
    cases: {
      label: 'Cases',
      color: '#007bff',
      dashArray: '0',
      lineWidth: 2
    },
    deaths: {
      label: 'Deaths',
      color: '#dc3545',
      dashArray: '0',
      lineWidth: 2
    },
    recovered: {
      label: 'Recovered',
      color: '#28a745',
      dashArray: '0',
      lineWidth: 2
    },
    active: {
      label: 'Active',
      color: '#ffc107',
      dashArray: '0',
      lineWidth: 2
    }
  }
};

// Bar chart configuration
export const BAR_CHART_CONFIG = {
  margin: { top: 20, right: 30, bottom: 100, left: 60 },
  barPadding: 0.2,
  animations: {
    duration: 800,
    easing: 'elastic'
  },
  metrics: {
    cases: {
      label: 'Total Cases',
      color: '#007bff'
    },
    deaths: {
      label: 'Total Deaths',
      color: '#dc3545'
    },
    recovered: {
      label: 'Total Recovered',
      color: '#28a745'
    },
    active: {
      label: 'Active Cases',
      color: '#ffc107'
    },
    tests: {
      label: 'Total Tests',
      color: '#6c757d'
    },
    casesPerOneMillion: {
      label: 'Cases per Million',
      color: '#17a2b8'
    },
    deathsPerOneMillion: {
      label: 'Deaths per Million',
      color: '#6610f2'
    }
  }
};

// Pie chart configuration
export const PIE_CHART_CONFIG = {
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  innerRadius: 0.6, // For donut chart, set to 0 for pie chart
  padAngle: 0.02,
  cornerRadius: 4,
  sortValues: 'descending',
  animations: {
    duration: 750,
    easing: 'cubic'
  },
  tooltip: {
    enabled: true
  }
};

// World map configuration
export const WORLD_MAP_CONFIG = {
  margin: { top: 10, right: 10, bottom: 10, left: 10 },
  projectionType: 'geoMercator',
  graticule: true,
  zoom: {
    enabled: true,
    scaleExtent: [1, 8]
  },
  tooltip: {
    enabled: true
  },
  metrics: {
    cases: {
      label: 'Total Cases',
      colorRange: ['#f7fbff', '#08519c']
    },
    deaths: {
      label: 'Total Deaths',
      colorRange: ['#fff5f0', '#a50f15']
    },
    recovered: {
      label: 'Total Recovered',
      colorRange: ['#f7fcf5', '#00441b']
    },
    active: {
      label: 'Active Cases',
      colorRange: ['#ffffd4', '#006837']
    },
    casesPerOneMillion: {
      label: 'Cases per Million',
      colorRange: ['#f7fbff', '#08519c']
    },
    deathsPerOneMillion: {
      label: 'Deaths per Million',
      colorRange: ['#fff5f0', '#a50f15']
    }
  }
};

// Default chart themes
export const CHART_THEMES = {
  light: {
    background: '#ffffff',
    text: '#333333',
    grid: '#e0e0e0',
    axis: '#666666'
  },
  dark: {
    background: '#2d3748',
    text: '#e2e8f0',
    grid: '#4a5568',
    axis: '#a0aec0'
  }
};


const chartConfigs = {
  LINE_CHART_CONFIG,
  BAR_CHART_CONFIG,
  PIE_CHART_CONFIG,
  WORLD_MAP_CONFIG,
  CHART_THEMES
};

export default chartConfigs;