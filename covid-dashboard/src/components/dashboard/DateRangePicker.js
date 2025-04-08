// src/components/dashboard/DateRangePicker.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDateRange } from '../../redux/actions/uiActions';
import '../../styles/components/dashboard.css';

const presetRanges = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '1 Year', days: 365 },
  { label: 'All Time', days: 0 }
];

const DateRangePicker = ({ onChange, startDate, endDate }) => {
  const dispatch = useDispatch();
  const { dateRange = { preset: 30, start: '', end: '' } } = useSelector(state => state.ui);

  // Initialize with default 30 days if no dateRange is set
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) {
      handleRangeChange(30);
    }
  }, []);

  const handleRangeChange = (days) => {
    let startDate, endDate;
    if (days === 0) {
      // All time range
      startDate = new Date(2020, 0, 22); // First day of COVID data
      endDate = new Date();
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
    }

    const newRange = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      preset: days
    };
    
    dispatch(setDateRange(newRange));
    
    // Call the parent component's onChange handler if provided
    if (onChange) {
      onChange(newRange);
    }
  };

  const handleStartDateChange = (e) => {
    const newRange = {
      ...dateRange,
      start: e.target.value,
      preset: null
    };
    
    dispatch(setDateRange(newRange));
    
    if (onChange) {
      onChange(newRange);
    }
  };

  const handleEndDateChange = (e) => {
    const newRange = {
      ...dateRange,
      end: e.target.value,
      preset: null
    };
    
    dispatch(setDateRange(newRange));
    
    if (onChange) {
      onChange(newRange);
    }
  };

  // Use props if provided, otherwise fall back to Redux state
  const displayStartDate = startDate || dateRange.start || '';
  const displayEndDate = endDate || dateRange.end || '';
  const currentPreset = dateRange?.preset;

  return (
    <div className="date-range-picker">
      <div className="date-range-presets">
        {presetRanges.map(range => (
          <button
            key={range.days}
            className={`preset-button ${currentPreset === range.days ? 'active' : ''}`}
            onClick={() => handleRangeChange(range.days)}
          >
            {range.label}
          </button>
        ))}
      </div>
      <div className="date-range-custom">
        <div className="date-input-group">
          <label htmlFor="start-date">From:</label>
          <input
            id="start-date"
            type="date"
            value={displayStartDate}
            onChange={handleStartDateChange}
            max={displayEndDate}
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="end-date">To:</label>
          <input
            id="end-date"
            type="date"
            value={displayEndDate}
            onChange={handleEndDateChange}
            min={displayStartDate}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;