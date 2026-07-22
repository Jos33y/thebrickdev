/**
 * InvoicePDF - PDF document for invoice generation
 *
 * Uses @react-pdf/renderer to create professional PDFs.
 * Accepts companyInfo as prop from Settings instead of hardcoded values.
 *
 * Renders:
 *  - Company logo (BrickMark SVG)
 *  - Header with invoice number, status, project reference
 *  - Bill-to block + issue/due date + project reference
 *  - Line items table
 *  - Totals with optional Paid + Amount Due rows (for partial payments)
 *  - PAY NOW clickable link section (only if unpaid + payment_link_url exists)
 *  - Notes block
 *  - Footer
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Rect,
  Link,
} from '@react-pdf/renderer';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e5e5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  logo: {
    width: 36,
    height: 30,
    marginRight: 12,
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.5,
  },
  invoiceMeta: {
    alignItems: 'flex-end',
  },
  invoiceLabel: {
    fontSize: 9,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  invoiceNumber: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#ea580c',
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  statusSent: {
    backgroundColor: '#dbeafe',
    color: '#2563eb',
  },
  statusPartial: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },

  // Details section
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billTo: {
    flex: 1,
  },
  invoiceInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 10,
    color: '#888888',
    marginRight: 12,
  },
  infoValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    width: 160,
    textAlign: 'right',
  },

  // Table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e5e5',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  colDescription: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: 'right',
  },
  colPrice: {
    flex: 1.5,
    textAlign: 'right',
  },
  colAmount: {
    flex: 1.5,
    textAlign: 'right',
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCellText: {
    fontSize: 10,
    color: '#1a1a1a',
  },
  tableCellMono: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: '#1a1a1a',
  },

  // Totals
  totalsContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    width: 240,
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 6,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#666666',
  },
  totalsValue: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: '#1a1a1a',
  },
  totalsPaidLabel: {
    fontSize: 10,
    color: '#16a34a',
  },
  totalsPaidValue: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: '#16a34a',
  },
  totalsDueLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  totalsDueValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#ea580c',
  },
  totalsFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 2,
    borderTopColor: '#1a1a1a',
  },
  totalsSubTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#d4d4d4',
  },
  totalsFinalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  totalsFinalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#ea580c',
  },

  // Payment CTA
  paymentCta: {
    marginTop: 10,
    marginBottom: 20,
    padding: 18,
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  paymentCtaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentCtaTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  paymentCtaAmount: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#ea580c',
  },
  paymentCtaButton: {
    backgroundColor: '#c54b1a',
    color: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'none',
    letterSpacing: 0.5,
  },
  paymentCtaHint: {
    marginTop: 8,
    fontSize: 8,
    color: '#78716c',
    textAlign: 'center',
  },

  // Notes
  notes: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  notesText: {
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.6,
  },

  // Payments Received (audit trail for paid/partial invoices)
  paymentsReceived: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  paymentsTable: {
    marginTop: 4,
  },
  paymentsHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  paymentsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  paymentsColDate: {
    flex: 1.4,
  },
  paymentsColMethod: {
    flex: 1.6,
  },
  paymentsColRef: {
    flex: 3,
  },
  paymentsColAmount: {
    flex: 1.5,
    textAlign: 'right',
  },
  paymentsHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentsCellText: {
    fontSize: 9,
    color: '#1a1a1a',
  },
  paymentsCellRef: {
    fontSize: 8,
    fontFamily: 'Courier',
    color: '#4a4a4a',
  },
  paymentsCellAmount: {
    fontSize: 9,
    fontFamily: 'Courier',
    color: '#16a34a',
  },
  paymentsSummary: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingRight: 8,
  },
  paymentsSummaryText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#888888',
  },
});

/**
 * BrickMark Logo Component for PDF
 * Matches the actual BrickMark.jsx component
 */
const BrickMarkLogo = ({ size = 40 }) => {
  const scale = size / 40;
  const width = 48 * scale;
  const height = 40 * scale;

  return (
    <Svg width={width} height={height} viewBox="0 0 48 40">
      {/* Top row - 2 orange bricks */}
      <Rect x="0" y="0" width="16" height="10" fill="#c54b1a" />
      <Rect x="20" y="0" width="24" height="10" fill="#c54b1a" />
      {/* Middle row - 2 dark bricks */}
      <Rect x="0" y="14" width="10" height="10" fill="#3d1a1a" />
      <Rect x="14" y="14" width="34" height="10" fill="#3d1a1a" />
      {/* Bottom row - 2 orange bricks */}
      <Rect x="0" y="28" width="24" height="10" fill="#c54b1a" />
      <Rect x="28" y="28" width="16" height="10" fill="#c54b1a" />
    </Svg>
  );
};

