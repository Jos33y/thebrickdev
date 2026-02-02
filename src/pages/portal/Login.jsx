/**
 * Login - Portal login page
 * 
 * Standalone page (no sidebar) for authentication.
 * Redirects to dashboard if already logged in.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BrickMark } from '../../components/common';
import { LoginForm } from '../../components/portal/auth';

const Login = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="portal portal-login">
        <div className="portal-login__container">
          <div className="portal-login__loading">
            <div className="portal-loading__spinner" />
          </div>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return (
    <div className="portal portal-login">
      {/* Background decoration */}
      <div className="portal-login__bg">
        <div className="portal-login__bg-grid" />
      </div>

      <div className="portal-login__container">
        {/* Logo/Brand */}
        <div className="portal-login__brand">
          <div className="portal-login__logo">
            <BrickMark size={48} />
          </div>
          <h1 className="portal-login__title">The Brick Dev</h1>
          <p className="portal-login__subtitle">Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="portal-login__card">
          <div className="portal-login__card-header">
            <h2>Welcome back</h2>
            <p>Sign in to access your dashboard</p>
          </div>
          
          <LoginForm />
          
          <div className="portal-login__card-footer">
            <div className="portal-login__secure">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Secure connection</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="portal-login__footer">
          <a href="/" className="portal-login__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to website
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;