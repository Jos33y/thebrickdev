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
  SettingsIcon,
  LogoutIcon,
} from '../../components/common/Icons';

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
    { path: '/portal/clients', label: 'Clients', icon: ClientsIcon },
    { path: '/portal/invoices', label: 'Invoices', icon: InvoiceIcon },
    { path: '/portal/payments', label: 'Payments', icon: PaymentIcon },
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