/**
 * Format currency for PDF
 */
const formatCurrency = (amount, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', NGN: '₦' };
  const symbol = symbols[currency] || '$';
  const formatted = (amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${symbol}${formatted}`;
};

/**
 * Format date for PDF
 */
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * Format payment method label based on type + details
 * Example outputs: "Card (Flutterwave)", "UK Bank (Flutterwave)", "USDT / Solana", "Bank Transfer"
 */
const formatPaymentMethod = (payment) => {
  const type = payment.payment_type;

  if (type === 'platform') {
    const platform = payment.platform_details?.platform || 'platform';
    const method = payment.platform_details?.payment_method;
    const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

    if (method === 'card') return `Card (${platformLabel})`;
    if (method?.includes('account')) return `Bank (${platformLabel})`;
    if (method === 'apple_pay') return `Apple Pay (${platformLabel})`;
    if (method) return `${method} (${platformLabel})`;
    return platformLabel;
  }

  if (type === 'bank') {
    const bank = payment.bank_details?.bank_name;
    return bank ? `Bank Transfer (${bank})` : 'Bank Transfer';
  }

  if (type === 'crypto') {
    const cryptoType = payment.crypto_details?.crypto_type || 'Crypto';
    const network = payment.crypto_details?.network;
    return network && network !== 'other' ? `${cryptoType} / ${network}` : cryptoType;
  }

  return type || 'Payment';
};

/**
 * Format payment reference based on type
 * Prefers human-readable provider ref (flw_ref for Flutterwave, transferId
 * for Wise, etc.) - most useful for verification with banks/compliance teams.
 * Falls back to numeric provider ID, then our internal tx_ref.
 */
const formatPaymentRef = (payment) => {
  const type = payment.payment_type;

  if (type === 'platform') {
    const providerRef = payment.platform_details?.provider_reference;
    const providerId = payment.platform_details?.provider_transaction_id;
    const ourRef = payment.platform_details?.transaction_reference;
    return providerRef || providerId || ourRef || '—';
  }

  if (type === 'bank') {
    return payment.bank_details?.reference_number || '—';
  }

  if (type === 'crypto') {
    const hash = payment.crypto_details?.transaction_hash;
    // Truncate long hashes for PDF readability
    if (hash && hash.length > 24) {
      return `${hash.slice(0, 12)}…${hash.slice(-8)}`;
    }
    return hash || '—';
  }

  return '—';
};

// Default company info fallback
const DEFAULT_COMPANY = {
  name: 'My Business',
  email: '',
  address: '',
  website: '',
};

/**
 * Invoice PDF Document Component
 *
 * @param {Object} invoice - Invoice data with client and items
 * @param {Object} companyInfo - Company info from Settings (optional, has defaults)
 */
const InvoicePDF = ({ invoice, companyInfo = DEFAULT_COMPANY }) => {
  const client = invoice.client || {};
  const items = invoice.items || [];

  // Merge with defaults
  const company = {
    ...DEFAULT_COMPANY,
    ...companyInfo,
  };

  // Build address string from parts
  const companyAddress = company.address || [
    company.street,
    company.city,
    company.country,
  ].filter(Boolean).join(', ');

  const getStatusStyle = () => {
    if (invoice.status === 'paid') return styles.statusPaid;
    if (invoice.status === 'sent') return styles.statusSent;
    if (invoice.status === 'partially_paid') return styles.statusPartial;
    return {};
  };

  // Website for footer (strip protocol)
  const websiteDisplay = company.website?.replace(/^https?:\/\//, '') || '';

  // Payment calculations
  const total = Number(invoice.total || 0);
  const amountPaid = Number(invoice.amount_paid || 0);
  const amountDue = Math.max(0, total - amountPaid);
  const hasPayments = amountPaid > 0;
  const isFullyPaid = invoice.status === 'paid' || amountDue === 0;
  const canPay = !isFullyPaid && Boolean(invoice.payment_link_url);

  // Format status label for display (partially_paid → Partially Paid)
  const statusLabel = (invoice.status || 'draft')
    .replace(/_/g, ' ')
    .toUpperCase();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <BrickMarkLogo size={30} />
            </View>
            <View>
              <Text style={styles.companyName}>{company.name}</Text>
              {company.email && <Text style={styles.companyInfo}>{company.email}</Text>}
              {companyAddress && <Text style={styles.companyInfo}>{companyAddress}</Text>}
              {company.website && (
                <Text style={styles.companyInfo}>{websiteDisplay}</Text>
              )}
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceLabel}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <View style={[styles.statusBadge, getStatusStyle()]}>
              <Text>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.billTo}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.clientName}>{client.name || 'No client'}</Text>
            {client.company && <Text style={styles.clientDetail}>{client.company}</Text>}
            {client.email && <Text style={styles.clientDetail}>{client.email}</Text>}
            {client.location && <Text style={styles.clientDetail}>{client.location}</Text>}
          </View>
          <View style={styles.invoiceInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Issue Date</Text>
              <Text style={styles.infoValue}>{formatDate(invoice.issue_date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Due Date</Text>
              <Text style={styles.infoValue}>{formatDate(invoice.due_date)}</Text>
            </View>
            {invoice.project_reference && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Project</Text>
                <Text style={styles.infoValue}>{invoice.project_reference}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>

          {/* Table Rows */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.tableCellMono, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCellMono, styles.colPrice]}>
                {formatCurrency(item.unit_price, invoice.currency)}
              </Text>
              <Text style={[styles.tableCellMono, styles.colAmount]}>
                {formatCurrency(item.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </Text>
            </View>
            {invoice.tax_amount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax ({invoice.tax_rate}%)</Text>
                <Text style={styles.totalsValue}>
                  {formatCurrency(invoice.tax_amount, invoice.currency)}
                </Text>
              </View>
            )}
            <View style={styles.totalsFinal}>
              <Text style={styles.totalsFinalLabel}>Total</Text>
              <Text style={styles.totalsFinalValue}>
                {formatCurrency(invoice.total, invoice.currency)}
              </Text>
            </View>

            {/* Partial payment rows - only if some payment has been received */}
            {hasPayments && (
              <>
                <View style={[styles.totalsRow, { marginTop: 8 }]}>
                  <Text style={styles.totalsPaidLabel}>Paid</Text>
                  <Text style={styles.totalsPaidValue}>
                    -{formatCurrency(amountPaid, invoice.currency)}
                  </Text>
                </View>
                <View style={styles.totalsSubTop}>
                  <Text style={styles.totalsDueLabel}>Amount Due</Text>
                  <Text style={styles.totalsDueValue}>
                    {formatCurrency(amountDue, invoice.currency)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Payment CTA - only render if there's still money to collect and a link exists */}
        {canPay && (
          <View style={styles.paymentCta}>
            <View style={styles.paymentCtaHeader}>
              <Text style={styles.paymentCtaTitle}>Ready to pay?</Text>
              <Text style={styles.paymentCtaAmount}>
                {formatCurrency(amountDue, invoice.currency)}
              </Text>
            </View>
            <Link src={invoice.payment_link_url} style={styles.paymentCtaButton}>
              PAY NOW
            </Link>
            <Text style={styles.paymentCtaHint}>
              Secure checkout by Flutterwave. Card and UK bank transfer accepted.
            </Text>
          </View>
        )}

        {/* Payments Received - audit trail (visible when any payment recorded) */}
        {invoice.payments && invoice.payments.length > 0 && (
          <View style={styles.paymentsReceived}>
            <Text style={styles.sectionLabel}>Payments Received</Text>
            <View style={styles.paymentsTable}>
              <View style={styles.paymentsHeaderRow}>
                <Text style={[styles.paymentsHeaderText, styles.paymentsColDate]}>Date</Text>
                <Text style={[styles.paymentsHeaderText, styles.paymentsColMethod]}>Method</Text>
                <Text style={[styles.paymentsHeaderText, styles.paymentsColRef]}>Reference</Text>
                <Text style={[styles.paymentsHeaderText, styles.paymentsColAmount]}>Amount</Text>
              </View>
              {invoice.payments.map((payment, i) => (
                <View key={payment.id || i} style={styles.paymentsRow}>
                  <Text style={[styles.paymentsCellText, styles.paymentsColDate]}>
                    {formatDate(payment.received_date)}
                  </Text>
                  <Text style={[styles.paymentsCellText, styles.paymentsColMethod]}>
                    {formatPaymentMethod(payment)}
                  </Text>
                  <Text style={[styles.paymentsCellRef, styles.paymentsColRef]}>
                    {formatPaymentRef(payment)}
                  </Text>
                  <Text style={[styles.paymentsCellAmount, styles.paymentsColAmount]}>
                    {formatCurrency(payment.amount_received, payment.currency_received)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.paymentsSummary}>
              <Text style={styles.paymentsSummaryText}>
                Total received: {formatCurrency(amountPaid, invoice.currency)}
                {!isFullyPaid && ` · Balance due: ${formatCurrency(amountDue, invoice.currency)}`}
              </Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{websiteDisplay || company.name}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
