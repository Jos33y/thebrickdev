/**
 * Card - Content container component
 * 
 * Variants: default, bordered
 * Can have header with title and actions
 */

const Card = ({
  children,
  title,
  subtitle,
  actions,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseClass = 'card';
  const variantClass = variant !== 'default' ? `card--${variant}` : '';
  const paddingClass = `card--padding-${padding}`;
  
  const classes = [baseClass, variantClass, paddingClass, className].filter(Boolean).join(' ');
  
  const hasHeader = title || subtitle || actions;
  
  return (
    <div className={classes} {...props}>
      {hasHeader && (
        <div className="card__header">
          <div className="card__header-text">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </div>
      )}
      <div className="card__body">
        {children}
      </div>
    </div>
  );
};

// Sub-component for card sections
Card.Section = ({ children, className = '', ...props }) => (
  <div className={`card__section ${className}`} {...props}>
    {children}
  </div>
);

// Sub-component for card footer
Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`card__footer ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
