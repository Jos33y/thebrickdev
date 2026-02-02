/**
 * DatePicker - Date input with label and error states
 * Uses native HTML date input for simplicity and accessibility
 */

import { forwardRef } from 'react';
import { CalendarPickerIcon } from '../../common/Icons';

const DatePicker = forwardRef(({
  label,
  error,
  hint,
  id,
  className = '',
  required = false,
  ...props
}, ref) => {
  const inputId = id || `datepicker-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  return (
    <div className={`form-field ${hasError ? 'form-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      
      <div className="form-field__input-wrapper form-field__input-wrapper--date">
        <input
          ref={ref}
          type="date"
          id={inputId}
          className="form-field__input form-field__input--date"
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        <span className="form-field__date-icon">
          <CalendarPickerIcon size={18} />
        </span>
      </div>
      
      {error && (
        <span id={`${inputId}-error`} className="form-field__error">
          {error}
        </span>
      )}
      
      {hint && !error && (
        <span id={`${inputId}-hint`} className="form-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
