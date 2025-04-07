 // src / constants / colorScales.js

 import * as d3 from 'd3';

export const COLOR_SCALES = {
  CASES: d3.scaleSequential(d3.interpolateBlues),
  DEATHS: d3.scaleSequential(d3.interpolateReds),
};