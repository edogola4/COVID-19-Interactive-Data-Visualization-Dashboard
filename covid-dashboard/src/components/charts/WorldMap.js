// src / components / charts / WorldMap.js
import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
// eslint-disable-next-line no-unused-vars
import { feature } from 'topojson-client';
import { useSelector } from 'react-redux';
import { formatNumber } from '../../utils/formatters';
// eslint-disable-next-line no-unused-vars
import { COLOR_SCALES } from '../../constants/colorScales';
import '../../styles/components/charts.css';

const WorldMap = ({
  data,
  width = 960,
  height = 500,
  margin = { top: 10, right: 10, bottom: 10, left: 10 },
  metric = 'cases',
  // Provide a default color range; you can also use COLOR_SCALES if desired.
  colorRange = ['#f7fbff', '#08519c'],
  onCountryClick = () => {}
}) => {
  const mapRef = useRef();
  const tooltipRef = useRef();
  const [worldData, setWorldData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedCountry, setSelectedCountry] = useState(null);
  const theme = useSelector(state => state.ui.theme);

  // Fetch world geometry data. If it's TopoJSON with "countries", convert it.
  useEffect(() => {
    fetch('/assets/world.geojson')
      .then(response => response.json())
      .then(geoData => {
        if (geoData.objects && geoData.objects.countries) {
          // Convert TopoJSON to GeoJSON
          const countries = topojson.feature(geoData, geoData.objects.countries);
          setWorldData(countries);
        } else {
          // Assume already GeoJSON
          setWorldData(geoData);
        }
      })
      .catch(error => {
        console.error('Error loading world map data:', error);
      });
  }, []);

  // Create memoized map configuration once worldData and data are available.
  const mapConfig = useMemo(() => {
    if (!data || !worldData) return null;

    // Determine data values based on the provided metric.
    // Supports both an object (keyed by ISO code) and an array (matched by country name).
    let dataValues = [];
    if (Array.isArray(data)) {
      dataValues = data
        .filter(d => d && d[metric] !== undefined)
        .map(d => d[metric]);
    } else {
      dataValues = Object.values(data)
        .filter(d => d && d[metric] !== undefined)
        .map(d => d[metric]);
    }

    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(dataValues) || 0])
      .interpolator(d3.interpolate(colorRange[0], colorRange[1]));

    // Set up a Mercator projection that fits the world data into our available space.
    const projection = d3.geoMercator()
      .fitSize([width - margin.left - margin.right, height - margin.top - margin.bottom], worldData)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    return { colorScale, projection, pathGenerator };
  }, [data, worldData, width, height, margin, metric, colorRange]);

  useEffect(() => {
    if (!mapConfig || !worldData || !data) return;

    const svg = d3.select(mapRef.current);
    const tooltip = d3.select(tooltipRef.current);
    const { colorScale, pathGenerator } = mapConfig;

    // Clear previous contents
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    // Create main group and attach zoom behavior
    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Draw each country
    g.selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator)
      .attr('class', 'country')
      .attr('fill', d => {
        const countryCode = d.properties.iso_a3 || d.properties.ISO_A3;
        let countryData;
        // Support both object and array data formats
        if (data[countryCode]) {
          countryData = data[countryCode];
        } else if (Array.isArray(data)) {
          countryData = data.find(c => c.country === d.properties.name);
        }
        return countryData && countryData[metric] !== undefined
          ? colorScale(countryData[metric])
          : theme === 'dark' ? '#2a2a2a' : '#ddd';
      })
      .attr('stroke', theme === 'dark' ? '#555' : '#fff')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const countryCode = d.properties.iso_a3 || d.properties.ISO_A3;
        let countryData;
        if (data[countryCode]) {
          countryData = data[countryCode];
        } else if (Array.isArray(data)) {
          countryData = data.find(c => c.country === d.properties.name);
        }
        setSelectedCountry(d.properties.name);
        d3.select(event.currentTarget)
          .attr('stroke', theme === 'dark' ? '#fff' : '#000')
          .attr('stroke-width', 1.5);
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`
            <strong>${d.properties.name}</strong><br/>
            ${countryData ? `${metric}: ${formatNumber(countryData[metric] || 0)}` : 'No data available'}
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', (event) => {
        setSelectedCountry(null);
        d3.select(event.currentTarget)
          .attr('stroke', theme === 'dark' ? '#555' : '#fff')
          .attr('stroke-width', 0.5);
        tooltip.style('opacity', 0);
      })
      .on('click', (event, d) => {
        const countryCode = d.properties.iso_a3 || d.properties.ISO_A3;
        let countryData;
        if (data[countryCode]) {
          countryData = data[countryCode];
        } else if (Array.isArray(data)) {
          countryData = data.find(c => c.country === d.properties.name);
        }
        if (countryData) {
          onCountryClick({
            ...countryData,
            countryCode,
            countryName: d.properties.name
          });
        }
      });

    // Add a legend to display the color scale
    const legendWidth = 200;
    const legendHeight = 10;
    const legendX = width - legendWidth - 20;
    const legendY = height - 40;

    const legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d => formatNumber(d));

    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
      .attr('id', 'linear-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    linearGradient.selectAll('stop')
      .data(colorRange.map((color, i) => ({ offset: i / (colorRange.length - 1), color })))
      .enter()
      .append('stop')
      .attr('offset', d => `${d.offset * 100}%`)
      .attr('stop-color', d => d.color);

    svg.append('g')
      .attr('transform', `translate(${legendX}, ${legendY})`)
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#linear-gradient)');

    svg.append('g')
      .attr('transform', `translate(${legendX}, ${legendY + legendHeight})`)
      .call(legendAxis)
      .selectAll('text')
      .style('font-size', '10px');

    // Add a map title
    svg.append('text')
      .attr('class', 'map-title')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`COVID-19 ${metric.charAt(0).toUpperCase() + metric.slice(1)} by Country`);
  }, [data, width, height, margin, mapConfig, onCountryClick, theme, metric, colorRange, worldData]);

  if (!worldData || !data) {
    return <div className="map-placeholder">Loading map data...</div>;
  }

  return (
    <div className="world-map-container">
      <svg ref={mapRef} className="world-map"></svg>
      <div ref={tooltipRef} className="chart-tooltip"></div>
    </div>
  );
};

export default React.memo(WorldMap);
