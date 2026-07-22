/**
 * Privacy Policy
 */

import LegalPageLayout from '../components/layout/LegalPageLayout';

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="22 July 2026">
      <p>
        The Brick Dev Studios (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your
        privacy. This policy explains what personal information we collect, how we use it, and your
        rights.
      </p>

      <h2>1. Information we collect</h2>
      <p>
        When you engage us for work, submit an inquiry, or receive an invoice from us, we may
        collect:
      </p>
      <ul>
        <li>Your name and business name</li>
        <li>Email address and phone number</li>
        <li>Billing address</li>
        <li>Payment details (processed by our payment provider, not stored by us)</li>
        <li>Communication history (emails, WhatsApp messages, project discussions)</li>
      </ul>
      <p>
        For website visitors, we may collect standard analytics data such as browser type, pages
        viewed, and referring URLs. This is used to improve the site.
      </p>

      <h2>2. How we use your information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Deliver the services you have engaged us for</li>
        <li>Send invoices and payment reminders</li>
        <li>Communicate about your project</li>
        <li>Comply with legal and tax obligations</li>
        <li>Occasionally share updates about our services, if you have opted in</li>
      </ul>
      <p>
        We do not sell your personal information. We do not share it with third parties for
        marketing purposes.
      </p>

      <h2>3. Payment data</h2>
      <p>
        Payment card details are handled entirely by our payment provider, Flutterwave (Flutterwave
        Technology Solutions Limited, licensed by the Central Bank of Nigeria). We do not see,
        store, or process your card details. Flutterwave&rsquo;s privacy policy applies to card
        transactions.
      </p>

      <h2>4. Data storage and security</h2>
      <p>
        Client and invoice data is stored in secure cloud databases with encryption at rest and in
        transit. Access is limited to authorised personnel. We retain business records (invoices,
        contracts, communications) for at least six years to meet tax and accounting obligations.
      </p>

      <h2>5. Your rights</h2>
      <p>You may:</p>
      <ul>
        <li>Request a copy of the personal data we hold about you</li>
        <li>Ask us to correct inaccurate information</li>
        <li>Ask us to delete your data (subject to our legal obligations to retain records)</li>
        <li>Withdraw consent to marketing communications at any time</li>
      </ul>
      <p>
        To exercise any of these rights, email{' '}
        <a href="mailto:privacy@thebrickdev.com">privacy@thebrickdev.com</a>.
      </p>

      <h2>6. International transfers</h2>
      <p>
        As a Nigerian business serving international clients, some data may be transferred and
        stored on servers outside Nigeria. We take reasonable steps to ensure this data is
        protected.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Our website uses minimal cookies for session management and analytics. By using the site,
        you consent to this.
      </p>

      <h2>8. Governing law</h2>
      <p>
        This policy is governed by the laws of the Federal Republic of Nigeria. Any disputes will
        be resolved in the courts of Lagos State, Nigeria.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy. The most current version is always available at{' '}
        <a href="https://thebrickdev.com/privacy-policy">thebrickdev.com/privacy-policy</a>.
      </p>

      <p className="legal-footer-note">
        For privacy questions or requests, email{' '}
        <a href="mailto:privacy@thebrickdev.com">privacy@thebrickdev.com</a> or call{' '}
        <a href="tel:+2347037344408">+234 703 734 4408</a>.
      </p>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
