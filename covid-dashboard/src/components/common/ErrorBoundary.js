// src / components / common / ErrorBoundary.js
import React from 'react';
import '../../styles/components/charts.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error information
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.showDetails) {
        return (
          <div className="error-container">
            <div className="error-content">
              <div className="error-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h2>Something went wrong</h2>
              <p>We apologize for the inconvenience. Please try refreshing the page.</p>
              {this.state.error && (
                <div className="error-details">
                  <h3>Error Details</h3>
                  <p>{this.state.error.toString()}</p>
                  <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                </div>
              )}
              <button 
                className="reset-button"
                onClick={() => {
                  this.setState({ hasError: false });
                  // If a retry function is provided, call it
                  if (typeof this.props.onRetry === 'function') {
                    this.props.onRetry();
                  }
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        );
      } else {
        return <h1>Something went wrong.</h1>;
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
