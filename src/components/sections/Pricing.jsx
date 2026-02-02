/**
 * Pricing - Investment section
 * 3-tier layout with featured middle tier
 */

import { CheckIcon, ClockIcon, ArrowRightIcon } from '../common';
import { pricing } from '../../data/portfolio';

const Pricing = () => {
  return (
    <section className="section section-alt" id="pricing">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Investment</span>
          <h2 className="section-title">Transparent pricing, real value</h2>
          <p className="section-description">
            Every project is unique, but here's where most clients land. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Grid - 3 Tiers */}
        <div className="pricing-tiers">
          {pricing.map((tier) => (
            <article
              key={tier.id}
              className={`pricing-tier-card ${tier.highlighted ? 'pricing-tier-card--featured' : ''}`}
            >
              {/* Popular Badge */}
              {tier.highlighted && (
                <div className="pricing-tier-badge">Most Popular</div>
              )}

              {/* Tier Header */}
              <div className="pricing-tier-header">
                <h3 className="pricing-tier-name">{tier.name}</h3>
                <p className="pricing-tier-description">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="pricing-tier-price">
                <span className="pricing-tier-price-note">{tier.priceNote}</span>
                <span className="pricing-tier-price-amount">{tier.price}</span>
              </div>

              {/* Timeline */}
              <div className="pricing-tier-timeline">
                <ClockIcon size={16} className="pricing-tier-timeline-icon" />
                <span>{tier.timeline}</span>
              </div>

              {/* Features */}
              <ul className="pricing-tier-features">
                {tier.includes.map((feature, index) => (
                  <li key={index} className="pricing-tier-feature">
                    <CheckIcon size={16} className="pricing-tier-feature-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a href="#contact" className={`btn ${tier.highlighted ? 'btn-primary' : 'btn-secondary'} pricing-tier-cta`}>
                {tier.cta}
                <ArrowRightIcon size={16} />
              </a>
            </article>
          ))}
        </div>

        {/* Footer Note */}
        <div className="pricing-footer-note">
          <div className="pricing-footer-note-content">
            <h4 className="pricing-footer-note-title">Need something different?</h4>
            <p className="pricing-footer-note-text">
              Simpler project? Bigger vision? FinTech or Blockchain? We work with budgets from $1,000 to $50,000+. Every project gets the same attention to detail.
            </p>
            <a href="#contact" className="pricing-footer-note-link">
              Let's talk about your project
              <ArrowRightIcon size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;