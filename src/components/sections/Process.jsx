/**
 * Process - How We Work section
 * Building blocks timeline: 5 cols (desktop) → 3+2 (tablet) → stack (mobile)
 */

import { process } from '../../data/portfolio';

const Process = () => {
  return (
    <section className="section" id="process">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">How We Work</span>
          <h2 className="section-title">From idea to launch, step by step</h2>
          <p className="section-description">
            A clear process means no surprises. Here's how every project flows.
          </p>
        </div>

        {/* Process Timeline */}
        <div className="process-timeline">
          {process.map((step) => (
            <article key={step.step} className="process-step">
              {/* Large number for tablet/desktop */}
              <span className="process-step__number">
                {String(step.step).padStart(2, '0')}
              </span>
              
              <div className="process-step__content">
                {/* Mobile-only number */}
                <span className="process-step__mobile-number">
                  Step {String(step.step).padStart(2, '0')}
                </span>
                
                <h3 className="process-step__title">{step.title}</h3>
                <p className="process-step__description">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;