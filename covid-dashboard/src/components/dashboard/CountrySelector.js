// src / components / dashboard / CountrySelector.js
import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCountry } from '../../redux/actions/uiActions';
import '../../styles/components/dashboard.css';

const CountrySelector = () => {
  const dispatch = useDispatch();
  const { countriesData } = useSelector(state => state.data);
  const { selectedCountry } = useSelector(state => state.ui);
  
  const sortedCountries = useMemo(() => {
    if (!countriesData) return [];
    
    return [...countriesData]
      .sort((a, b) => a.country.localeCompare(b.country))
      .map(country => country.country);
  }, [countriesData]);
  
  const handleCountryChange = (e) => {
    const country = e.target.value;
    dispatch(setSelectedCountry(country === 'Global' ? null : country));
  };
  
  return (
    <div className="country-selector">
      <label htmlFor="country-select">Select Country:</label>
      <select 
        id="country-select"
        value={selectedCountry || 'Global'}
        onChange={handleCountryChange}
      >
        <option value="Global">Global</option>
        {sortedCountries.map(country => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
    </div>
  );
};

export default React.memo(CountrySelector);