/**
 * EmptyState - Displayed when no data is available
 */

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-state__icon">
          <Icon size={48} />
        </div>
      )}
      
      {title && (
        <h3 className="empty-state__title">{title}</h3>
      )}
      
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      
      {action && (
        <div className="empty-state__action">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
