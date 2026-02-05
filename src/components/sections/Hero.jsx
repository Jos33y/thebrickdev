/**
 * Hero - The Brick Dev
 * Clean layout with client-focused messaging
 */

import { useEffect, useState } from 'react';
import { ArrowRightIcon } from '../common';
import { stats } from '../../data/portfolio';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section className={`hero ${isVisible ? 'is-visible' : ''}`} id="hero">
      {/* Ambient floating bricks */}
      <div className="hero-ambient" aria-hidden="true">
        <div className="ambient-brick ab-1"></div>
        <div className="ambient-brick ab-2"></div>
        <div className="ambient-brick ab-3"></div>
        <div className="ambient-brick ab-4"></div>
        <div className="ambient-brick ab-5"></div>
        <div className="ambient-brick ab-6"></div>
      </div>

      <div className="container">
        <div className="hero-content">
          
          {/* Tag */}
          <div className="hero-tag">
            <span>Digital Craftsmen</span>
          </div>

          {/* Headline */}
          <h1 className="hero-title">
            <span className="title-line">Bring the vision.</span>
            <span className="title-line title-highlight">We'll build it.</span>
          </h1>

          {/* Description */}
          <p className="hero-description">
            Custom systems that run your business. Websites that actually convert.
          </p>

          {/* CTAs */}
          <div className="hero-ctas">
            <a
              href="#work"
              className="hero-cta hero-cta-primary"
              onClick={(e) => scrollToSection(e, '#work')}
            >
              <span>See Our Work</span>
              <ArrowRightIcon size={18} />
            </a>
            <a
              href="#contact"
              className="hero-cta hero-cta-secondary"
              onClick={(e) => scrollToSection(e, '#contact')}
            >
              <span>Start a Project</span>
            </a>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-value">{stats.completedProjects}</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">{stats.happyClients}</span>
              <span className="stat-label">Clients</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">{stats.yearsExperience}</span>
              <span className="stat-label">Years</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom brick border */}
      <div className="hero-bottom-border" aria-hidden="true">
        <div className="border-brick"></div>
        <div className="border-brick"></div>
        <div className="border-brick"></div>
        <div className="border-brick"></div>
        <div className="border-brick"></div>
        <div className="border-brick"></div>
        <div className="border-brick"></div>
        <div className="border-brick"></div>
      </div>
    </section>
  );
};

export default Hero;