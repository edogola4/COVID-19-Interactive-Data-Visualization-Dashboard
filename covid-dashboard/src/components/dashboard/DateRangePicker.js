 // src / components / dashboard / DateRangePicker.js
 import React from 'react';
import { useDispatch } from 'react-redux';
import { setDateRange } from '../../redux/actions/dataActions';

const DateRangePicker = () => {
  const dispatch = useDispatch();

  const handleChange = (type, value) => {
    dispatch(setDateRange({ [type]: value }));
  };

  return (
    <div className="date-range-picker">
      <input type="date" onChange={(e) => handleChange('start', e.target.value)} />
      <input type="date" onChange={(e) => handleChange('end', e.target.value)} />
    </div>
  );
};

export default DateRangePicker;