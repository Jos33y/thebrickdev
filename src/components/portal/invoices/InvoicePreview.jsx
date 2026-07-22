/**
 * InvoicePreview - Reusable invoice card
 *
 * Renders the white-card invoice preview identically for both:
 *   - Portal detail page (/portal/invoices/:id)
 *   - Public preview page (/invoice/:token)
 *
 * Consumes company info as props so it works with either useSettings()
 * (authed) or the get_invoice_by_token RPC response (public).
 *
 * Uses invoice.amount_paid directly instead of computing from invoice.payments,
 * so it works even when payments aren't loaded (public page).
 */

import { Card, StatusBadge } from '../common';
import { formatCurrency, formatDate } from '../../../lib/formatters';

const InvoicePreview = ({
  invoice,
  companyName,
  companyEmail,
  companyAddress,
  companyLogo,
}) => {
  if (!invoice) return null;

  const totalPaid = Number(invoice.amount_paid || 0);
  const total = Number(invoice.total || 0);
  const amountDue = Math.max(0, total - totalPaid);
  const hasPayments = totalPaid > 0;

  return (
    <Card padding="none">
      <div className="invoice-preview">
        {/* Header */}
        <div className="invoice-preview__header">
          <div className="invoice-preview__company">
            {companyLogo && (
              <img
                src={companyLogo}
                alt={companyName}
                className="invoice-preview__logo"
              />
            )}
            <h2>{companyName}</h2>
            {companyEmail && <p>{companyEmail}</p>}
            {companyAddress && <p>{companyAddress}</p>}
          </div>
          <div className="invoice-preview__meta">
            <StatusBadge status={invoice.status} size="lg" />
            <h1 className="invoice-preview__number">{invoice.invoice_number}</h1>
          </div>
        </div>

        {/* Details */}
        <div className="invoice-preview__details">
          <div className="invoice-preview__client">
            <h4>Bill To</h4>
            <p className="invoice-preview__client-name">
              {invoice.client?.name || 'No client'}
            </p>
            {invoice.client?.company && <p>{invoice.client.company}</p>}
            {invoice.client?.email && <p>{invoice.client.email}</p>}
            {invoice.client?.location && <p>{invoice.client.location}</p>}
          </div>
          <div className="invoice-preview__info">
            <div className="invoice-preview__info-row">
              <span>Issue Date</span>
              <span>{formatDate(invoice.issue_date)}</span>
            </div>
            <div className="invoice-preview__info-row">
              <span>Due Date</span>
              <span>{formatDate(invoice.due_date)}</span>
            </div>
            {invoice.project_reference && (
              <div className="invoice-preview__info-row">
                <span>Project</span>
                <span>{invoice.project_reference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="invoice-preview__items">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unit_price, invoice.currency)}</td>
                  <td>{formatCurrency(item.amount, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="invoice-preview__totals">
          <div className="invoice-preview__totals-row">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.tax_amount > 0 && (
            <div className="invoice-preview__totals-row">
              <span>Tax ({invoice.tax_rate}%)</span>
              <span>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
            </div>
          )}
          <div className="invoice-preview__totals-row invoice-preview__totals-row--total">
            <span>Total</span>
            <span>{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
          {hasPayments && (
            <>
              <div className="invoice-preview__totals-row invoice-preview__totals-row--paid">
                <span>Paid</span>
                <span>-{formatCurrency(totalPaid, invoice.currency)}</span>
              </div>
              <div className="invoice-preview__totals-row invoice-preview__totals-row--due">
                <span>Amount Due</span>
                <span>{formatCurrency(amountDue, invoice.currency)}</span>
              </div>
            </>
          )}
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="invoice-preview__notes">
            <h4>Notes</h4>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InvoicePreview;
