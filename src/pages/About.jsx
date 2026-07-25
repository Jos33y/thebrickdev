/**
 * About Us - Company information page
 *
 * Not a legal page but uses the same layout for consistency.
 * Required by Flutterwave compliance review (24 July 2026).
 */

import LegalPageLayout from '../components/layout/LegalPageLayout';

const About = () => {
  return (
    <LegalPageLayout title="About Us" label="Company">
      <h2>Who we are</h2>
      <p>
        The Brick Dev Studios is a custom software studio based in Lagos, Nigeria,
        registered with the Corporate Affairs Commission (BN 8617842). We build
        management systems, web applications, and technical infrastructure for
        small and mid-sized businesses in Nigeria and internationally.
      </p>

      <h2>What we do</h2>
      <p>
        We help businesses that run on paper, spreadsheets, and memory move onto
        proper software. That means custom management portals, invoicing systems,
        booking platforms, e-commerce solutions, and internal tools designed
        around each client&rsquo;s actual operational workflow, not a generic template.
      </p>
      <p>
        Technology is framed as a revenue-generating tool, not a line-item expense.
        Every system we build is designed to reduce operational chaos, save
        real hours per week, and produce clean records the business can rely on.
      </p>

      <h2>Founder</h2>
      <p>
        The studio is founded and led by <strong>Joseph Lagbalu</strong>, who has
        over eight years of experience building web applications and delivering
        45+ projects across e-commerce, SaaS, fintech, and internal business
        tooling. Every engagement is led personally by the founder, with clear
        communication, milestone-based delivery, and post-launch support built into
        the process.
      </p>

      <h2>How we work</h2>
      <p>
        Engagements start with a scope document that defines deliverables,
        timelines, and pricing in plain language. Work proceeds on a milestone
        basis, with regular check-ins and demos. Clients keep ownership of all
        code and infrastructure we build for them. No lock-in, no hidden
        dependencies.
      </p>
      <p>
        We work with a small number of clients at a time, deliberately. This
        means every client gets founder-level attention and a system that reflects
        the specific way their business actually operates.
      </p>

      <h2>Location and jurisdiction</h2>
      <p>
        We operate from 6 Funmilayo Awodiya Close, Ige Estate, Ajasa/Amikanle,
        Lagos, Nigeria. All engagements are governed by the laws of the Federal
        Republic of Nigeria, with disputes resolved in the courts of Lagos State.
      </p>

      <h2>Get in touch</h2>
      <p>
        For new project inquiries, reach us at{' '}
        <a href="mailto:hello@thebrickdev.com">hello@thebrickdev.com</a> or on{' '}
        <a href="tel:+2347037344408">+234 703 734 4408</a>. For billing questions,
        email <a href="mailto:billing@thebrickdev.com">billing@thebrickdev.com</a>.
        For privacy or data requests, email{' '}
        <a href="mailto:privacy@thebrickdev.com">privacy@thebrickdev.com</a>.
      </p>

      <p className="legal-footer-note">
        Business registration: BN 8617842, issued by the Corporate Affairs
        Commission of Nigeria on 18 July 2025.
      </p>
    </LegalPageLayout>
  );
};

export default About;
