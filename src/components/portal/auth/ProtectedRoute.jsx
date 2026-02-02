/**
 * ProtectedRoute - Auth protection wrapper
 * 
 * Checks if user is authenticated:
 * - Shows loading state while checking
 * - Redirects to login if not authenticated
 * - Renders children if authenticated
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="portal portal-loading">
        <div className="portal-loading__content">
          <div className="portal-loading__spinner" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  // Render the protected content
  return children;
};

export default ProtectedRoute;