/**
 * PageHeader - Page title with optional subtitle, back button, and actions
 */

import { useNavigate } from 'react-router-dom';
import { ArrowBackIcon } from '../../common/Icons';

const PageHeader = ({
  title,
  subtitle,
  backTo,
  backLabel,
  actions,
  className = '',
}) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div className={`page-header ${className}`}>
      {backTo !== undefined && (
        <button 
          type="button" 
          className="page-header__back"
          onClick={handleBack}
        >
          <ArrowBackIcon size={18} />
          <span>{backLabel || 'Back'}</span>
        </button>
      )}
      
      <div className="page-header__main">
        <div className="page-header__text">
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        
        {actions && (
          <div className="page-header__actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
