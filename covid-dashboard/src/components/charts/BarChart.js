// src/components/charts/BarChart.js
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useResponsive } from '../../hooks/useResponsive';
import { CHART_CONFIGS } from '../../constants/chartConfigs';
import '../../styles/components/charts.css';

const MergedBarChart = ({
  data,
  width = CHART_CONFIGS?.BAR_CHART?.width || 800,
  height = CHART_CONFIGS?.BAR_CHART?.height || 400,
  margin = CHART_CONFIGS?.BAR_CHART?.margin || { top: 20, right: 30, bottom: 40, left: 60 },
  metric = 'confirmed',
  title = 'COVID-19 Bar Chart',
  showTooltip = true
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const { isMobile } = useResponsive();
  const [currentData, setCurrentData] = useState([]);

  // Wrap colorMap in useMemo so that its reference doesn't change on every render.
  const colorMap = useMemo(() => ({
    confirmed: 'var(--confirmed-color)',
    active: 'var(--active-color)',
    recovered: 'var(--recovered-color)',
    deaths: 'var(--deaths-color)',
    vaccinated: 'var(--vaccinated-color)'
  }), []);

  // Process incoming data and determine which key to use.
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Use a local variable instead of reassigning the prop 'metric'
    let effectiveMetric = metric;

    let processedData;
    if (data[0].hasOwnProperty(effectiveMetric)) {
      processedData = data.slice(0, 10).sort((a, b) => b[effectiveMetric] - a[effectiveMetric]);
    } else if (data[0].hasOwnProperty('value')) {
      processedData = data.slice(0, 10).sort((a, b) => b.value - a.value);
      effectiveMetric = 'value'; // update the local variable only
    } else {
      processedData = data;
    }
    setCurrentData(processedData);
  }, [data, metric]);

  useEffect(() => {
    if (!currentData || currentData.length === 0 || !svgRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(currentData.map(d => d.country || d.name))
      .range([0, innerWidth])
      .padding(0.2);

    // Determine the effective metric key for this effect.
    const effectiveMetric = currentData[0].hasOwnProperty(metric) ? metric : 'value';

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(currentData, d => d[effectiveMetric])])
      .nice()
      .range([innerHeight, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');

    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => {
        if (d >= 1000000) return `${(d / 1000000).toFixed(1)}M`;
        if (d >= 1000) return `${(d / 1000).toFixed(1)}K`;
        return d;
      }));

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -innerHeight / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', 'var(--font-size-sm)')
      .text(effectiveMetric.charAt(0).toUpperCase() + effectiveMetric.slice(1));

    const tooltip = showTooltip ? d3.select(tooltipRef.current) : null;

    svg.selectAll('.bar')
      .data(currentData)
      .enter()
      .append('rect')
      .attr('class', `bar bar-${effectiveMetric}`)
      .attr('x', d => xScale(d.country || d.name))
      .attr('y', d => yScale(d[effectiveMetric]))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d[effectiveMetric]))
      .attr('fill', colorMap[effectiveMetric] || '#007bff')
      .on('mouseover', function(event, d) {
        if (!showTooltip) return;
        d3.select(this).attr('opacity', 0.8);
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`
            <div class="chart-tooltip-title">${d.country || d.name}</div>
            <div class="chart-tooltip-value">
              <span>${effectiveMetric.charAt(0).toUpperCase() + effectiveMetric.slice(1)}:</span>
              <span>${(d[effectiveMetric]).toLocaleString()}</span>
            </div>
          `);
      })
      .on('mouseout', function() {
        if (!showTooltip) return;
        d3.select(this).attr('opacity', 1);
        tooltip.style('opacity', 0);
      });

    if (currentData.length === 0) {
      svg.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .text('No data available');
    }
  }, [currentData, width, height, margin, metric, colorMap, showTooltip, isMobile]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      <div className="chart-body">
        <div className="chart bar-chart">
          <svg ref={svgRef}></svg>
          {showTooltip && (
            <div
              ref={tooltipRef}
              className="chart-tooltip"
              style={{ opacity: 0 }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MergedBarChart);
