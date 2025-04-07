// src / components / common / Filter.js
import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/components/charts.css';

const SimpleFilter = ({
  label,
  options,
  value,
  onChange,
  className = '',
  disabled = false
}) => {
  return (
    <div className={`filter-container ${className} ${disabled ? 'disabled' : ''}`}>
      {label && <label className="filter-label">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const AdvancedFilter = ({
  label,
  options,
  value,
  onChange,
  multiple = false,
  searchable = false,
  placeholder = 'Select an option',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery('');
      }
    }
  };

  const handleOptionClick = (option) => {
    if (multiple) {
      const newValue = value.includes(option.value)
        ? value.filter((v) => v !== option.value)
        : [...value, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const filteredOptions =
    searchable && searchQuery
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

  const getSelectedLabels = () => {
    if (multiple) {
      return value.length
        ? options
            .filter((option) => value.includes(option.value))
            .map((option) => option.label)
            .join(', ')
        : placeholder;
    } else {
      const selectedOption = options.find((option) => option.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Define handleClickOutside using useCallback so it can be added to useEffect's dependency list.
  const handleClickOutside = useCallback((e) => {
    if (isOpen && !e.target.closest('.filter-dropdown')) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  return (
    <div className={`filter-container ${className} ${disabled ? 'disabled' : ''}`}>
      {label && <label className="filter-label">{label}</label>}
      <div className="filter-dropdown">
        <div
          className={`filter-selected ${isOpen ? 'open' : ''}`}
          onClick={toggleDropdown}
        >
          <span className="selected-text">{getSelectedLabels()}</span>
          <span className="dropdown-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={isOpen ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
            </svg>
          </span>
        </div>
        {isOpen && (
          <div className="filter-options">
            {searchable && (
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}
            {filteredOptions.length > 0 ? (
              <ul>
                {filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    className={`
                      ${multiple && value.includes(option.value) ? 'selected' : ''}
                      ${!multiple && value === option.value ? 'selected' : ''}
                    `}
                    onClick={() => handleOptionClick(option)}
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={value.includes(option.value)}
                        readOnly
                      />
                    )}
                    {option.label}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-options">No options found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Filter = (props) => {
  const { variant = 'simple' } = props;
  return variant === 'advanced' ? <AdvancedFilter {...props} /> : <SimpleFilter {...props} />;
};

export default Filter;
