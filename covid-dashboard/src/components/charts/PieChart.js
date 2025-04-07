// src / components / charts / PieChart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CHART_CONFIGS } from '../../constants/chartConfigs';

const PieChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = CHART_CONFIGS.PIE_CHART;
    const radius = Math.min(width, height) / 2;

    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie().value((d) => d.value);

    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = g
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i));
  }, [data]);

  return <svg ref={svgRef} width="100%" height={CHART_CONFIGS.PIE_CHART.height}></svg>;
};

export default React.memo(PieChart);