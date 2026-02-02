/**
 * TextArea - Multi-line text input with label and error states
 */

import { forwardRef } from 'react';

const TextArea = forwardRef(({
  label,
  error,
  hint,
  id,
  className = '',
  required = false,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  return (
    <div className={`form-field ${hasError ? 'form-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className="form-field__textarea"
        aria-invalid={hasError}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
        {...props}
      />
      
      {error && (
        <span id={`${textareaId}-error`} className="form-field__error">
          {error}
        </span>
      )}
      
      {hint && !error && (
        <span id={`${textareaId}-hint`} className="form-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
