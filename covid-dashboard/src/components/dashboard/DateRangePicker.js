 // src / components / dashboard / DateRangePicker.js
 import React from 'react';
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
 
 const DateRangePicker = () => {
   const dispatch = useDispatch();
   const { dateRange } = useSelector(state => state.ui);
   
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
     
     dispatch(setDateRange({ 
       start: startDate.toISOString().split('T')[0],
       end: endDate.toISOString().split('T')[0],
       preset: days
     }));
   };
   
   const handleStartDateChange = (e) => {
     dispatch(setDateRange({
       ...dateRange,
       start: e.target.value,
       preset: null
     }));
   };
   
   const handleEndDateChange = (e) => {
     dispatch(setDateRange({
       ...dateRange,
       end: e.target.value,
       preset: null
     }));
   };
   
   return (
     <div className="date-range-picker">
       <div className="date-range-presets">
         {presetRanges.map(range => (
           <button 
             key={range.days}
             className={`preset-button ${dateRange.preset === range.days ? 'active' : ''}`}
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
             value={dateRange.start}
             onChange={handleStartDateChange}
             max={dateRange.end}
           />
         </div>
         
         <div className="date-input-group">
           <label htmlFor="end-date">To:</label>
           <input
             id="end-date"
             type="date"
             value={dateRange.end}
             onChange={handleEndDateChange}
             min={dateRange.start}
             max={new Date().toISOString().split('T')[0]}
           />
         </div>
       </div>
     </div>
   );
 };
 
 export default React.memo(DateRangePicker);