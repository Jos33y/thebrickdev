/**
 * Terms and Conditions
 */

import LegalPageLayout from '../components/layout/LegalPageLayout';

const Terms = () => {
  return (
    <LegalPageLayout title="Terms and Conditions" lastUpdated="22 July 2026">
      <h2>1. About us</h2>
      <p>
        The Brick Dev Studios (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a software
        development studio registered in Nigeria (BN: 8617842), operating from 6 Funmilayo Awodiya
        Close, Ige Estate, Ajasa/Amikanle, Lagos, Nigeria. We provide custom business management
        systems, web applications, and technical consulting services to businesses in Nigeria and
        internationally. You can reach us at{' '}
        <a href="mailto:hello@thebrickdev.com">hello@thebrickdev.com</a> or on{' '}
        <a href="tel:+2347037344408">+234 703 734 4408</a>.
      </p>

      <h2>2. Services</h2>
      <p>
        We build custom software including business management portals, invoicing systems, booking
        platforms, e-commerce solutions, and related web and mobile applications. Specific
        deliverables, timelines, and pricing are agreed in writing on a per-project basis, typically
        through a proposal document or Statement of Work.
      </p>

      <h2>3. Fees and payment</h2>
      <p>
        All fees are stated on the applicable invoice or agreement. Invoices are typically
        structured on a milestone basis, with an upfront deposit followed by delivery-linked
        payments. Full pricing and terms are agreed before work begins.
      </p>
      <p>
        Payment is due within the time frame stated on each invoice (typically Net 7, Net 15, or Net
        30). Late payments may result in work being paused until the outstanding balance is settled.
      </p>

      <h2>4. Client obligations</h2>
      <p>
        To deliver on time, we need timely responses, prompt approvals, and access to any accounts,
        assets, or content required to complete the work. Delays caused by these factors may shift
        agreed timelines.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        Upon full payment of an invoice, ownership of custom deliverables transfers to the client,
        except for any third-party libraries, frameworks, or proprietary components we identify at
        the start. We retain the right to reference completed work in our portfolio unless otherwise
        agreed in writing.
      </p>

      <h2>6. Confidentiality</h2>
      <p>
        We treat all client information as confidential and do not share business details with third
        parties beyond what is necessary to deliver the work.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        Our total liability for any claim arising from a project is limited to the total fees paid
        for that specific project. We are not liable for indirect or consequential losses.
      </p>

      <h2>8. Termination</h2>
      <p>
        Either party may terminate an engagement with reasonable written notice. Fees for work
        completed up to the termination date remain payable.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes will
        be resolved in the courts of Lagos State, Nigeria.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these terms from time to time. The most current version is always available at{' '}
        <a href="https://thebrickdev.com/terms">thebrickdev.com/terms</a>.
      </p>

      <p className="legal-footer-note">
        Questions? Reach us at{' '}
        <a href="mailto:hello@thebrickdev.com">hello@thebrickdev.com</a>.
      </p>
    </LegalPageLayout>
  );
};

export default Terms;
