/**
 * Refund Policy
 */

import LegalPageLayout from '../components/layout/LegalPageLayout';

const RefundPolicy = () => {
  return (
    <LegalPageLayout title="Refund Policy" lastUpdated="22 July 2026">
      <p>
        At The Brick Dev Studios, we build custom software on a milestone basis. This policy
        explains when and how refunds may apply.
      </p>

      <h2>1. Milestone-based work</h2>
      <p>
        Custom software is developed in stages. Each invoiced milestone represents work already
        delivered or in active development. Once a milestone is delivered and approved, the
        associated payment is non-refundable.
      </p>

      <h2>2. Deposits and retainers</h2>
      <ul>
        <li>
          Project deposits (typically 40 to 60 percent upfront) reserve our time and cover initial
          planning, discovery, and setup work. Once work has commenced, deposits are non-refundable.
        </li>
        <li>
          Monthly retainers are charged in advance for the upcoming month. If cancelled mid-month,
          we may refund the unused portion at our discretion, minus any work already completed.
        </li>
      </ul>

      <h2>3. Refund requests</h2>
      <p>
        Refund requests must be submitted in writing to{' '}
        <a href="mailto:billing@thebrickdev.com">billing@thebrickdev.com</a> within 14 days of the
        payment in question. Requests are reviewed case by case based on:
      </p>
      <ul>
        <li>Work delivered versus work invoiced</li>
        <li>Reason for the request</li>
        <li>Whether milestones have been signed off</li>
      </ul>

      <h2>4. Approved refunds</h2>
      <p>
        Where a refund is approved, it will be processed via the same payment method used for the
        original transaction within 7 to 14 business days.
      </p>

      <h2>5. Card processing fees</h2>
      <p>
        Card processing fees charged by our payment provider (Flutterwave) at checkout are not
        refundable in cases where the customer chose to bear the fee. This is a standard practice
        across payment gateways.
      </p>

      <h2>6. Chargebacks</h2>
      <p>
        If a chargeback is initiated without contacting us first, we reserve the right to suspend
        all ongoing work and pursue standard resolution processes with the payment provider.
      </p>

      <h2>7. Governing law</h2>
      <p>
        This policy is governed by the laws of the Federal Republic of Nigeria. Any disputes will
        be resolved in the courts of Lagos State, Nigeria.
      </p>

      <p className="legal-footer-note">
        For any concerns about billing or refunds, please reach us at{' '}
        <a href="mailto:billing@thebrickdev.com">billing@thebrickdev.com</a> or on{' '}
        <a href="tel:+2347037344408">+234 703 734 4408</a>. We aim to resolve issues fairly and
        quickly.
      </p>
    </LegalPageLayout>
  );
};

export default RefundPolicy;
