/**
 * Footer - Site footer with links and contact info
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrickMark,
  LinkedinIcon,
  GithubIcon,
  InstagramIcon,
  TwitterIcon,
  TelegramIcon,
  UpworkIcon,
  GlobeIcon,
  MailIcon
} from '../common';
import { contact } from '../../data/portfolio';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  const navLinks = [
    { href: '#work', label: 'Work' },
    { href: '#services', label: 'Services' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#process', label: 'Process' },
  ];

  const contactLinks = [
    { href: `mailto:${contact.email}`, label: contact.email },
    { href: `https://wa.me/${contact.whatsapp.replace('+', '')}?text=${encodeURIComponent("Hi, I'm interested in discussing a project with The Brick Dev.")}`, label: 'WhatsApp' },
    { href: contact.social.telegram, label: 'Telegram' },
  ];

  const socialLinks = [
    { href: contact.social.linkedin, icon: LinkedinIcon, label: 'LinkedIn' },
    { href: contact.social.github, icon: GithubIcon, label: 'GitHub' },
    { href: contact.social.twitter, icon: TwitterIcon, label: 'Twitter' },
    { href: contact.social.instagram, icon: InstagramIcon, label: 'Instagram' },
    { href: contact.social.telegram, icon: TelegramIcon, label: 'Telegram' },
    { href: contact.social.upwork, icon: UpworkIcon, label: 'Upwork' },
  ];

  const scrollToSection = (e, href) => {
    if (href.startsWith('#')) {
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
  };

  // Secret portal access - click logo 5 times
  const handleLogoClick = (e) => {
    e.preventDefault();
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      setClickCount(0);
      navigate('/portal');
    }
    
    // Reset count after 2 seconds of no clicks
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
              <BrickMark className="footer-logo-mark" size={40} />
              <div>
                <div className="footer-logo-text">THE BRICK DEV</div>
                <div className="footer-logo-studios">STUDIOS</div>
              </div>
            </div>
            <p className="footer-tagline">
              We build custom systems that run your business, and websites that bring customers.
            </p>

            {/* Social Links */}
            <div className="footer-social">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="footer-social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="footer-section">
            <h4 className="footer-section-title">Navigation</h4>
            <div className="footer-links">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="footer-link"
                  onClick={(e) => scrollToSection(e, link.href)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div className="footer-section">
            <h4 className="footer-section-title">Contact</h4>
            <div className="footer-links">
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="footer-link"
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} The Brick Dev Studios. All rights reserved.
          </p>

          <div className="footer-meta">
            <span className="footer-meta-item">
              <GlobeIcon size={14} />
              {contact.timezone}
            </span>
            <span className="footer-meta-item">
              <MailIcon size={14} />
              {contact.email}
            </span>
            {/* Subtle CV Link */}
            <a
              href="https://www.keepandshare.com/doc27/resume.pdf"
              className="footer-cv-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume/CV
            </a>
            {/* Secret Portal Link - looks like version number */}
            <Link to="/portal" className="footer-version">
              v1.0
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;