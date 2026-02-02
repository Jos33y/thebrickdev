/**
 * SearchInput - Search input with icon and clear button
 */

import { forwardRef } from 'react';
import { SearchIcon, CloseIcon } from '../../common/Icons';

const SearchInput = forwardRef(({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...props
}, ref) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };
  
  return (
    <div className={`search-input ${className}`}>
      <span className="search-input__icon">
        <SearchIcon size={18} />
      </span>
      <input
        ref={ref}
        type="text"
        className="search-input__field"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
      {value && (
        <button
          type="button"
          className="search-input__clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
