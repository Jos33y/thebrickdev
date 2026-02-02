/**
 * LoginForm - Portal login form
 * 
 * Handles:
 * - Email/password input
 * - Form submission
 * - Error display (clears on typing)
 * - Loading state
 * - Redirect after login
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the page they tried to visit before being redirected to login
  const from = location.state?.from?.pathname || '/portal/dashboard';

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous error
    setError('');

    // Basic validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        // Redirect to the page they tried to visit or dashboard
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {/* Error message */}
      {error && (
        <div className="login-form__error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Email field */}
      <div className="login-form__field">
        <label htmlFor="email" className="login-form__label">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          className="login-form__input"
          value={email}
          onChange={handleEmailChange}
          placeholder="you@example.com"
          disabled={isSubmitting}
          autoComplete="email"
          autoFocus
        />
      </div>

      {/* Password field */}
      <div className="login-form__field">
        <label htmlFor="password" className="login-form__label">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="login-form__input"
          value={password}
          onChange={handlePasswordChange}
          placeholder="••••••••"
          disabled={isSubmitting}
          autoComplete="current-password"
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="login-form__button"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="login-form__spinner" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};

export default LoginForm;