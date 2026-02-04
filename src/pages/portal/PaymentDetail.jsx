/**
 * PaymentDetail - Single payment view
 * 
 * NEW: Displays account name and receipt image/link
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PageHeader,
  Card,
  Button,
  StatusBadge,
  Modal,
  EmptyState,
  LoadingState,
} from '../../components/portal/common';
import { EditIcon, TrashIcon, CheckCircleIcon, InvoiceIcon, ExternalLinkIcon, ImageIcon } from '../../components/common/Icons';
import { usePayment, useUpdatePaymentStatus, useDeletePayment } from '../../hooks/usePayments';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { supabase } from '../../lib/supabase';

const PAYMENT_TYPE_LABELS = {
  bank: 'Bank Transfer',
  platform: 'Platform',
  crypto: 'Cryptocurrency',
};

const PLATFORM_LABELS = {
  grey: 'Grey',
  payoneer: 'Payoneer',
  wise: 'Wise',
  other: 'Other',
};

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const { data: payment, isLoading, error } = usePayment(id);
  const updateStatus = useUpdatePaymentStatus();
  const deletePayment = useDeletePayment();

  // Generate signed URL for receipt (private bucket)
  const [receiptSignedUrl, setReceiptSignedUrl] = useState(null);
  
  useEffect(() => {
    const getSignedUrl = async () => {
      const receiptPath = payment?.details?.receipt_url;
      if (!receiptPath) {
        setReceiptSignedUrl(null);
        return;
      }
      
      let filePath = receiptPath;
      
      // If it's a full Supabase URL, extract just the file path
      // URL format: https://xxx.supabase.co/storage/v1/object/public/receipts/payments/filename.jpg
      if (receiptPath.includes('supabase.co/storage')) {
        const match = receiptPath.match(/\/receipts\/(.+)$/);
        if (match) {
          filePath = match[1]; // e.g., "payments/filename.jpg"
        }
      }
      
      // Generate signed URL for private bucket (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrl(filePath, 3600);
      
      if (error) {
        console.error('Error getting signed URL:', error);
        return;
      }
      
      setReceiptSignedUrl(data.signedUrl);
    };
    
    if (payment?.details?.receipt_url) {
      getSignedUrl();
    }
  }, [payment?.details?.receipt_url]);

  const handleMarkCleared = async () => {
    try {
      await updateStatus.mutateAsync({
        id,
        status: 'cleared',
        cleared_date: new Date().toISOString().split('T')[0],
      });
      setShowStatusModal(false);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePayment.mutateAsync(id);
      navigate('/portal/payments');
    } catch (err) {
      console.error('Failed to delete payment:', err);
    }
  };

  // Check if receipt is an image
  const isReceiptImage = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  if (isLoading) {
    return (
      <div className="portal-page">
        <LoadingState text="Loading payment..." />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="portal-page">
        <PageHeader title="Payment Not Found" backTo="/portal/payments" />
        <Card>
          <EmptyState
            title="Payment not found"
            description="This payment may have been deleted."
            action={<Button onClick={() => navigate('/portal/payments')}>Back to Payments</Button>}
          />
        </Card>
      </div>
    );
  }

  const receiptUrl = receiptSignedUrl;

  return (
    <div className="portal-page portal-payment-detail">
      <PageHeader
        title={formatCurrency(payment.amount_received, payment.currency_received)}
        subtitle={`Received ${formatDate(payment.received_date)}`}
        backTo="/portal/payments"
        backLabel="Payments"
        actions={
          <div className="header-actions">
            {payment.status === 'pending' && (
              <Button variant="primary" icon={CheckCircleIcon} onClick={() => setShowStatusModal(true)}>
                Mark Cleared
              </Button>
            )}
            <Button variant="ghost" icon={EditIcon} onClick={() => navigate(`/portal/payments/${id}/edit`)}>
              Edit
            </Button>
            <Button variant="ghost" icon={TrashIcon} onClick={() => setShowDeleteModal(true)}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="detail-grid">
        <div className="detail-main">
          {/* Payment Info */}
          <Card title="Payment Details" padding="md">
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">Amount</span>
                <span className="detail-value detail-value--large">
                  {formatCurrency(payment.amount_received, payment.currency_received)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <StatusBadge status={payment.status} />
              </div>
              <div className="detail-row">
                <span className="detail-label">Date Received</span>
                <span className="detail-value">{formatDate(payment.received_date)}</span>
              </div>
              {payment.cleared_date && (
                <div className="detail-row">
                  <span className="detail-label">Cleared Date</span>
                  <span className="detail-value">{formatDate(payment.cleared_date)}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Payment Method</span>
                <span className="detail-value">{PAYMENT_TYPE_LABELS[payment.payment_type]}</span>
              </div>
            </div>
          </Card>

          {/* Bank Details */}
          {payment.payment_type === 'bank' && payment.details && (
            <Card title="Bank Transfer Details" padding="md">
              <div className="detail-rows">
                {payment.details.bank_name && (
                  <div className="detail-row">
                    <span className="detail-label">Bank Name</span>
                    <span className="detail-value">{payment.details.bank_name}</span>
                  </div>
                )}
                {payment.details.account_name && (
                  <div className="detail-row">
                    <span className="detail-label">Account Holder</span>
                    <span className="detail-value">{payment.details.account_name}</span>
                  </div>
                )}
                {payment.details.account_reference && (
                  <div className="detail-row">
                    <span className="detail-label">Account Reference</span>
                    <span className="detail-value detail-value--mono">{payment.details.account_reference}</span>
                  </div>
                )}
                {payment.details.transfer_reference && (
                  <div className="detail-row">
                    <span className="detail-label">Transfer Reference</span>
                    <span className="detail-value detail-value--mono">{payment.details.transfer_reference}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Platform Details */}
          {payment.payment_type === 'platform' && payment.details && (
            <Card title="Platform Details" padding="md">
              <div className="detail-rows">
                {payment.details.platform && (
                  <div className="detail-row">
                    <span className="detail-label">Platform</span>
                    <span className="detail-value">{PLATFORM_LABELS[payment.details.platform] || payment.details.platform}</span>
                  </div>
                )}
                {payment.details.account_name && (
                  <div className="detail-row">
                    <span className="detail-label">Account Holder</span>
                    <span className="detail-value">{payment.details.account_name}</span>
                  </div>
                )}
                {payment.details.transaction_reference && (
                  <div className="detail-row">
                    <span className="detail-label">Transaction Ref</span>
                    <span className="detail-value detail-value--mono">{payment.details.transaction_reference}</span>
                  </div>
                )}
                {payment.details.amount_received_usd && (
                  <div className="detail-row">
                    <span className="detail-label">Amount (USD)</span>
                    <span className="detail-value">{formatCurrency(payment.details.amount_received_usd, 'USD')}</span>
                  </div>
                )}
                {payment.details.conversion_rate && (
                  <div className="detail-row">
                    <span className="detail-label">Conversion Rate</span>
                    <span className="detail-value">₦{payment.details.conversion_rate.toLocaleString()}</span>
                  </div>
                )}
                {payment.details.amount_ngn && (
                  <div className="detail-row">
                    <span className="detail-label">Amount (NGN)</span>
                    <span className="detail-value">{formatCurrency(payment.details.amount_ngn, 'NGN')}</span>
                  </div>
                )}
                {payment.details.deposit_bank && (
                  <div className="detail-row">
                    <span className="detail-label">Deposit Bank</span>
                    <span className="detail-value">{payment.details.deposit_bank}</span>
                  </div>
                )}
                {payment.details.deposit_date && (
                  <div className="detail-row">
                    <span className="detail-label">Deposit Date</span>
                    <span className="detail-value">{formatDate(payment.details.deposit_date)}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Crypto Details */}
          {payment.payment_type === 'crypto' && payment.details && (
            <Card title="Crypto Details" padding="md">
              <div className="detail-rows">
                {payment.details.crypto_type && (
                  <div className="detail-row">
                    <span className="detail-label">Crypto Type</span>
                    <span className="detail-value">{payment.details.crypto_type}</span>
                  </div>
                )}
                {payment.details.network && (
                  <div className="detail-row">
                    <span className="detail-label">Network</span>
                    <span className="detail-value">{payment.details.network}</span>
                  </div>
                )}
                {payment.details.amount_crypto && (
                  <div className="detail-row">
                    <span className="detail-label">Crypto Amount</span>
                    <span className="detail-value">{payment.details.amount_crypto} {payment.details.crypto_type}</span>
                  </div>
                )}
                {payment.details.transaction_hash && (
                  <div className="detail-row">
                    <span className="detail-label">Transaction Hash</span>
                    <span className="detail-value detail-value--mono detail-value--break">{payment.details.transaction_hash}</span>
                  </div>
                )}
                {payment.details.wallet_address && (
                  <div className="detail-row">
                    <span className="detail-label">Wallet Address</span>
                    <span className="detail-value detail-value--mono detail-value--break">{payment.details.wallet_address}</span>
                  </div>
                )}
                {payment.details.deposit_bank && (
                  <div className="detail-row">
                    <span className="detail-label">Deposit Bank</span>
                    <span className="detail-value">{payment.details.deposit_bank}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Receipt - NEW */}
          {receiptUrl && (
            <Card title="Receipt / Proof of Payment" padding="md">
              {isReceiptImage(receiptUrl) ? (
                <div className="receipt-display">
                  <img 
                    src={receiptUrl} 
                    alt="Payment receipt" 
                    className="receipt-display__image"
                    onClick={() => setShowReceiptModal(true)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="receipt-display__actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={ImageIcon}
                      onClick={() => setShowReceiptModal(true)}
                    >
                      View Full Size
                    </Button>
                    <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" icon={ExternalLinkIcon}>
                        Open in New Tab
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="receipt-display__file">
                  <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="receipt-display__link">
                    <ExternalLinkIcon size={20} />
                    View Receipt
                  </a>
                </div>
              )}
            </Card>
          )}

          {/* Notes */}
          {payment.notes && (
            <Card title="Notes" padding="md">
              <p>{payment.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          <Card title="Linked Invoice" padding="md">
            {payment.invoice ? (
              <div className="invoice-link">
                <InvoiceIcon size={20} />
                <div>
                  <Link to={`/portal/invoices/${payment.invoice.id}`} className="invoice-link__number">
                    {payment.invoice.invoice_number}
                  </Link>
                  <p className="invoice-link__client">{payment.invoice.client?.name}</p>
                  <p className="invoice-link__amount">{formatCurrency(payment.invoice.total, payment.invoice.currency)}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted">No invoice linked</p>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Payment"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deletePayment.isPending}>Delete</Button>
          </>
        }
      >
        <p>Are you sure you want to delete this payment?</p>
      </Modal>

      {/* Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Mark as Cleared"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleMarkCleared} loading={updateStatus.isPending}>Mark Cleared</Button>
          </>
        }
      >
        <p>This will mark the payment as cleared.</p>
      </Modal>

      {/* Receipt Modal - NEW */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Receipt"
        size="lg"
      >
        {receiptUrl && isReceiptImage(receiptUrl) && (
          <img 
            src={receiptUrl} 
            alt="Payment receipt" 
            style={{ width: '100%', height: 'auto' }}
          />
        )}
      </Modal>
    </div>
  );
};

export default PaymentDetail;