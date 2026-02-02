/**
 * InvoicePDF - PDF document for invoice generation
 * 
 * Uses @react-pdf/renderer to create professional PDFs.
 * Now accepts companyInfo as prop from Settings instead of hardcoded COMPANY_INFO
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Rect,
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
    width: 100,
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
    marginBottom: 30,
  },
  totalsBox: {
    width: 220,
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
  totalsFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 2,
    borderTopColor: '#1a1a1a',
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
    return {};
  };

  // Website for footer (strip protocol)
  const websiteDisplay = company.website?.replace(/^https?:\/\//, '') || '';

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
              <Text>{(invoice.status || 'draft').toUpperCase()}</Text>
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
          </View>
        </View>

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