import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CHART_CONFIGS } from '../../constants/chartConfigs';

const LineChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height, margin } = CHART_CONFIGS.LINE_CHART;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.date)))
      .range([0, chartWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([chartHeight, 0]);

    const line = d3
      .line()
      .x((d) => x(new Date(d.date)))
      .y((d) => y(d.value));

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#007bff')
      .attr('stroke-width', 2)
      .attr('d', line);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));

    g.append('g').call(d3.axisLeft(y));
  }, [data]);

  return <svg ref={svgRef} width="100%" height={CHART_CONFIGS.LINE_CHART.height}></svg>;
};

export default React.memo(LineChart);