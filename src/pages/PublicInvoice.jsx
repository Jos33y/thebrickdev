/**
 * PublicInvoice - Client-facing invoice preview
 *
 * Route: /invoice/:token
 * Public (no auth required)
 *
 * Renders the same invoice card as the portal detail page (via InvoicePreview)
 * so clients see a familiar, professional view. Adds a status-aware payment
 * section:
 *
 *   - If already paid    -> green "PAID" banner + thank you + payment reference
 *   - If partially paid  -> "£X of £Y paid" + PAY NOW for remainder
 *   - If unpaid + link   -> big PAY NOW button (opens Flutterwave)
 *   - If unpaid + no link -> "Contact us to arrange payment" fallback
 *
 * Also:
 *   - "Download PDF" button (works for any status; includes payment receipt
 *     details when paid — useful evidence for banks/platforms)
 *   - Auto-refetch after payment redirect so webhook can catch up
 */

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { usePublicInvoice } from '../hooks/usePublicInvoice';
import InvoicePreview from '../components/portal/invoices/InvoicePreview';
import { LoadingState, Button, Card } from '../components/portal/common';
import { formatCurrency, formatDate } from '../lib/formatters';
import { downloadInvoicePDF } from '../lib/pdf';
import { DownloadIcon } from '../components/common/Icons';

