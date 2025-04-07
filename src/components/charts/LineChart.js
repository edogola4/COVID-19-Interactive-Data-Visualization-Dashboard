// src/components/charts/LineChart.js
import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import useResponsive from '../../hooks/useResponsive';
import { formatNumber, formatDate } from '../../utils/formatters';
import '../../styles/components/charts.css';

const LineChart = ({ data, dateRange, metrics = ['cases'], countryMode = false }) => {
  const chartRef = useRef(null);
  const { theme } = useSelector(state => state.ui);
  const dimensions = useResponsive(chartRef, {
    width: 800,
    height: 400,
    margin: { top: 20, right: 80, bottom: 40, left: 60 }
  });

  // Process and prepare the data for rendering
  const processedData = useMemo(() => {
    if (!data) return [];
    
    // Determine if we're handling global data or country-specific data
    let timelineData = data;
    
    // For country-specific data format
    if (countryMode && data.timeline) {
      timelineData = data.timeline;
    }
    
    // Filter dates based on dateRange
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    // Process the data for each metric
    return metrics.map(metric => {
      // Skip if this metric doesn't exist in the data
      if (!timelineData[metric]) return { metric, values: [] };
      
      const values = Object.entries(timelineData[metric])
        .map(([date, value]) => {
          const parsedDate = new Date(date);
          return { date: parsedDate, value };
        })
        .filter(d => {
          return d.date >= startDate && d.date <= endDate;
        })
        .sort((a, b) => a.date - b.date);
      
      return { metric, values };
    }).filter(series => series.values.length > 0);
  }, [data, dateRange, metrics, countryMode]);

  // Render the chart when data and dimensions are available
  useEffect(() => {
    if (!dimensions || processedData.length === 0) return;
    
    const { width, height, margin } = dimensions;
    
    // Clear any existing SVG
    d3.select(chartRef.current).selectAll("*").remove();
    
    // Set up scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData[0].values, d => d.date))
      .range([margin.left, width - margin.right]);
    
    // Find the maximum value across all metrics for the y scale
    const maxValue = d3.max(processedData, series => 
      d3.max(series.values, d => d.value)
    );
    
    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding at the top
      .range([height - margin.bottom, margin.top]);
    
    // Define color scheme based on theme and metrics
    const colorScheme = {
      cases: theme === 'dark' ? '#64B5F6' : '#2196F3',
      deaths: theme === 'dark' ? '#EF5350' : '#D32F2F',
      recovered: theme === 'dark' ? '#66BB6A' : '#388E3C',
      active: theme === 'dark' ? '#FFCA28' : '#FFA000',
      tests: theme === 'dark' ? '#BA68C8' : '#9C27B0',
      vaccinations: theme === 'dark' ? '#4DB6AC' : '#009688'
    };
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");
    
    // Add X axis
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .ticks(width > 600 ? 10 : 5)
        .tickFormat(d3.timeFormat("%b %d"))
      );
    
    // Style X axis
    xAxis.selectAll("line")
      .attr("stroke", theme === 'dark' ? "#555" : "#ccc");
    xAxis.selectAll("path")
      .attr("stroke", theme === 'dark' ? "#555" : "#ccc");
    xAxis.selectAll("text")
      .attr("fill", theme === 'dark' ? "#ddd" : "#333")
      .style("font-size", "12px");
    
    // Add X axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .text("Date")
      .attr("fill", theme === 'dark' ? "#ddd" : "#555")
      .style("font-size", "14px");
    
    // Add Y axis
    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(height > 400 ? 10 : 5)
        .tickFormat(d3.format(".2s"))
      );
    
    // Style Y axis
    yAxis.selectAll("line")
      .attr("stroke", theme === 'dark' ? "#555" : "#ccc");
    yAxis.selectAll("path")
      .attr("stroke", theme === 'dark' ? "#555" : "#ccc");
    yAxis.selectAll("text")
      .attr("fill", theme === 'dark' ? "#ddd" : "#333")
      .style("font-size", "12px");
    
    // Add Y axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 3)
      .attr("x", -(height / 2))
      .text("Count")
      .attr("fill", theme === 'dark' ? "#ddd" : "#555")
      .style("font-size", "14px");
    
    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .ticks(10)
        .tickSize(-(height - margin.top - margin.bottom))
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", theme === 'dark' ? "#333" : "#f0f0f0")
      .attr("stroke-opacity", 0.7);
    
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(10)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", theme === 'dark' ? "#333" : "#f0f0f0")
      .attr("stroke-opacity", 0.7);
    
    // Create line generator
    const line = d3.line()
      .defined(d => !isNaN(d.value))
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
    
    // Add lines for each metric
    processedData.forEach(series => {
      const color = colorScheme[series.metric] || "#999";
      
      // Only draw the line if we have at least 2 data points
      if (series.values.length >= 2) {
        // Add line path
        svg.append("path")
          .datum(series.values)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 3)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("d", line);
        
        // Add data points
        if (series.values.length <= 30) {
          svg.selectAll(`.dot-${series.metric}`)
            .data(series.values)
            .enter()
            .append("circle")
            .attr("class", `dot-${series.metric}`)
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d.value))
            .attr("r", 4)
            .attr("fill", color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);
        }
      }
    });
    
    // Add legend
    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(processedData)
      .enter().append("g")
      .attr("transform", (d, i) => `translate(${width - margin.right + 10},${margin.top + i * 25})`);
    
    legend.append("rect")
      .attr("x", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => colorScheme[d.metric] || "#999");
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .attr("fill", theme === 'dark' ? "#ddd" : "#555")
      .text(d => d.metric.charAt(0).toUpperCase() + d.metric.slice(1));
    
    // Add tooltip functionality
    const tooltip = d3.select(chartRef.current)
      .append("div")
      .attr("class", "chart-tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", theme === 'dark' ? "#333" : "#fff")
      .style("border", "1px solid " + (theme === 'dark' ? "#555" : "#ccc"))
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("pointer-events", "none");
    
    // Add hover functionality with tooltip
    const bisect = d3.bisector(d => d.date).left;
    
    const focus = svg.append("g")
      .style("display", "none");
    
    // Add vertical line for hover
    focus.append("line")
      .attr("class", "hover-line")
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", theme === 'dark' ? "#aaa" : "#777")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");
    
    // Create focus circles for each metric
    processedData.forEach(series => {
      focus.append("circle")
        .attr("class", `focus-circle-${series.metric}`)
        .attr("r", 6)
        .attr("fill", "none")
        .attr("stroke", colorScheme[series.metric] || "#999")
        .attr("stroke-width", 2);
    });
    
    // Create hover area
    svg.append("rect")
      .attr("class", "overlay")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseenter", () => focus.style("display", null))
      .on("mouseleave", () => {
        focus.style("display", "none");
        tooltip.style("opacity", 0);
      })
      .on("mousemove", (event) => {
        const mouseX = d3.pointer(event)[0];
        const x0 = xScale.invert(mouseX);
        
        let tooltipHtml = `<div class="tooltip-date">${formatDate(x0)}</div>`;
        
        // Update position for each series
        processedData.forEach(series => {
          const i = bisect(series.values, x0, 1);
          const d0 = series.values[i - 1];
          const d1 = series.values[i];
          
          // Skip if we don't have enough data points
          if (!d0 || !d1) return;
          
          const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
          
          // Update focus circle position
          focus.select(`.focus-circle-${series.metric}`)
            .attr("cx", xScale(d.date))
            .attr("cy", yScale(d.value));
          
          // Add to tooltip HTML
          tooltipHtml += `
            <div class="tooltip-item" style="color:${colorScheme[series.metric] || '#999'}">
              <span class="tooltip-label">${series.metric.charAt(0).toUpperCase() + series.metric.slice(1)}:</span>
              <span class="tooltip-value">${formatNumber(d.value)}</span>
            </div>
          `;
        });
        
        // Position vertical line
        focus.select(".hover-line")
          .attr("x1", mouseX)
          .attr("x2", mouseX);
        
        // Update tooltip
        tooltip.html(tooltipHtml)
          .style("opacity", 0.9)
          .style("left", `${event.pageX - chartRef.current.offsetLeft + 15}px`)
          .style("top", `${event.pageY - chartRef.current.offsetTop - 28}px`);
      });
    
  }, [dimensions, processedData, theme]);

  return (
    <div className="line-chart-container" ref={chartRef}></div>
  );
};

export default React.memo(LineChart);