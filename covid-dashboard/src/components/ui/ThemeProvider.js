import React, { createContext, useContext, useState } from 'react';

// Create a Context for the theme (light or dark)
const ThemeContext = createContext();

// Provider component that holds the theme state and toggle function
export const ThemeProvider = ({ children }) => {
  // Set the initial theme. You could also initialize this from localStorage or props.
  const [theme, setTheme] = useState('light');

  // A function to toggle the theme between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // The value that will be accessible to any components that consume this context
  const contextValue = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for consuming the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Export the provider as the default export if that's what your imports expect
export default ThemeProvider;
