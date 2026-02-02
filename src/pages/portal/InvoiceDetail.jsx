/**
 * InvoiceDetail - Single invoice view
 * 
 * Shows invoice details, line items, payments, and status actions.
 * Includes PDF download and Send Invoice functionality.
 * 
 * Now uses Settings for company info instead of hardcoded COMPANY_INFO
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
    key: 'amount',
    header: 'Amount',
    render: (value, row) => formatCurrency(value, row.currency),
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

  // Data fetching
  const { data: invoice, isLoading, error, refetch } = useInvoice(id);
  const { data: settings } = useSettings();
  const updateStatus = useUpdateInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();

  // Get company info from settings
  const companyName = settings?.company_name || 'My Business';
  const companyEmail = settings?.company_email || '';
  const companyAddress = [
    settings?.company_address,
    settings?.company_city,
    settings?.company_country,
  ].filter(Boolean).join(', ');

  // Calculate payment summary
  const paymentSummary = invoice?.payments ? {
    totalPaid: invoice.payments
      .filter(p => p.status === 'cleared')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    pendingAmount: invoice.payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
  } : { totalPaid: 0, pendingAmount: 0 };

  const amountDue = (invoice?.total || 0) - paymentSummary.totalPaid;

  // Handle PDF download
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDF(invoice);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
    setIsDownloading(false);
  };

  // Handle send invoice success
  const handleSendSuccess = () => {
    // Auto mark as sent if still draft
    if (invoice.status === 'draft') {
      updateStatus.mutate({ id, status: 'sent' });
    }
    refetch();
  };

  // Handle status change
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

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(id);
      navigate('/portal/invoices');
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="portal-page">
        <LoadingState text="Loading invoice..." />
      </div>
    );
  }

  // Error state
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

  // Determine available actions based on status
  const canEdit = invoice.status === 'draft';
  const canDelete = invoice.status === 'draft';
  const canSend = ['draft', 'sent'].includes(invoice.status);
  const canMarkSent = invoice.status === 'draft';
  const canMarkPaid = ['sent', 'overdue'].includes(invoice.status);

  return (
    <div className="portal-page portal-invoice-detail">
      <PageHeader
        title={invoice.invoice_number}
        subtitle={invoice.client?.name || 'No client'}
        backTo="/portal/invoices"
        backLabel="Invoices"
        actions={
          <div className="invoice-actions">
            {/* Download PDF - always available */}
            <Button
              variant="secondary"
              icon={DownloadIcon}
              onClick={handleDownloadPDF}
              loading={isDownloading}
            >
              Download PDF
            </Button>

            {/* Send Invoice */}
            {canSend && (
              <Button
                variant="primary"
                icon={SendIcon}
                onClick={() => setShowSendModal(true)}
              >
                Send Invoice
              </Button>
            )}

            {/* Mark as Sent (manual) */}
            {canMarkSent && (
              <Button
                variant="secondary"
                onClick={() => handleStatusChange('sent')}
              >
                Mark as Sent
              </Button>
            )}

            {/* Mark as Paid */}
            {canMarkPaid && (
              <Button
                variant="primary"
                icon={CheckCircleIcon}
                onClick={() => handleStatusChange('paid')}
              >
                Mark as Paid
              </Button>
            )}

            {/* Edit (drafts only) */}
            {canEdit && (
              <Button
                variant="ghost"
                icon={EditIcon}
                onClick={() => navigate(`/portal/invoices/${id}/edit`)}
              >
                Edit
              </Button>
            )}

            {/* Delete (drafts only) */}
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
        {/* Invoice Preview */}
        <div className="invoice-detail__preview">
          <Card padding="none">
            <div className="invoice-preview">
              {/* Header */}
              <div className="invoice-preview__header">
                <div className="invoice-preview__company">
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
                  {invoice.client?.company && (
                    <p>{invoice.client.company}</p>
                  )}
                  {invoice.client?.email && (
                    <p>{invoice.client.email}</p>
                  )}
                  {invoice.client?.location && (
                    <p>{invoice.client.location}</p>
                  )}
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
                      <tr key={index}>
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
                {paymentSummary.totalPaid > 0 && (
                  <>
                    <div className="invoice-preview__totals-row invoice-preview__totals-row--paid">
                      <span>Paid</span>
                      <span>-{formatCurrency(paymentSummary.totalPaid, invoice.currency)}</span>
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
                <span>{formatCurrency(paymentSummary.totalPaid, invoice.currency)}</span>
              </div>
              {paymentSummary.pendingAmount > 0 && (
                <div className="invoice-summary__row invoice-summary__row--warning">
                  <span>Pending</span>
                  <span>{formatCurrency(paymentSummary.pendingAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="invoice-summary__row invoice-summary__row--due">
                <span>Amount Due</span>
                <span>{formatCurrency(amountDue, invoice.currency)}</span>
              </div>
            </div>
          </Card>

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