/**
 * CTA - Call to Action section
 * Full-width banner with brick accent
 */

import { ArrowRightIcon, MailIcon } from '../common';
import { contact } from '../../data/portfolio';

const CTA = () => {
  return (
    <section className="cta-section" id="contact">
      <div className="container">
        <div className="cta-banner">
          {/* Brick Accent */}
          <div className="cta-brick-accent" aria-hidden="true">
            <span className="cta-brick cta-brick--1"></span>
            <span className="cta-brick cta-brick--2"></span>
            <span className="cta-brick cta-brick--3"></span>
          </div>

          {/* Content */}
          <div className="cta-content">
            <h2 className="cta-title">Ready to build something?</h2>
            <p className="cta-description">
              Let's talk about your project and see how we can bring it to life.
            </p>

            {/* Actions */}
            <div className="cta-actions">
              <a href={`https://wa.me/${contact.whatsapp.replace('+', '')}?text=${encodeURIComponent("Hi, I'm interested in discussing a project with The Brick Dev.")}`} className="btn btn-primary btn-lg">
                Start a Project
                <ArrowRightIcon size={18} />
              </a>
              
              <span className="cta-divider">or</span>
              
              <a href={`mailto:${contact.email}`} className="cta-email-link">
                <MailIcon size={18} />
                {contact.email}
              </a>
            </div>
          </div>

          {/* Bottom Brick Border */}
          <div className="cta-brick-border" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  );
};

export default CTA;