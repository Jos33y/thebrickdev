/**
 * ServiceIcons - Custom brick-styled icons for services
 * Geometric, block-themed designs that match The Brick Dev brand
 */

// Business Portal - Dashboard with sidebar and metric blocks
export const PortalIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer frame */}
    <rect x="2" y="3" width="28" height="26" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Sidebar */}
    <rect x="2" y="3" width="8" height="26" rx="3" fill="currentColor" opacity="0.3" />
    <rect x="4" y="7" width="4" height="2" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="4" y="11" width="4" height="1.5" rx="0.5" fill="currentColor" opacity="0.5" />
    <rect x="4" y="14" width="4" height="1.5" rx="0.5" fill="currentColor" opacity="0.5" />
    <rect x="4" y="17" width="4" height="1.5" rx="0.5" fill="currentColor" opacity="0.5" />
    {/* Top metric cards */}
    <rect x="12" y="6" width="7" height="5" rx="1.5" fill="currentColor" />
    <rect x="21" y="6" width="7" height="5" rx="1.5" fill="currentColor" opacity="0.6" />
    {/* Chart area */}
    <rect x="12" y="13" width="16" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
    {/* Chart bars */}
    <rect x="14" y="17" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.8" />
    <rect x="17.5" y="15.5" width="2" height="3.5" rx="0.5" fill="currentColor" opacity="0.8" />
    <rect x="21" y="16" width="2" height="3" rx="0.5" fill="currentColor" opacity="0.8" />
    <rect x="24.5" y="14.5" width="2" height="4.5" rx="0.5" fill="currentColor" />
    {/* Bottom row */}
    <rect x="12" y="22" width="7" height="4" rx="1.5" fill="currentColor" opacity="0.5" />
    <rect x="21" y="22" width="7" height="4" rx="1.5" fill="currentColor" opacity="0.3" />
  </svg>
);

// Website - Browser window with blocks
export const WebsiteIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="2" y="4" width="28" height="24" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="2" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="2" />
    <circle cx="6" cy="7" r="1.5" fill="currentColor" />
    <circle cx="10" cy="7" r="1.5" fill="currentColor" />
    <circle cx="14" cy="7" r="1.5" fill="currentColor" />
    <rect x="6" y="14" width="9" height="5" rx="1" fill="currentColor" />
    <rect x="17" y="14" width="9" height="5" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="6" y="21" width="20" height="3" rx="1" fill="currentColor" opacity="0.3" />
  </svg>
);

// E-commerce - Shopping bag with blocks
export const EcommerceIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M6 10H26L24 28H8L6 10Z" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M11 10V8C11 5.23858 13.2386 3 16 3C18.7614 3 21 5.23858 21 8V10" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="10" y="15" width="5" height="4" rx="1" fill="currentColor" />
    <rect x="17" y="15" width="5" height="4" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="13" y="21" width="6" height="3" rx="1" fill="currentColor" opacity="0.3" />
  </svg>
);

// Web Apps - Dashboard grid
export const WebAppIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="3" width="12" height="12" rx="2" fill="currentColor" />
    <rect x="17" y="3" width="12" height="5" rx="2" fill="currentColor" opacity="0.5" />
    <rect x="17" y="10" width="12" height="5" rx="2" fill="currentColor" opacity="0.5" />
    <rect x="3" y="17" width="8" height="12" rx="2" fill="currentColor" opacity="0.5" />
    <rect x="13" y="17" width="16" height="12" rx="2" fill="currentColor" opacity="0.7" />
  </svg>
);

// Mobile Apps - Phone with blocks
export const MobileAppIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="8" y="2" width="16" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="8" y1="6" x2="24" y2="6" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="26" x2="24" y2="26" stroke="currentColor" strokeWidth="2" />
    <rect x="11" y="9" width="10" height="6" rx="1" fill="currentColor" />
    <rect x="11" y="17" width="4" height="4" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="17" y="17" width="4" height="4" rx="1" fill="currentColor" opacity="0.5" />
    <circle cx="16" cy="28.5" r="1" fill="currentColor" opacity="0.5" />
  </svg>
);

// API & Backend - Server blocks
export const ApiIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="4" y="3" width="24" height="8" rx="2" fill="currentColor" />
    <rect x="4" y="13" width="24" height="8" rx="2" fill="currentColor" opacity="0.7" />
    <rect x="4" y="23" width="24" height="6" rx="2" fill="currentColor" opacity="0.4" />
    <circle cx="8" cy="7" r="1.5" fill="var(--bg-primary)" />
    <circle cx="8" cy="17" r="1.5" fill="var(--bg-primary)" />
    <rect x="20" y="5" width="5" height="2" rx="1" fill="var(--bg-primary)" />
    <rect x="20" y="15" width="5" height="2" rx="1" fill="var(--bg-primary)" />
  </svg>
);

// MVP Development - Rocket with blocks
export const MvpIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M16 3L20 10H12L16 3Z" fill="currentColor" />
    <rect x="11" y="10" width="10" height="12" rx="2" fill="currentColor" />
    <rect x="13" y="13" width="6" height="3" rx="1" fill="var(--bg-primary)" opacity="0.5" />
    <path d="M8 18L11 15V21L8 18Z" fill="currentColor" opacity="0.6" />
    <path d="M24 18L21 15V21L24 18Z" fill="currentColor" opacity="0.6" />
    <rect x="12" y="22" width="3" height="6" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="17" y="22" width="3" height="6" rx="1" fill="currentColor" opacity="0.5" />
  </svg>
);

// FinTech & Trading - Chart with blocks
export const FinTechIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="20" width="5" height="9" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="10" y="14" width="5" height="15" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="17" y="8" width="5" height="21" rx="1" fill="currentColor" />
    <rect x="24" y="12" width="5" height="17" rx="1" fill="currentColor" opacity="0.7" />
    <path d="M5 16L10 10L17 14L27 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    <circle cx="27" cy="4" r="2" fill="currentColor" />
  </svg>
);

// Blockchain - Chain of blocks
export const BlockchainIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="2" y="12" width="8" height="8" rx="2" fill="currentColor" />
    <rect x="12" y="12" width="8" height="8" rx="2" fill="currentColor" opacity="0.7" />
    <rect x="22" y="12" width="8" height="8" rx="2" fill="currentColor" />
    <line x1="10" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
    <line x1="20" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="2" />
    <rect x="4" y="4" width="4" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="14" y="4" width="4" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="24" y="4" width="4" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <line x1="6" y1="8" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <line x1="16" y1="8" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <line x1="26" y1="8" x2="26" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <rect x="4" y="24" width="4" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="14" y="24" width="4" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="24" y="24" width="4" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <line x1="6" y1="20" x2="6" y2="24" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <line x1="16" y1="20" x2="16" y2="24" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <line x1="26" y1="20" x2="26" y2="24" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
  </svg>
);

// Maintenance & Support - Wrench with blocks
export const MaintenanceIcon = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M7 17L15 25L19 21L11 13L7 17Z" fill="currentColor" opacity="0.5" />
    <path d="M19 3C15.5 3 13 5.5 13 9C13 10.5 13.5 11.5 14 12.5L4 22.5L6.5 25L9.5 28L19.5 18C20.5 18.5 21.5 19 23 19C26.5 19 29 16.5 29 13C29 12 28.5 11 28 10L24 14L22 12L18 8L22 4C21 3.5 20 3 19 3Z" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="3" y="5" width="5" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="3" y="11" width="3" height="3" rx="1" fill="currentColor" opacity="0.3" />
  </svg>
);