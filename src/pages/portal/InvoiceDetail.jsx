/**
 * InvoiceDetail - Single invoice view (portal, authenticated)
 *
 * Uses the extracted <InvoicePreview /> component so the layout stays in sync
 * with the public /invoice/:token page.
 *
 * Adds a "Payment Link" card to the sidebar:
 *   - If no link generated: shows "Generate Payment Link" button
 *   - If link exists: shows link URL, Copy button, Copy Public Preview URL button
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Button,
  Card,
  StatusBadge,
  DataTable,
  Modal,
  EmptyState,
  LoadingState,
} from '../../components/portal/common';
import SendInvoiceModal from '../../components/portal/invoices/SendInvoiceModal';
import InvoicePreview from '../../components/portal/invoices/InvoicePreview';
import {
  EditIcon,
  TrashIcon,
  SendIcon,
  DownloadIcon,
  CheckCircleIcon,
  PaymentIcon,
  PlusIcon,
} from '../../components/common/Icons';
import {
  useInvoice,
  useUpdateInvoiceStatus,
  useDeleteInvoice,
} from '../../hooks/useInvoices';
import { useSettings } from '../../hooks/useSettings';
import { useCreatePaymentLink } from '../../hooks/useCreatePaymentLink';
import { downloadInvoicePDF } from '../../lib/pdf';
import { formatCurrency, formatDate } from '../../lib/formatters';

// Payment columns for table
const paymentColumns = [
  {
    key: 'received_date',
    header: 'Date',
    render: (value) => formatDate(value),
  },
  {
    key: 'amount_received',
    header: 'Amount',
    render: (value, row) => formatCurrency(value, row.currency_received),
  },
  {
    key: 'payment_type',
    header: 'Type',
    render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '—',
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <StatusBadge status={value} />,
  },
];

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  // Data fetching
  const { data: invoice, isLoading, error, refetch } = useInvoice(id);
  const { data: settings } = useSettings();
  const updateStatus = useUpdateInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();
  const { createPaymentLink, loading: creatingLink, error: linkError } = useCreatePaymentLink();

  // Get company info from settings
  const companyName = settings?.company_name || 'My Business';
  const companyEmail = settings?.company_email || '';
  // Fall back to the public brand mark if no logo is set in settings
  const companyLogo = settings?.logo_url || '/apple-touch-icon.png';
  const companyAddress = [
    settings?.company_address,
    settings?.company_city,
    settings?.company_country,
  ].filter(Boolean).join(', ');

  // Payment summary from invoice.amount_paid (consistent with public page)
  const totalPaid = Number(invoice?.amount_paid || 0);
  const pendingAmount = invoice?.payments
    ? invoice.payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (Number(p.amount_received) || 0), 0)
    : 0;
  const amountDue = Math.max(0, (invoice?.total || 0) - totalPaid);

  // Public preview URL
  const publicUrl = invoice?.public_token
    ? `${window.location.origin}/invoice/${invoice.public_token}`
    : null;

  // Handlers
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDF(invoice);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
    setIsDownloading(false);
  };

  const handleSendSuccess = () => {
    if (invoice.status === 'draft') {
      updateStatus.mutate({ id, status: 'sent' });
    }
    refetch();
  };

  const handleStatusChange = (newStatus) => {
    setPendingStatus(newStatus);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    try {
      await updateStatus.mutateAsync({ id, status: pendingStatus });
      setShowStatusModal(false);
      setPendingStatus(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(id);
      navigate('/portal/invoices');
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  const handleGenerateLink = async () => {
    const result = await createPaymentLink(id);
    if (result.success) {
      refetch();
    }
  };

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Loading + error states
  if (isLoading) {
    return (
      <div className="portal-page">
        <LoadingState text="Loading invoice..." />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="portal-page">
        <PageHeader title="Invoice Not Found" backTo="/portal/invoices" />
        <Card>
          <EmptyState
            title="Invoice not found"
            description="This invoice may have been deleted or doesn't exist."
            action={
              <Button onClick={() => navigate('/portal/invoices')}>
                Back to Invoices
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Available actions
  const canEdit = invoice.status === 'draft';
  const canDelete = invoice.status === 'draft';
  const canSend = ['draft', 'sent', 'partially_paid'].includes(invoice.status);
  const canMarkSent = invoice.status === 'draft';
  const canMarkPaid = ['sent', 'overdue', 'partially_paid'].includes(invoice.status);
  const canGenerateLink =
    invoice.status !== 'paid' && invoice.status !== 'cancelled' && Boolean(invoice.client?.email);

  return (
    <div className="portal-page portal-invoice-detail">
      <PageHeader
        title={invoice.invoice_number}
        subtitle={invoice.client?.name || 'No client'}
        backTo="/portal/invoices"
        backLabel="Invoices"
        actions={
          <div className="invoice-actions">
            <Button
              variant="secondary"
              icon={DownloadIcon}
              onClick={handleDownloadPDF}
              loading={isDownloading}
            >
              Download PDF
            </Button>

            {canSend && (
              <Button
                variant="primary"
                icon={SendIcon}
                onClick={() => setShowSendModal(true)}
              >
                Send Invoice
              </Button>
            )}

            {canMarkSent && (
              <Button
                variant="secondary"
                onClick={() => handleStatusChange('sent')}
              >
                Mark as Sent
              </Button>
            )}

            {canMarkPaid && (
              <Button
                variant="primary"
                icon={CheckCircleIcon}
                onClick={() => handleStatusChange('paid')}
              >
                Mark as Paid
              </Button>
            )}

            {canEdit && (
              <Button
                variant="ghost"
                icon={EditIcon}
                onClick={() => navigate(`/portal/invoices/${id}/edit`)}
              >
                Edit
              </Button>
            )}

            {canDelete && (
              <Button
                variant="ghost"
                icon={TrashIcon}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            )}
          </div>
        }
      />

      <div className="invoice-detail__grid">
        {/* Invoice Preview (shared component) */}
        <div className="invoice-detail__preview">
          <InvoicePreview
            invoice={invoice}
            companyName={companyName}
            companyEmail={companyEmail}
            companyAddress={companyAddress}
            companyLogo={companyLogo}
          />
        </div>

        {/* Sidebar */}
        <div className="invoice-detail__sidebar">
          {/* Payment Summary */}
          <Card title="Payment Summary" padding="md">
            <div className="invoice-summary">
              <div className="invoice-summary__row">
                <span>Total</span>
                <span>{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
              <div className="invoice-summary__row invoice-summary__row--success">
                <span>Paid</span>
                <span>{formatCurrency(totalPaid, invoice.currency)}</span>
              </div>
              {pendingAmount > 0 && (
                <div className="invoice-summary__row invoice-summary__row--warning">
                  <span>Pending</span>
                  <span>{formatCurrency(pendingAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="invoice-summary__row invoice-summary__row--due">
                <span>Amount Due</span>
                <span>{formatCurrency(amountDue, invoice.currency)}</span>
              </div>
            </div>
          </Card>

          {/* Payment Link + Public Preview */}
          <Card title="Payment Link" padding="md">
            {invoice.status === 'paid' ? (
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#999' }}>
                Invoice paid. The checkout link is no longer active.
              </p>
            ) : invoice.payment_link_url ? (
              <div className="payment-link-section">
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', color: '#999' }}>
                  Provider: {invoice.payment_link_provider || 'flutterwave'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(invoice.payment_link_url, 'checkout')}
                  >
                    {copyFeedback === 'checkout' ? 'Copied' : 'Copy Checkout Link'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(invoice.payment_link_url, '_blank')}
                  >
                    Open Checkout
                  </Button>
                  {canGenerateLink && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateLink}
                      loading={creatingLink}
                    >
                      Regenerate Link
                    </Button>
                  )}
                </div>
              </div>
            ) : canGenerateLink ? (
              <div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#999' }}>
                  Generate a Flutterwave hosted checkout link the client can pay with.
                </p>
                <Button
                  variant="primary"
                  onClick={handleGenerateLink}
                  loading={creatingLink}
                  disabled={!invoice.client?.email}
                  fullWidth
                >
                  Generate Payment Link
                </Button>
                {!invoice.client?.email && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem', color: '#c54b1a' }}>
                    Client email required.
                  </p>
                )}
                {linkError && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem', color: '#c54b1a' }}>
                    {linkError}
                  </p>
                )}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#999' }}>
                Payment link cannot be generated for this invoice.
              </p>
            )}
          </Card>

          {/* Public Preview Link (always available once invoice is saved) */}
          {publicUrl && (
            <Card title="Public Preview" padding="md">
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#999' }}>
                Shareable link showing the invoice + payment options.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopy(publicUrl, 'public')}
                fullWidth
              >
                {copyFeedback === 'public' ? 'Copied' : 'Copy Public Link'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(publicUrl, '_blank')}
                fullWidth
                style={{ marginTop: '0.5rem' }}
              >
                Preview
              </Button>
            </Card>
          )}

          {/* Payments */}
          <Card
            title="Payments"
            actions={
              <Button
                variant="ghost"
                size="sm"
                icon={PlusIcon}
                onClick={() => navigate(`/portal/payments/new?invoice=${id}`)}
              >
                Add
              </Button>
            }
            padding="none"
          >
            {invoice.payments && invoice.payments.length > 0 ? (
              <DataTable
                columns={paymentColumns}
                data={invoice.payments}
                onRowClick={(payment) => navigate(`/portal/payments/${payment.id}`)}
              />
            ) : (
              <EmptyState
                icon={PaymentIcon}
                title="No payments"
                description="No payments recorded for this invoice."
              />
            )}
          </Card>
        </div>
      </div>

      {/* Send Invoice Modal */}
      <SendInvoiceModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        invoice={invoice}
        onSuccess={handleSendSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Invoice"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteInvoice.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteInvoice.isPending}
            >
              Delete Invoice
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete invoice <strong>{invoice.invoice_number}</strong>?
        </p>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>
          This action cannot be undone.
        </p>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Mark as ${pendingStatus?.charAt(0).toUpperCase()}${pendingStatus?.slice(1) || ''}`}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowStatusModal(false)}
              disabled={updateStatus.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmStatusChange}
              loading={updateStatus.isPending}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p>
          {pendingStatus === 'sent' &&
            `This will mark the invoice as sent. The client should have received it.`}
          {pendingStatus === 'paid' &&
            `This will mark the invoice as fully paid. Use this if you've received payment outside the system.`}
        </p>
      </Modal>
    </div>
  );
};

export default InvoiceDetail;
