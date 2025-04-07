// src / components / charts / WorldMap.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { COLOR_SCALES } from '../../constants/colorScales';

const WorldMap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 960;
    const height = 600;

    const projection = d3.geoMercator().scale(150).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    const colorScale = COLOR_SCALES.CASES.domain([0, d3.max(data, (d) => d.cases)]);

    d3.json('/assets/world.geojson').then((world) => {
      const countries = topojson.feature(world, world.objects.countries).features;

      svg
        .append('g')
        .selectAll('path')
        .data(countries)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', (d) => {
          const countryData = data.find((c) => c.country === d.properties.name);
          return countryData ? colorScale(countryData.cases) : '#ccc';
        })
        .append('title')
        .text((d) => {
          const countryData = data.find((c) => c.country === d.properties.name);
          return countryData ? `${d.properties.name}: ${countryData.cases} cases` : d.properties.name;
        });
    });
  }, [data]);

  return <svg ref={svgRef} width="100%" height="600"></svg>;
};

export default React.memo(WorldMap);