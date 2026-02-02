/**
 * Select - Dropdown select with label and error states
 */

import { forwardRef } from 'react';
import { ChevronDownIcon } from '../../common/Icons';

const Select = forwardRef(({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Select an option',
  id,
  className = '',
  required = false,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  return (
    <div className={`form-field ${hasError ? 'form-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      
      <div className="form-field__select-wrapper">
        <select
          ref={ref}
          id={selectId}
          className="form-field__select"
          aria-invalid={hasError}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className="form-field__select-icon">
          <ChevronDownIcon size={16} />
        </span>
      </div>
      
      {error && (
        <span id={`${selectId}-error`} className="form-field__error">
          {error}
        </span>
      )}
      
      {hint && !error && (
        <span id={`${selectId}-hint`} className="form-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
