// src / hooks / useResponsive.js
import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Custom hook for responsive design calculations and viewport changes
 * @returns {Object} - Responsive information and helper functions
 */
const useResponsive = () => {
  // Define breakpoints with useMemo for a stable reference
  const breakpoints = useMemo(() => ({
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
  }), []);

  // Initial state based on window size
  const getInitialDimensions = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [dimensions, setDimensions] = useState(getInitialDimensions);

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions(getInitialDimensions());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current breakpoint
  const getBreakpoint = useCallback(() => {
    const { width } = dimensions;
    
    if (width >= breakpoints.xxl) return 'xxl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }, [breakpoints.lg, breakpoints.md, breakpoints.sm, breakpoints.xl, breakpoints.xxl, dimensions]);

  // Check if current viewport is at least a specific breakpoint
  const isAtLeast = useCallback((breakpoint) => {
    const { width } = dimensions;
    return width >= breakpoints[breakpoint];
  }, [breakpoints, dimensions]);

  // Check if current viewport is at most a specific breakpoint
  const isAtMost = useCallback((breakpoint) => {
    const { width } = dimensions;
    return width < breakpoints[breakpoint === 'xs' ? 'sm' : breakpoint];
  }, [breakpoints, dimensions]);

  // Get width in percentage of the viewport
  const widthPercent = useCallback((percent) => {
    return (dimensions.width * percent) / 100;
  }, [dimensions.width]);

  // Get height in percentage of the viewport
  const heightPercent = useCallback((percent) => {
    return (dimensions.height * percent) / 100;
  }, [dimensions.height]);

  // Get number of columns for grid layout based on viewport
  const getGridColumns = useCallback(() => {
    const breakpoint = getBreakpoint();
    
    switch (breakpoint) {
      case 'xs':
        return 1;
      case 'sm':
        return 2;
      case 'md':
        return 2;
      case 'lg':
        return 3;
      case 'xl':
      case 'xxl':
        return 4;
      default:
        return 2;
    }
  }, [getBreakpoint]);

  return {
    dimensions,
    breakpoint: getBreakpoint(),
    isMobile: isAtMost('sm'),
    isTablet: isAtLeast('md') && isAtMost('lg'),
    isDesktop: isAtLeast('lg'),
    isAtLeast,
    isAtMost,
    widthPercent,
    heightPercent,
    getGridColumns,
    breakpoints,
  };
};

export default useResponsive;