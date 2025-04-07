// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import Dashboard from './components/dashboard/Dashboard';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import useFetch from './hooks/useFetch';
import './styles/global.css';

const AppContent = () => {
  useFetch();
  return (
    <>
      <Header />
      <Dashboard />
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;