// src/components/charts/BarChart.js
import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { formatNumber } from '../../utils/formatters';
import { colorScales } from '../../constants/colorScales';
import '../../styles/components/charts.css';

const BarChart = ({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 60, left: 60 },
  xAccessor = d => d.label,
  yAccessor = d => d.value,
  seriesAccessor = d => d.series,
  xLabel = 'Category',
  yLabel = 'Value',
  title = 'COVID-19 Statistics',
  colors = colorScales.categories,
  sortBy = null, // 'asc', 'desc', or null
  maxBars = 20,
  horizontal = false,
  animate = true,
  tooltipFormat = (d) => `${xAccessor(d)}: ${formatNumber(yAccessor(d))}`
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const theme = useSelector(state => state.ui.theme);
  // eslint-disable-next-line no-unused-vars
  const [hoveredData, setHoveredData] = useState(null);

  // Process and prepare data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // If data is already in expected format
    if (Array.isArray(data) && data[0] && ('label' in data[0] || 'series' in data[0])) {
      return data.map(d => ({
        ...d,
        label: d.label || d.name || d.country || 'Unknown',
        value: yAccessor(d),
        series: seriesAccessor(d) || 'default'
      }));
    }
    
    // Convert objects to array format
    if (!Array.isArray(data)) {
      return Object.entries(data).map(([key, value]) => ({
        label: key,
        value: typeof value === 'object' ? value.value || value.count || 0 : value,
        series: 'default'
      }));
    }
    
    return data.map(d => ({
      ...d,
      label: xAccessor(d),
      value: yAccessor(d),
      series: seriesAccessor(d) || 'default'
    }));
  }, [data, xAccessor, yAccessor, seriesAccessor]);
  
  // Sort and limit data if needed
  const finalData = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    
    let sortedData = [...processedData];
    
    // Sort data if requested
    if (sortBy === 'asc') {
      sortedData.sort((a, b) => a.value - b.value);
    } else if (sortBy === 'desc') {
      sortedData.sort((a, b) => b.value - a.value);
    }
    
    // Limit number of bars if needed
    if (sortedData.length > maxBars) {
      sortedData = sortedData.slice(0, maxBars);
    }
    
    return sortedData;
  }, [processedData, sortBy, maxBars]);

  // Create scales and draw chart
  useEffect(() => {
    if (!finalData || finalData.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Group data by series
    const nestedData = d3.group(finalData, d => d.series);
    const seriesNames = [...nestedData.keys()];

    // Create scales and axes based on orientation
    let xScale, yScale, xAxis, yAxis;
    
    if (horizontal) {
      // For horizontal bars
      xScale = d3.scaleLinear()
        .domain([0, d3.max(finalData, d => d.value) * 1.1])
        .range([0, innerWidth]);
        
      yScale = d3.scaleBand()
        .domain(finalData.map(d => d.label))
        .range([0, innerHeight])
        .padding(0.2);
        
      xAxis = g => g
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(formatNumber))
        .call(g => g.select('.domain').remove());
        
      yAxis = g => g
        .call(d3.axisLeft(yScale))
        .call(g => g.select('.domain').remove());
    } else {
      // For vertical bars
      xScale = d3.scaleBand()
        .domain(finalData.map(d => d.label))
        .range([0, innerWidth])
        .padding(0.2);
        
      yScale = d3.scaleLinear()
        .domain([0, d3.max(finalData, d => d.value) * 1.1])
        .range([innerHeight, 0]);
        
      xAxis = g => g
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .call(g => g.select('.domain').remove());
        
      yAxis = g => g
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(formatNumber))
        .call(g => g.select('.domain').remove());
    }

    // Create color scale for multiple series if needed
    const colorScale = d3.scaleOrdinal()
      .domain(seriesNames)
      .range(colors.length >= seriesNames.length ? colors : d3.schemeCategory10);

    // Create container group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid lines
    g.append('g')
      .attr('class', 'grid y-grid')
      .call(horizontal ? 
        d3.axisBottom(xScale)
          .ticks(5)
          .tickSize(innerHeight)
          .tickFormat('') :
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat('')
      )
      .style('color', theme === 'dark' ? '#333' : '#eee')
      .style('opacity', 0.7);

    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .attr('y', horizontal ? 10 : 0)
      .attr('x', horizontal ? 0 : -5)
      .attr('dy', '.35em')
      .attr('transform', horizontal ? null : 'rotate(-45)')
      .style('text-anchor', horizontal ? 'middle' : 'end')
      .style('fill', theme === 'dark' ? '#ddd' : '#333')
      .style('font-size', '10px');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('fill', theme === 'dark' ? '#ddd' : '#333');

    // Add axis labels
    g.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + (horizontal ? 40 : 50))
      .attr('text-anchor', 'middle')
      .style('fill', theme === 'dark' ? '#ddd' : '#333')
      .text(horizontal ? yLabel : xLabel);

    g.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('fill', theme === 'dark' ? '#ddd' : '#333')
      .text(horizontal ? xLabel : yLabel);

    // Add chart title
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', innerWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', theme === 'dark' ? '#fff' : '#333')
      .text(title);

    // Draw bars based on orientation
    if (horizontal) {
      const bars = g.selectAll('.bar')
        .data(finalData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => yScale(d.label))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.series))
        .on('mouseover', (event, d) => {
          setHoveredData(d);
          d3.select(event.currentTarget)
            .attr('stroke', theme === 'dark' ? '#fff' : '#000')
            .attr('stroke-width', 1);
            
          d3.select(tooltipRef.current)
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`)
            .html(tooltipFormat(d));
        })
        .on('mouseout', (event) => {
          setHoveredData(null);
          d3.select(event.currentTarget)
            .attr('stroke', 'none');
            
          d3.select(tooltipRef.current)
            .style('opacity', 0);
        });

      // Animate bars if enabled
      if (animate) {
        bars
          .attr('x', 0)
          .attr('width', 0)
          .transition()
          .duration(800)
          .delay((d, i) => i * 20)
          .attr('width', d => xScale(d.value));
      } else {
        bars
          .attr('x', 0)
          .attr('width', d => xScale(d.value));
      }
    } else {
      const bars = g.selectAll('.bar')
        .data(finalData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.label))
        .attr('width', xScale.bandwidth())
        .attr('fill', d => colorScale(d.series))
        .on('mouseover', (event, d) => {
          setHoveredData(d);
          d3.select(event.currentTarget)
            .attr('stroke', theme === 'dark' ? '#fff' : '#000')
            .attr('stroke-width', 1);
            
          d3.select(tooltipRef.current)
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`)
            .html(tooltipFormat(d));
        })
        .on('mouseout', (event) => {
          setHoveredData(null);
          d3.select(event.currentTarget)
            .attr('stroke', 'none');
            
          d3.select(tooltipRef.current)
            .style('opacity', 0);
        });

      // Animate bars if enabled
      if (animate) {
        bars
          .attr('y', innerHeight)
          .attr('height', 0)
          .transition()
          .duration(800)
          .delay((d, i) => i * 20)
          .attr('y', d => yScale(d.value))
          .attr('height', d => innerHeight - yScale(d.value));
      } else {
        bars
          .attr('y', d => yScale(d.value))
          .attr('height', d => innerHeight - yScale(d.value));
      }
    }

    // Add data labels if there are few bars
    if (finalData.length <= 10) {
      if (horizontal) {
        g.selectAll('.bar-label')
          .data(finalData)
          .enter()
          .append('text')
          .attr('class', 'bar-label')
          .attr('x', d => xScale(d.value) + 5)
          .attr('y', d => yScale(d.label) + yScale.bandwidth() / 2)
          .attr('dy', '.35em')
          .style('fill', theme === 'dark' ? '#ddd' : '#333')
          .style('font-size', '10px')
          .text(d => formatNumber(d.value));
      } else {
        g.selectAll('.bar-label')
          .data(finalData)
          .enter()
          .append('text')
          .attr('class', 'bar-label')
          .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
          .attr('y', d => yScale(d.value) - 5)
          .attr('text-anchor', 'middle')
          .style('fill', theme === 'dark' ? '#ddd' : '#333')
          .style('font-size', '10px')
          .text(d => formatNumber(d.value));
      }
    }
    
  }, [finalData, width, height, margin, horizontal, animate, theme, tooltipFormat, colors, xLabel, yLabel, title]);

  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

  return (
    <div className="bar-chart-container">
      <svg ref={svgRef} width={width} height={height} className="bar-chart"></svg>
      <div ref={tooltipRef} className="chart-tooltip"></div>
    </div>
  );
};

export default React.memo(BarChart);