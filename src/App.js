import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/global.css';

// Lazy loaded components for code splitting
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const CountryDetails = lazy(() => import('./components/dashboard/CountryDetails'));
const Comparison = lazy(() => import('./components/dashboard/Comparison'));
const About = lazy(() => import('./components/pages/About'));

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ErrorBoundary>
          <div className="app">
            <Header />
            <main className="main-content">
              <Suspense fallback={<Loader message="Loading content..." />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/country/:countryId" element={<CountryDetails />} />
                  <Route path="/compare" element={<Comparison />} />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<div className="not-found">Page not found</div>} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </Router>
    </Provider>
  );
}

export default App;