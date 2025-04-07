// src / components / charts / PieChart.js
import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { CHART_CONFIGS } from '../../constants/chartConfigs';
import { formatNumber, formatPercent } from '../../utils/formatters';
import '../../styles/components/charts.css';

const PieChart = ({
  data,
  // Allow passing custom dimensions, but fall back to CHART_CONFIGS if not provided
  width,
  height,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  innerRadius = 0, // 0 for a pie chart; > 0 for a donut chart
  metric = 'value',
  colorScheme = d3.schemeTableau10,
  onSliceClick = () => {}
}) => {
  const chartRef = useRef();
  const tooltipRef = useRef();
  // eslint-disable-next-line no-unused-vars
  const [activeSlice, setActiveSlice] = useState(null);

  // Use provided width/height or fallback to CHART_CONFIGS values
  const defaultWidth =
    width || (CHART_CONFIGS && CHART_CONFIGS.PIE_CHART && CHART_CONFIGS.PIE_CHART.width) || 400;
  const defaultHeight =
    height || (CHART_CONFIGS && CHART_CONFIGS.PIE_CHART && CHART_CONFIGS.PIE_CHART.height) || 400;

  // Calculate chart radius based on available space (accounting for margins)
  const radius = Math.min(
    defaultWidth - margin.left - margin.right,
    defaultHeight - margin.top - margin.bottom
  ) / 2;

  // Prepare chart data with memoization
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Filter out entries with non-positive values for the given metric
    const filteredData = data.filter(d => d[metric] > 0);
    const color = d3.scaleOrdinal()
      .domain(filteredData.map(d => d.label))
      .range(colorScheme);

    // Create pie and arc generators
    const pie = d3.pie()
      .value(d => d[metric])
      .sort(null); // Maintain input order
    const pieData = pie(filteredData);
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(3)
      .padAngle(0.01);
    const hoverArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius * 1.05)
      .cornerRadius(3)
      .padAngle(0.01);
    const total = d3.sum(filteredData, d => d[metric]);

    return { pieData, color, arc, hoverArc, total };
  }, [data, metric, radius, innerRadius, colorScheme]);

  // Build chart
  useEffect(() => {
    if (!chartData || !data || data.length === 0) return;

    const svg = d3.select(chartRef.current);
    const tooltip = d3.select(tooltipRef.current);
    const { pieData, color, arc, hoverArc, total } = chartData;

    // Clear any previous contents
    svg.selectAll('*').remove();
    svg.attr('width', defaultWidth).attr('height', defaultHeight);

    // Create the main group, centered within the SVG
    const g = svg.append('g')
      .attr('transform', `translate(${defaultWidth / 2},${defaultHeight / 2})`);

    // Draw each slice
    const slices = g.selectAll('.arc')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'arc');

    slices.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setActiveSlice(d);
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('d', hoverArc);
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`
            <strong>${d.data.label}</strong><br/>
            ${formatNumber(d.data[metric])} (${formatPercent(d.data[metric] / total)})
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', (event, d) => {
        setActiveSlice(null);
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('d', arc);
        tooltip.style('opacity', 0);
      })
      .on('click', (event, d) => {
        onSliceClick(d.data);
      });

    // Add labels for slices that are large enough
    const labelArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    slices.append('text')
      .attr('transform', d => {
        // Only show label if slice is large enough (> 5% of the circle)
        if ((d.endAngle - d.startAngle) < 0.1) return 'scale(0)';
        return `translate(${labelArc.centroid(d)})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('class', 'pie-label')
      .text(d => {
        // Only show percentage if the slice is sufficiently large
        if ((d.endAngle - d.startAngle) < 0.2) return '';
        return formatPercent(d.data[metric] / total);
      });

    // Add legend if there aren’t too many slices
    const legendG = svg.append('g')
      .attr('class', 'legend-group')
      .attr('transform', `translate(${defaultWidth - 100}, 20)`);

    if (pieData.length <= 10) {
      const legend = legendG.selectAll('.legend')
        .data(pieData)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`);

      legend.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', d => color(d.data.label));

      legend.append('text')
        .attr('x', 20)
        .attr('y', 10)
        .attr('class', 'legend-text')
        .text(d => d.data.label.length > 12 ? d.data.label.slice(0, 12) + '...' : d.data.label);
    }
  }, [data, defaultWidth, defaultHeight, margin, chartData, onSliceClick, metric, radius]);

  // Display a placeholder if there is no data
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

  return (
    <div className="pie-chart-container">
      <svg ref={chartRef} className="pie-chart"></svg>
      <div ref={tooltipRef} className="chart-tooltip"></div>
    </div>
  );
};

export default React.memo(PieChart);
