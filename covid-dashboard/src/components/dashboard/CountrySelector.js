// src / components / dashboard / CountrySelector.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Filter from '../common/Filter';
import { setSelectedCountry } from '../../redux/actions/dataActions';

const CountrySelector = () => {
  const dispatch = useDispatch();
  const countries = useSelector((state) => state.data.countries);
  const selectedCountry = useSelector((state) => state.data.selectedCountry);

  const options = countries.map((country) => ({
    value: country,
    label: country,
  }));

  const handleChange = (value) => {
    dispatch(setSelectedCountry(value));
  };

  return <Filter options={options} value={selectedCountry} onChange={handleChange} />;
};

export default CountrySelector;