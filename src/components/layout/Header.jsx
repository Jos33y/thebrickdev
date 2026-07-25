/**
 * Header - Main navigation header
 * Fixed position with blur backdrop
 *
 * Nav supports two link types:
 *   - kind: 'scroll' - hash-based smooth scroll to section on home page
 *   - kind: 'route'  - react-router Link to a real page (About, etc.)
 *
 * When user is on a non-home page and clicks a scroll link, the header
 * performs a full navigation to '/' + hash so the browser natively
 * scrolls to the anchor on home. Not SPA-smooth in that case, but reliable.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrickMark, MenuIcon, CloseIcon } from '../common';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: '#work', label: 'Work', kind: 'scroll' },
    { href: '#services', label: 'Services', kind: 'scroll' },
    { href: '#pricing', label: 'Pricing', kind: 'scroll' },
    { href: '/about', label: 'About', kind: 'route' },
    { href: '#contact', label: 'Contact', kind: 'scroll' },
  ];

  // For scroll links: smooth-scroll if on home, else navigate home with hash
  const handleScrollClick = (e, href) => {
    if (isHome) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    // If not on home, let the browser navigate to '/' + hash natively
    setIsMenuOpen(false);
  };

  // Href for scroll links depends on current page
  const scrollHref = (hash) => (isHome ? hash : '/' + hash);

  // Renders a single nav link — route or scroll — with proper element
  const renderNavLink = (link, className, tabIndex) => {
    if (link.kind === 'route') {
      return (
        <Link
          key={link.href}
          to={link.href}
          className={className}
          tabIndex={tabIndex}
          onClick={() => setIsMenuOpen(false)}
        >
          {link.label}
        </Link>
      );
    }
    return (
      <a
        key={link.href}
        href={scrollHref(link.href)}
        className={className}
        tabIndex={tabIndex}
        onClick={(e) => handleScrollClick(e, link.href)}
      >
        {link.label}
      </a>
    );
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="container">
          <div className="header-inner">
            {/* Logo */}
            <Link to="/" className="header-logo" aria-label="The Brick Dev - Home">
              <BrickMark className="header-logo-mark" size={36} />
              <span className="header-logo-text">THE BRICK DEV</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="header-nav" aria-label="Main navigation">
              {navLinks.map((link) => renderNavLink(link, 'header-nav-link'))}
            </nav>

            {/* Actions */}
            <div className="header-actions">
              <a
                href={scrollHref('#contact')}
                className="btn btn-primary btn-sm"
                onClick={(e) => handleScrollClick(e, '#contact')}
                style={{ display: 'none' }}
                data-desktop-only
              >
                Start a Project
              </a>

              {/* Mobile Menu Button */}
              <button
                className="header-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav
        className={`mobile-nav ${isMenuOpen ? 'is-open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
      >
        {navLinks.map((link) =>
          renderNavLink(link, 'mobile-nav-link', isMenuOpen ? 0 : -1)
        )}

        <div className="mobile-nav-cta">
          <a
            href={scrollHref('#contact')}
            className="btn btn-primary btn-lg"
            onClick={(e) => handleScrollClick(e, '#contact')}
            tabIndex={isMenuOpen ? 0 : -1}
            style={{ width: '100%' }}
          >
            Start a Project
          </a>
        </div>
      </nav>
    </>
  );
};

export default Header;
