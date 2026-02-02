/**
 * Header - Main navigation header
 * Fixed position with blur backdrop
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrickMark, MenuIcon, CloseIcon } from '../common';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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
    { href: '#work', label: 'Work' },
    { href: '#services', label: 'Services' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#contact', label: 'Contact' },
  ];

  const scrollToSection = (e, href) => {
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
    setIsMenuOpen(false);
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
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="header-nav-link"
                  onClick={(e) => scrollToSection(e, link.href)}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="header-actions">
              <a
                href="#contact"
                className="btn btn-primary btn-sm"
                onClick={(e) => scrollToSection(e, '#contact')}
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
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="mobile-nav-link"
            onClick={(e) => scrollToSection(e, link.href)}
            tabIndex={isMenuOpen ? 0 : -1}
          >
            {link.label}
          </a>
        ))}

        <div className="mobile-nav-cta">
          <a
            href="#contact"
            className="btn btn-primary btn-lg"
            onClick={(e) => scrollToSection(e, '#contact')}
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