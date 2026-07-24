/**
 * PortalLayout - Main layout wrapper for portal pages
 * 
 * Protected by authentication.
 * Contains sidebar navigation and main content area.
 */

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BrickMark } from '../../components/common';
import { ProtectedRoute } from '../../components/portal/auth';
import {
  DashboardIcon,
  ClientsIcon,
  InvoiceIcon,
  PaymentIcon,
  ProspectsIcon,
  SettingsIcon,
  LogoutIcon,
} from '../../components/common/Icons';

// Inline CalculatorIcon — TODO: move to components/common/Icons.jsx
const CalculatorIcon = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="16" y1="14" x2="16" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);

const PortalLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) { 
      navigate('/portal/login', { replace: true });
    }
  };

  // Navigation items
  const navItems = [
    { path: '/portal/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/portal/prospects', label: 'Prospects', icon: ProspectsIcon },
    { path: '/portal/clients', label: 'Clients', icon: ClientsIcon },
    { path: '/portal/invoices', label: 'Invoices', icon: InvoiceIcon },
    { path: '/portal/payments', label: 'Payments', icon: PaymentIcon },
    { path: '/portal/fee-calculator', label: 'Fee Calculator', icon: CalculatorIcon },
    { path: '/portal/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <ProtectedRoute>
      <div className="portal">
        <div className="portal-wrapper">
          {/* Sidebar */}
          <aside className="portal-sidebar">
            {/* Logo */}
            <div className="portal-sidebar__logo">
              <BrickMark size={32} />
              <div className="portal-sidebar__brand-text">
                <span className="portal-sidebar__brand">THE BRICK DEV</span>
                <span className="portal-sidebar__brand-sub">Portal</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="portal-sidebar__nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `portal-sidebar__link ${isActive ? 'portal-sidebar__link--active' : ''}`
                  }
                >
                  <item.icon size={18} className="portal-sidebar__link-icon" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User section */}
            <div className="portal-sidebar__user">
              <div className="portal-sidebar__user-info">
                <span className="portal-sidebar__user-email">
                  {user?.email || 'Admin'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="portal-sidebar__logout"
              >
                <LogoutIcon size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="portal-main">
            {/* Top bar */}
            <header className="portal-topbar">
              <div className="portal-topbar__left">
                {/* Breadcrumb or title can go here */}
              </div>
              <div className="portal-topbar__right">
                {/* Actions can go here */}
              </div>
            </header>

            {/* Page content */}
            <div className="portal-content">
              <div className="portal-container">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PortalLayout;