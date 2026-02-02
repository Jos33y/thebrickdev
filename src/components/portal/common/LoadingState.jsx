/**
 * LoadingState - Loading spinner/indicator
 * 
 * Variants: spinner, dots
 * Can be inline or full-page
 */

const LoadingState = ({
  text = 'Loading...',
  variant = 'spinner',
  size = 'md',
  fullPage = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };
  
  const spinnerSize = sizeMap[size] || sizeMap.md;
  
  const content = (
    <div className={`loading-state loading-state--${size} ${className}`}>
      {variant === 'spinner' && (
        <div 
          className="loading-state__spinner"
          style={{ width: spinnerSize, height: spinnerSize }}
        />
      )}
      
      {variant === 'dots' && (
        <div className="loading-state__dots">
          <span className="loading-state__dot" />
          <span className="loading-state__dot" />
          <span className="loading-state__dot" />
        </div>
      )}
      
      {text && <span className="loading-state__text">{text}</span>}
    </div>
  );
  
  if (fullPage) {
    return (
      <div className="loading-state__fullpage">
        {content}
      </div>
    );
  }
  
  return content;
};

// Skeleton loader for content placeholders
LoadingState.Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px',
  className = '' 
}) => (
  <div 
    className={`loading-skeleton ${className}`}
    style={{ width, height, borderRadius }}
  />
);

// Table row skeleton
LoadingState.TableRow = ({ columns = 4 }) => (
  <tr className="loading-table-row">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i}>
        <LoadingState.Skeleton height="1rem" width={i === 0 ? '60%' : '80%'} />
      </td>
    ))}
  </tr>
);

export default LoadingState;
