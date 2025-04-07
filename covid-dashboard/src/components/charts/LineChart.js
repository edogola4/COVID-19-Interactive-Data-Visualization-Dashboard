// src / components / charts / LineChart.js
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useResponsive } from '../../hooks/useResponsive';
import { CHART_CONFIGS } from '../../constants/chartConfigs';
import '../../styles/components/charts.css';

const MergedLineChart = ({
  data,
  width = CHART_CONFIGS?.LINE_CHART?.width || 800,
  height = CHART_CONFIGS?.LINE_CHART?.height || 400,
  margin = CHART_CONFIGS?.LINE_CHART?.margin || { top: 20, right: 30, bottom: 50, left: 60 },
  metrics = ['confirmed', 'active', 'recovered', 'deaths'],
  title = 'COVID-19 Time Series',
  enableBrush = true,
  showTooltip = true
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const brushRef = useRef(null);
  const { isMobile } = useResponsive();
  const [currentData, setCurrentData] = useState([]);
  const [activeMetrics, setActiveMetrics] = useState(metrics);

  // Stabilize the colorMap using useMemo
  const colorMap = useMemo(() => ({
    confirmed: 'var(--confirmed-color)',
    active: 'var(--active-color)',
    recovered: 'var(--recovered-color)',
    deaths: 'var(--deaths-color)',
    vaccinated: 'var(--vaccinated-color)',
    // fallback if using "value" only data
    value: '#007bff'
  }), []);

  // Process data when it changes: sort by date (ascending)
  useEffect(() => {
    if (!data || data.length === 0) return;
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    setCurrentData(sortedData);
  }, [data]);

  // Toggle metrics on/off when clicking the legend
  const toggleMetric = (metric) => {
    setActiveMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  };

  // Render the line chart
  useEffect(() => {
    if (!currentData || currentData.length === 0 || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Main SVG group
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (time)
    const xScale = d3.scaleTime()
      .domain(d3.extent(currentData, d => new Date(d.date)))
      .range([0, innerWidth]);

    // Compute maximum y value across active metrics
    const yMax = d3.max(currentData, d => 
      d3.max(activeMetrics, metric => d[metric] || 0)
    ) || 0;

    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([innerHeight, 0]);

    // Add X grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(isMobile ? 5 : 10)
          .tickSize(-innerHeight)
          .tickFormat('')
      );

    // Add Y grid lines
    svg.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat('')
      );

    // X Axis
    svg.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(isMobile ? 5 : 10)
          .tickFormat(d => d3.timeFormat('%b %d')(d))
      )
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Y Axis
    svg.append('g')
      .attr('class', 'axis y-axis')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat(d => {
            if (d >= 1000000) return `${(d / 1000000).toFixed(1)}M`;
            if (d >= 1000) return `${(d / 1000).toFixed(1)}K`;
            return d;
          })
      );

    // Line and area generators
    const line = d3.line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const area = d3.area()
      .x(d => xScale(new Date(d.date)))
      .y0(innerHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Tooltip setup
    const tooltip = showTooltip ? d3.select(tooltipRef.current) : null;
    const tooltipLine = svg.append('line')
      .attr('class', 'tooltip-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('opacity', 0);

    if (showTooltip) {
      const overlay = svg.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', 'none')
        .attr('pointer-events', 'all');

      overlay.on('mousemove', function(event) {
        const [xPos] = d3.pointer(event);
        const bisectDate = d3.bisector(d => new Date(d.date)).left;
        const x0 = xScale.invert(xPos);
        const i = bisectDate(currentData, x0, 1);
        const d0 = currentData[i - 1];
        const d1 = currentData[i];
        if (!d0 || !d1) return;
        const dPoint = (x0 - new Date(d0.date)) > (new Date(d1.date) - x0) ? d1 : d0;
        tooltipLine
          .attr('x1', xScale(new Date(dPoint.date)))
          .attr('x2', xScale(new Date(dPoint.date)))
          .attr('opacity', 1);
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`
            <div class="chart-tooltip-title">${new Date(dPoint.date).toLocaleDateString()}</div>
            ${activeMetrics.map(metric => `
              <div class="chart-tooltip-value">
                <span style="color:${colorMap[metric]}">${metric.charAt(0).toUpperCase() + metric.slice(1)}:</span>
                <span>${(dPoint[metric] || 0).toLocaleString()}</span>
              </div>
            `).join('')}
          `);
      })
      .on('mouseleave', function() {
        tooltipLine.attr('opacity', 0);
        tooltip.style('opacity', 0);
      });
    }

    // Draw lines and areas for each active metric
    activeMetrics.forEach(metric => {
      // Prepare data for the metric
      const metricData = currentData.map(d => ({
        date: d.date,
        value: d[metric] || 0
      }));
      // Draw area
      svg.append('path')
        .datum(metricData)
        .attr('class', `area area-${metric}`)
        .attr('d', area)
        .attr('fill', colorMap[metric])
        .attr('opacity', 0.2);
      // Draw line
      svg.append('path')
        .datum(metricData)
        .attr('class', `line line-${metric}`)
        .attr('fill', 'none')
        .attr('stroke', colorMap[metric])
        .attr('stroke-width', 2)
        .attr('d', line);
    });

    // Add brush for date range selection if enabled
    if (enableBrush && brushRef.current) {
      const brush = d3.brushX()
        .extent([[0, 0], [innerWidth, innerHeight]])
        .on('end', (event) => {
          if (!event.selection) return;
          const [x0, x1] = event.selection.map(xScale.invert);
          console.log('Selected date range:', x0, x1);
        });
      svg.append('g')
        .attr('class', 'brush')
        .call(brush);
    }

    // If data is insufficient, display a message
    if (currentData.length <= 1) {
      svg.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .text('Insufficient data available');
    }
  }, [currentData, width, height, margin, activeMetrics, colorMap, enableBrush, showTooltip, isMobile]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      <div className="chart-body">
        <div className="chart line-chart">
          <svg ref={svgRef}></svg>
          {showTooltip && (
            <div ref={tooltipRef} className="chart-tooltip" style={{ opacity: 0 }}></div>
          )}
          {enableBrush && <div ref={brushRef} style={{ display: 'none' }}></div>}
        </div>
        <div className="chart-legend">
          {metrics.map(metric => (
            <div 
              key={metric}
              className={`legend-item ${activeMetrics.includes(metric) ? '' : 'disabled'}`}
              onClick={() => toggleMetric(metric)}
            >
              <div 
                className="legend-color" 
                style={{ backgroundColor: colorMap[metric] }}
              ></div>
              <span className="legend-text">
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MergedLineChart);
