 // src / constants / colorScales.js
/**
 * Color scales and palette definitions for data visualization
 */

/**
 * Color scales and palette definitions for data visualization
 */

import * as d3 from 'd3';

// Sequential color scales for continuous data (e.g., choropleth maps)
export const SEQUENTIAL_SCALES = {
  // Blues (for cases)
  blue: (domain) => d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateBlues),
  
  // Reds (for deaths)
  red: (domain) => d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateReds),
  
  // Greens (for recovered)
  green: (domain) => d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateGreens),
  
  // Oranges (for active cases)
  orange: (domain) => d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateOranges),
  
  // Purples (for tests)
  purple: (domain) => d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolatePurples)
};

// Diverging color scales for values with meaningful midpoint
export const DIVERGING_SCALES = {
  // Red-Blue (for comparing values against average)
  redBlue: (domain) => d3.scaleDiverging()
    .domain([domain[0], (domain[0] + domain[1]) / 2, domain[1]])
    .interpolator(d3.interpolateRdBu),
  
  // Purple-Green (for positive/negative changes)
  purpleGreen: (domain) => d3.scaleDiverging()
    .domain([domain[0], (domain[0] + domain[1]) / 2, domain[1]])
    .interpolator(d3.interpolatePRGn),
  
  // Brown-Blue-Green (for deviation from expected values)
  brownBlueGreen: (domain) => d3.scaleDiverging()
    .domain([domain[0], (domain[0] + domain[1]) / 2, domain[1]])
    .interpolator(d3.interpolateBrBG)
};

// Categorical color scales for discrete data (e.g., continents, countries)
export const CATEGORICAL_SCALES = {
  // Standard categorical color palette
  standard: d3.scaleOrdinal(d3.schemeCategory10),
  
  // Extended categorical color palette
  extended: d3.scaleOrdinal(d3.schemeTableau10),
  
  // Pastel color palette
  pastel: d3.scaleOrdinal(d3.schemePastel1),
  
  // Color-blind friendly palette
  colorblind: d3.scaleOrdinal([
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', 
    '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
    '#bcbd22', '#17becf'
  ])
};

// Metric-specific color associations
export const METRIC_COLORS = {
  cases: '#4285F4',        // Google Blue
  deaths: '#DB4437',       // Google Red
  recovered: '#0F9D58',    // Google Green
  active: '#F4B400',       // Google Yellow
  tests: '#9C27B0',        // Purple
  vaccinated: '#00ACC1',   // Cyan
  hospitalized: '#FF6D00', // Orange
  icu: '#D81B60'           // Pink
};

// Threshold scales for data classification
export const createThresholdScale = (domain, colors) => {
  return d3.scaleThreshold()
    .domain(domain)
    .range(colors);
};

// Generate color ranges
export const generateColorRange = (startColor, endColor, steps) => {
  const colorScale = d3.scaleLinear()
    .domain([0, steps - 1])
    .range([startColor, endColor])
    .interpolate(d3.interpolateHcl);
  
  return Array.from({ length: steps }, (_, i) => colorScale(i));
};

// Log scale for data with wide range
export const createLogScale = (domain, range) => {
  return d3.scaleLog()
    .domain(domain)
    .range(range)
    .clamp(true);
};

export const colorScales = {
  SEQUENTIAL_SCALES,
  DIVERGING_SCALES,
  CATEGORICAL_SCALES,
  METRIC_COLORS,
  createThresholdScale,
  generateColorRange,
  createLogScale
};
export const COLOR_SCALES = colorScales;

export default colorScales