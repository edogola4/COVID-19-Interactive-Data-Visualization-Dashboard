// src / utils / chartHelpers.js
/**
 * Helper functions for chart configuration and customization
 */

import * as d3 from 'd3';
import { formatNumber, formatDate } from './formatters';

// Color scales for different metrics
export const getColorScale = (metric, theme = 'light') => {
  // Base color scales
  const scales = {
    cases: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'],
    deaths: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'],
    recovered: ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
    active: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
    tests: ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f'],
    vaccinated: ['#f1eef6', '#d4b9da', '#df65b0', '#ce1256', '#91003f'],
    default: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#3182bd'],
  };

  // Get the appropriate color range based on metric
  const colorRange = scales[metric] || scales.default;
  
  // Invert colors for dark theme if needed
  const range = theme === 'dark' ? [...colorRange].reverse() : colorRange;
  
  // Return a sequential color scale
  return d3.scaleQuantize().range(range);
};

// Get appropriate domain for a metric
export const getMetricDomain = (data, metric) => {
  if (!data || data.length === 0) return [0, 100];
  
  const values = data.map(d => d[metric] || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Add a bit of padding to the upper bound
  return [min, max * 1.05];
};

// Format axis ticks based on data type
export const formatAxisTick = (value, axis, metric) => {
  if (axis === 'x' && value instanceof Date) {
    return formatDate(value, 'monthDay');
  }
  
  if (axis === 'y') {
    return formatNumber(value, true);
  }
  
  return value;
};

// Generate chart tooltip content
export const generateTooltipContent = (data, metric) => {
  if (!data) return '';
  
  let content = `<div class="tooltip-container">`;
  
  // Add title if available
  if (data.name || data.country) {
    content += `<div class="tooltip-title">${data.name || data.country}</div>`;
  }
  
  // Add date if available
  if (data.date) {
    content += `<div class="tooltip-date">${formatDate(data.date, 'medium')}</div>`;
  }
  
  // Add metric data
  if (data[metric] !== undefined) {
    content += `<div class="tooltip-value">
      <span class="tooltip-label">${formatMetricName(metric)}:</span>
      <span class="tooltip-number">${formatNumber(data[metric])}</span>
    </div>`;
  }
  
  // Add additional metrics if available
  const additionalMetrics = ['cases', 'deaths', 'recovered', 'active', 'tests', 'vaccinated'];
  additionalMetrics
    .filter(m => m !== metric && data[m] !== undefined)
    .forEach(m => {
      content += `<div class="tooltip-value">
        <span class="tooltip-label">${formatMetricName(m)}:</span>
        <span class="tooltip-number">${formatNumber(data[m])}</span>
      </div>`;
    });
  
  content += `</div>`;
  return content;
};

// Format metric name for display
export const formatMetricName = (metric) => {
  const metricMap = {
    cases: 'Cases',
    deaths: 'Deaths',
    recovered: 'Recovered',
    active: 'Active Cases',
    tests: 'Tests',
    vaccinated: 'Vaccinated',
    casesPerOneMillion: 'Cases per Million',
    deathsPerOneMillion: 'Deaths per Million',
    testsPerOneMillion: 'Tests per Million',
    activePerOneMillion: 'Active per Million',
    recoveredPerOneMillion: 'Recovered per Million',
    critical: 'Critical',
    dailyCases: 'Daily Cases',
    dailyDeaths: 'Daily Deaths',
    dailyRecovered: 'Daily Recovered',
    population: 'Population',
  };
  
  return metricMap[metric] || metric.charAt(0).toUpperCase() + metric.slice(1);
};

// Responsive chart dimensions
export const getChartDimensions = (container, aspectRatio = 16/9) => {
  if (!container) {
    return { width: 600, height: 400 };
  }
  
  const { width } = container.getBoundingClientRect();
  const height = width / aspectRatio;
  
  // Set minimum height
  return {
    width,
    height: Math.max(height, 300),
  };
};

// Chart legend configuration
export const createLegendItems = (metric, colorScale, steps = 5) => {
  const domain = colorScale.domain();
  const range = colorScale.range();
  const step = (domain[1] - domain[0]) / steps;
  
  return Array.from({ length: steps }, (_, i) => ({
    color: range[i],
    value: domain[0] + step * i,
    label: formatNumber(domain[0] + step * i, true),
  }));
};

// Generate accessible color combinations
export const getAccessibleColors = (theme = 'light') => {
  // Color-blind friendly palette
  const colorBlindFriendly = [
    '#1f77b4', // blue
    '#ff7f0e', // orange
    '#2ca02c', // green
    '#d62728', // red
    '#9467bd', // purple
    '#8c564b', // brown
    '#e377c2', // pink
    '#7f7f7f', // gray
    '#bcbd22', // olive
    '#17becf', // teal
  ];
  
  // Adjust colors for dark theme
  if (theme === 'dark') {
    return colorBlindFriendly.map(color => d3.color(color).brighter(0.3).toString());
  }
  
  return colorBlindFriendly;
};