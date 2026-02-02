/**
 * Input - Text input with label and error states
 */

import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  type = 'text',
  id,
  className = '',
  required = false,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  return (
    <div className={`form-field ${hasError ? 'form-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      
      <div className="form-field__input-wrapper">
        {Icon && (
          <span className="form-field__icon">
            <Icon size={18} />
          </span>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={`form-field__input ${Icon ? 'form-field__input--with-icon' : ''}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
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

Input.displayName = 'Input';

export default Input;
