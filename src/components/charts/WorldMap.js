// src/components/charts/WorldMap.js
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { useSelector } from 'react-redux';
import { formatNumber } from '../../utils/formatters';
import useResponsive from '../../hooks/useResponsive';
import '../../styles/components/charts.css';

const WorldMap = ({ data, metric }) => {
  const mapRef = useRef(null);
  const tooltipRef = useRef(null);
  const { isMobileView } = useSelector(state => state.ui);
  const [worldData, setWorldData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dimensions = useResponsive(mapRef, {
    width: isMobileView ? window.innerWidth - 40 : 800,
    height: 450,
    margin: { top: 20, right: 20, bottom: 20, left: 20 }
  });

  // Load world map data
  useEffect(() => {
    const fetchWorldData = async () => {
      try {
        const response = await fetch('/assets/world.geojson');
        if (!response.ok) {
          throw new Error('Failed to fetch world map data');
        }
        const worldGeoJson = await response.json();
        setWorldData(worldGeoJson);
      } catch (err) {
        console.error('Error loading world map data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorldData();
  }, []);

  // Create color scale based on the selected metric
  const colorScale = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const metricValues = data.map(d => d.value);
    const max = d3.max(metricValues);
    
    // Use different color schemes based on metric
    let colorRange;
    switch (metric) {
      case 'deaths':
        colorRange = ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'];
        break;
      case 'recovered':
        colorRange = ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'];
        break;
      case 'active':
        colorRange = ['#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FF6F00'];
        break;
      default: // cases
        colorRange = ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'];
    }
    
    return d3.scaleQuantile()
      .domain([0, max])
      .range(colorRange);
  }, [data, metric]);

  // Draw the map when data and dimensions are available
  useEffect(() => {
    if (!dimensions || !worldData || !data || !colorScale) return;
    
    const { width, height, margin } = dimensions;
    const tooltipDiv = d3.select(tooltipRef.current);
    
    // Create a map of country data by ISO code for quick lookup
    const countryDataById = {};
    data.forEach(d => {
      countryDataById[d.id] = d;
    });
    
    // Set up projection and path generator
    const projection = d3.geoMercator()
      .fitSize([width - margin.left - margin.right, height - margin.top - margin.bottom], worldData)
      .translate([width / 2, height / 2]);
    
    const pathGenerator = d3.geoPath().projection(projection);
    
    // Clear any existing SVG
    d3.select(mapRef.current).selectAll("*").remove();
    
    // Create new SVG
    const svg = d3.select(mapRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        svg.selectAll("path")
          .attr("transform", event.transform);
      });
    
    svg.call(zoom);
    
    // Draw map
    svg.selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("class", "country")
      .attr("fill", d => {
        const countryData = countryDataById[d.properties.ISO_A3];
        return countryData ? colorScale(countryData.value) : "#ccc";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .on("mouseover", (event, d) => {
        const countryData = countryDataById[d.properties.ISO_A3];
        
        // Highlight the country
        d3.select(event.currentTarget)
          .attr("stroke", "#333")
          .attr("stroke-width", 1.5);
        
        // Show tooltip if we have data for this country
        if (countryData) {
          tooltipDiv.transition()
            .duration(200)
            .style("opacity", .9);
          tooltipDiv.html(`
            <div class="tooltip-header">
              <img src="${countryData.flag}" alt="${d.properties.NAME}" class="country-flag" />
              <strong>${d.properties.NAME}</strong>
            </div>
            <div class="tooltip-content">
              <p>${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${formatNumber(countryData.value)}</p>
              <p>Per Million: ${formatNumber(countryData.valuePerMillion)}</p>
            </div>
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        }
      })
      .on("mouseout", (event) => {
        // Remove highlight
        d3.select(event.currentTarget)
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5);
        
        // Hide tooltip
        tooltipDiv.transition()
          .duration(500)
          .style("opacity", 0);
      });
    
    // Add legend
    const legendWidth = width * 0.8;
    const legendHeight = 10;
    const legendPosition = {
      x: (width - legendWidth) / 2,
      y: height - margin.bottom - legendHeight - 10
    };
    
    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([0, legendWidth]);
    
    const legendAxis = d3.axisBottom(legendScale)
      .tickSize(legendHeight)
      .tickFormat(d3.format(".1s"));
    
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
    
    colorScale.range().forEach((color, i) => {
      linearGradient.append("stop")
        .attr("offset", i / (colorScale.range().length - 1))
        .attr("stop-color", color);
    });
    
    svg.append("g")
      .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y})`)
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)");
    
    svg.append("g")
      .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y + legendHeight})`)
      .call(legendAxis)
      .select(".domain")
      .remove();
    
  }, [dimensions, worldData, data, colorScale, metric]);

  if (loading) {
    return <div className="loading-container">Loading map data...</div>;
  }

  if (error) {
    return <div className="error-container">Error loading map: {error}</div>;
  }

  return (
    <div className="world-map-container">
      <div ref={mapRef} className="world-map"></div>
      <div ref={tooltipRef} className="tooltip"></div>
    </div>
  );
};

export default React.memo(WorldMap);