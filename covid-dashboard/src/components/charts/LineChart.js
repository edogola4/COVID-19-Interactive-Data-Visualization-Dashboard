// src / components / charts / LineChart.js
import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { formatDate, formatNumber } from '../../utils/formatters';
import '../../styles/components/charts.css';

const LineChart = ({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 80, bottom: 50, left: 60 },
  metrics = [{ id: 'cases', color: '#e41a1c', label: 'Cases' }],
  timeFrame = 'all'
}) => {
  const chartRef = useRef();
  const tooltipRef = useRef();
  const brushRef = useRef();
  const theme = useSelector(state => state.ui.theme);
  // eslint-disable-next-line no-unused-vars
  const [hoveredDate, setHoveredDate] = useState(null);

  // Derived dimensions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Memo scales
  const scales = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Filter by time frame if needed
    let filteredData = data;
    if (timeFrame !== 'all') {
      const now = new Date();
      const pastDate = new Date();
      const days = timeFrame === 'month' ? 30 : 
                  timeFrame === '3months' ? 90 : 
                  timeFrame === '6months' ? 180 : 365;
      pastDate.setDate(now.getDate() - days);
      filteredData = data.filter(d => new Date(d.date) >= pastDate);
    }
    
    const x = d3.scaleTime()
      .domain(d3.extent(filteredData, d => new Date(d.date)))
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([
        0,
        d3.max(filteredData, d => {
          return Math.max(...metrics.map(metric => d[metric.id] || 0));
        }) * 1.1 // Add 10% padding
      ])
      .range([innerHeight, 0]);
      
    return { x, y, filteredData };
  }, [data, innerWidth, innerHeight, timeFrame, metrics]);

  useEffect(() => {
    if (!scales || !data || data.length === 0) return;
    
    const svg = d3.select(chartRef.current);
    const tooltip = d3.select(tooltipRef.current);
    const { x, y, filteredData } = scales;
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
    // Add chart group
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create line generator
    const line = d3.line()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '12px');
    
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => formatNumber(d)))
      .style('font-size', '12px');
    
    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat(''))
      .selectAll('line')
      .style('stroke', theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
    
    // Add lines for each metric
    metrics.forEach((metric, i) => {
      // Prepare data for this metric
      const metricData = filteredData
        .map(d => ({ date: d.date, value: d[metric.id] || 0 }))
        .filter(d => d.value !== undefined);
      
      // Add line
      g.append('path')
        .datum(metricData)
        .attr('class', `line line-${metric.id}`)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', metric.color || d3.schemeTableau10[i % 10])
        .attr('stroke-width', 2);
      
      // Add legend item
      g.append('circle')
        .attr('cx', innerWidth + 10)
        .attr('cy', 20 + i * 25)
        .attr('r', 6)
        .attr('fill', metric.color || d3.schemeTableau10[i % 10]);
      
      g.append('text')
        .attr('x', innerWidth + 25)
        .attr('y', 25 + i * 25)
        .attr('class', 'legend-text')
        .text(metric.label || metric.id);
    });
    
    // Add labels
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 10)
      .text('Date');
    
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 15)
      .text('Value');
    
    // Add brushing
    const brush = d3.brushX()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on('end', (event) => {
        if (!event.selection) return;
        const [x0, x1] = event.selection.map(x.invert);
        // Here you would dispatch an action to update the time range
        console.log('Selected time range:', x0, x1);
        // Reset brush
        d3.select(brushRef.current).call(brush.move, null);
      });
    
    g.append('g')
      .attr('class', 'brush')
      .attr('ref', brushRef)
      .call(brush);
    
    // Add hover effects with vertical line
    const focus = g.append('g')
      .attr('class', 'focus')
      .style('display', 'none');
    
    focus.append('line')
      .attr('class', 'hover-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .style('stroke', theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '3,3');
    
    const voronoiGroup = g.append('g')
      .attr('class', 'voronoi');
    
    // Create points array with all metrics
    const points = [];
    filteredData.forEach(d => {
      metrics.forEach(metric => {
        if (d[metric.id] !== undefined) {
          points.push({
            date: new Date(d.date),
            metric: metric.id,
            value: d[metric.id],
            color: metric.color || d3.schemeTableau10[metrics.indexOf(metric) % 10],
            label: metric.label || metric.id,
            originalData: d
          });
        }
      });
    });
    
    // Create voronoi diagram for better mouse interaction
    const voronoi = d3.Delaunay
      .from(points, d => x(d.date), d => y(d.value))
      .voronoi([0, 0, innerWidth, innerHeight]);
    
    voronoiGroup.selectAll('path')
      .data(points)
      .enter()
      .append('path')
      .attr('d', (d, i) => voronoi.renderCell(i))
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', (event, d) => {
        focus.style('display', null);
        focus.select('.hover-line')
          .attr('x1', x(d.date))
          .attr('x2', x(d.date));
        
        setHoveredDate(d.originalData);
        
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`
            <strong>${formatDate(d.date)}</strong><br/>
            ${metrics.map(m => `${m.label || m.id}: ${formatNumber(d.originalData[m.id] || 0)}`).join('<br/>')}
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        focus.style('display', 'none');
        setHoveredDate(null);
        tooltip.style('opacity', 0);
      });
    
  }, [data, width, height, margin, scales, metrics, innerWidth, innerHeight, theme]);

  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

  return (
    <div className="line-chart-container">
      <svg ref={chartRef} className="line-chart"></svg>
      <div ref={tooltipRef} className="chart-tooltip"></div>
    </div>
  );
};

export default React.memo(LineChart);