const PublicInvoice = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('status');
  const justPaid = paymentStatus === 'successful' || paymentStatus === 'completed';

  const [isDownloading, setIsDownloading] = useState(false);
  const { data, isLoading, error, refetch } = usePublicInvoice(token);

  // Auto-refetch after payment redirect so webhook can catch up
  useEffect(() => {
    if (justPaid) {
      const timer = setTimeout(() => refetch(), 2000);
      return () => clearTimeout(timer);
    }
  }, [justPaid, refetch]);

  const handleDownloadPDF = async () => {
    if (!data?.invoice) return;
    setIsDownloading(true);
    try {
      // Pass company info from RPC (public page doesn't have useSettings access)
      const companyInfo = {
        name: data.company.company_name,
        email: data.company.company_email,
        website: data.company.company_website,
        country: data.company.company_country,
      };
      await downloadInvoicePDF(data.invoice, companyInfo);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
    setIsDownloading(false);
  };

  if (isLoading) {
    return (
      <div className="public-invoice-page">
        <div className="public-invoice-container">
          <LoadingState text="Loading invoice..." />
        </div>
      </div>
    );
  }

  if (error || !data?.invoice) {
    return (
      <div className="public-invoice-page">
        <div className="public-invoice-container">
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Invoice not found</h2>
              <p style={{ color: '#666' }}>
                This link is invalid or has expired. Please contact the sender for a new link.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const { invoice, company } = data;

  const companyName = company.company_name || 'The Brick Dev Studios';
  const companyEmail = company.company_email || 'hello@thebrickdev.com';
  const companyAddress = company.company_country || '';
  // Fall back to the public brand mark if no logo is set in settings.
  // /apple-touch-icon.png is 180x180 and works well as a square mark.
  const companyLogo = company.logo_url || '/apple-touch-icon.png';

  const totalPaid = Number(invoice.amount_paid || 0);
  const total = Number(invoice.total || 0);
  const amountDue = Math.max(0, total - totalPaid);
  const isPaid = invoice.status === 'paid' || amountDue === 0;
  const hasPaymentLink = Boolean(invoice.payment_link_url);
  const hasPayments = invoice.payments && invoice.payments.length > 0;

  // Get the latest payment for display (if any)
  const latestPayment = hasPayments ? invoice.payments[0] : null;

  // Format payment method for the display (e.g. "Card via Flutterwave")
  const formatPaymentMethod = (payment) => {
    if (!payment) return null;
    if (payment.payment_type === 'platform') {
      const platform = payment.platform_details?.platform;
      const method = payment.platform_details?.payment_method;
      const platformLabel = platform
        ? platform.charAt(0).toUpperCase() + platform.slice(1)
        : 'Platform';
      if (method === 'card') return `Card via ${platformLabel}`;
      if (method?.includes('account')) return `Bank via ${platformLabel}`;
      if (method === 'apple_pay') return `Apple Pay via ${platformLabel}`;
      if (method) return `${method} via ${platformLabel}`;
      return platformLabel;
    }
    if (payment.payment_type === 'bank') {
      const bank = payment.bank_details?.bank_name;
      return bank ? `Bank transfer (${bank})` : 'Bank transfer';
    }
    if (payment.payment_type === 'crypto') {
      const cryptoType = payment.crypto_details?.crypto_type || 'Crypto';
      const network = payment.crypto_details?.network;
      return network && network !== 'other' ? `${cryptoType} on ${network}` : cryptoType;
    }
    return payment.payment_type || null;
  };

  // Format payment reference label (e.g. "Payment reference", "TxHash", "Bank reference")
  const formatPaymentRefLabel = (payment) => {
    if (!payment) return 'Reference';
    if (payment.payment_type === 'platform') {
      // Flutterwave calls flw_ref the "Payment reference" in their dashboard
      if (payment.platform_details?.provider_reference) return 'Payment reference';
      return 'Transaction ID';
    }
    if (payment.payment_type === 'bank') return 'Bank reference';
    if (payment.payment_type === 'crypto') return 'TxHash';
    return 'Reference';
  };

  // Format the reference value itself
  // Priority: provider_reference (flw_ref) → provider_transaction_id (numeric) → our tx_ref
  const formatPaymentRef = (payment) => {
    if (!payment) return null;
    if (payment.payment_type === 'platform') {
      return payment.platform_details?.provider_reference
        || payment.platform_details?.provider_transaction_id
        || payment.platform_details?.transaction_reference;
    }
    if (payment.payment_type === 'bank') {
      return payment.bank_details?.reference_number;
    }
    if (payment.payment_type === 'crypto') {
      const hash = payment.crypto_details?.transaction_hash;
      return hash && hash.length > 24 ? `${hash.slice(0, 12)}…${hash.slice(-8)}` : hash;
    }
    return null;
  };

  return (
    <div className="public-invoice-page">
      <div className="public-invoice-container">
        {/* Post-payment success banner */}
        {justPaid && !isPaid && (
          <div className="public-invoice-banner public-invoice-banner--info">
            <strong>Payment received.</strong> We're finalising your record. This page will refresh in a moment.
          </div>
        )}

        {justPaid && isPaid && (
          <div className="public-invoice-banner public-invoice-banner--success">
            <strong>Payment successful.</strong> Thank you. A confirmation has been recorded.
          </div>
        )}

        {/* Top actions bar - Download button always available */}
        <div className="public-invoice-actions">
          <Button
            variant="primary"
            icon={DownloadIcon}
            onClick={handleDownloadPDF}
            loading={isDownloading}
          >
            Download PDF
          </Button>
        </div>

        {/* Invoice card (identical to portal view) */}
        <InvoicePreview
          invoice={invoice}
          companyName={companyName}
          companyEmail={companyEmail}
          companyAddress={companyAddress}
          companyLogo={companyLogo}
        />

        {/* Payment section */}
        <div className="public-invoice-payment">
          {isPaid ? (
            <Card>
              <div className="public-invoice-payment__paid">
                <h3>Payment complete</h3>
                <p>This invoice has been paid in full. Thank you for your business.</p>
                {latestPayment && (
                  <div className="public-invoice-payment__receipt">
                    <div className="public-invoice-payment__receipt-row">
                      <span>Amount received</span>
                      <strong>{formatCurrency(latestPayment.amount_received, latestPayment.currency_received)}</strong>
                    </div>
                    <div className="public-invoice-payment__receipt-row">
                      <span>Date</span>
                      <strong>{formatDate(latestPayment.received_date)}</strong>
                    </div>
                    {formatPaymentMethod(latestPayment) && (
                      <div className="public-invoice-payment__receipt-row">
                        <span>Method</span>
                        <strong>{formatPaymentMethod(latestPayment)}</strong>
                      </div>
                    )}
                    {formatPaymentRef(latestPayment) && (
                      <div className="public-invoice-payment__receipt-row">
                        <span>{formatPaymentRefLabel(latestPayment)}</span>
                        <code>{formatPaymentRef(latestPayment)}</code>
                      </div>
                    )}
                    <div className="public-invoice-payment__receipt-action">
                      <Button
                        variant="primary"
                        icon={DownloadIcon}
                        onClick={handleDownloadPDF}
                        loading={isDownloading}
                      >
                        Download Receipt PDF
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : hasPaymentLink ? (
            <Card>
              <div className="public-invoice-payment__pay">
                <div>
                  <h3>Amount due: {formatCurrency(amountDue, invoice.currency)}</h3>
                  {totalPaid > 0 && (
                    <p style={{ color: '#666', marginTop: '0.25rem' }}>
                      {formatCurrency(totalPaid, invoice.currency)} received of {formatCurrency(total, invoice.currency)}
                    </p>
                  )}
                  <p style={{ color: '#666', marginTop: '0.75rem', fontSize: '0.875rem' }}>
                    Secure payment via Flutterwave. Card and UK bank transfer accepted.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    window.location.href = invoice.payment_link_url;
                  }}
                >
                  Pay {formatCurrency(amountDue, invoice.currency)}
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="public-invoice-payment__fallback">
                <h3>Payment options</h3>
                <p>
                  To arrange payment for this invoice, please contact us at{' '}
                  <a href={`mailto:${companyEmail}`}>{companyEmail}</a>.
                  We accept bank transfer, card, and crypto.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="public-invoice-footer">
          <p>
            Powered by <strong>{companyName}</strong>
            {company.company_website && (
              <>
                {' · '}
                <a href={`https://${company.company_website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">
                  {company.company_website.replace(/^https?:\/\//, '')}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicInvoice;
