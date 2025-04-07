// src/components/charts/BarChart.js
import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { formatNumber } from '../../utils/formatters';
import '../../styles/components/charts.css';

const BarChart = ({ 
  data, 
  width = 600, 
  height = 400, 
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  metric = 'cases',
  onBarClick = () => {}
}) => {
  const chartRef = useRef();
  const tooltipRef = useRef();
  // eslint-disable-next-line no-unused-vars
  const [hoveredBar, setHoveredBar] = useState(null);
  const theme = useSelector(state => state.ui.theme);

  // Derived dimensions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Memoized scales to prevent unnecessary recalculations
  const scales = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[metric]) * 1.1]) // Add 10% padding
      .range([innerHeight, 0]);
      
    return { x, y };
  }, [data, innerWidth, innerHeight, metric]);

  useEffect(() => {
    if (!scales || !data || data.length === 0) return;
    
    const svg = d3.select(chartRef.current);
    const tooltip = d3.select(tooltipRef.current);
    const { x, y } = scales;
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
    // Add chart group
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');
    
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => formatNumber(d)))
      .style('font-size', '12px');
    
    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label))
      .attr('y', d => y(d[metric]))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d[metric]))
      .attr('fill', (d, i) => d3.schemeTableau10[i % 10])
      .attr('rx', 2) // Rounded corners
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setHoveredBar(d);
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`
            <strong>${d.label}</strong><br/>
            ${metric}: ${formatNumber(d[metric])}
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        setHoveredBar(null);
        tooltip.style('opacity', 0);
      })
      .on('click', (event, d) => {
        onBarClick(d);
      });
    
    // Add labels
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 5)
      .text('Countries');
    
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 15)
      .text(metric.charAt(0).toUpperCase() + metric.slice(1));
    
  }, [data, width, height, margin, scales, innerWidth, innerHeight, metric, onBarClick, theme]);

  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

  return (
    <div className="bar-chart-container">
      <svg ref={chartRef} className="bar-chart"></svg>
      <div ref={tooltipRef} className="chart-tooltip"></div>
    </div>
  );
};

export default React.memo(BarChart);