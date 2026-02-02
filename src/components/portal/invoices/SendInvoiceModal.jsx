/**
 * SendInvoiceModal - Modal for sending invoice via email
 */

import { useState, useEffect } from 'react';
import { Modal, Button, Input, TextArea } from '../common';
import { SendIcon } from '../../common/Icons';
import { useSendInvoice } from '../../../hooks/useSendInvoice';
import { formatCurrency, formatDate } from '../../../lib/formatters';
import { COMPANY_INFO } from '../../../lib/constants';

const SendInvoiceModal = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const { sendInvoice, isPending, error, reset } = useSendInvoice();

  // Form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  // Pre-fill email from client
  useEffect(() => {
    if (isOpen && invoice?.client?.email) {
      setRecipientEmail(invoice.client.email);
    }
  }, [isOpen, invoice]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRecipientEmail('');
      setMessage('');
      setValidationError('');
      reset();
    }
  }, [isOpen, reset]);

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle send
  const handleSend = async () => {
    // Validate
    if (!recipientEmail.trim()) {
      setValidationError('Email address is required');
      return;
    }

    if (!validateEmail(recipientEmail)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    setValidationError('');

    const result = await sendInvoice({
      invoice,
      recipientEmail: recipientEmail.trim(),
      message: message.trim(),
    });

    if (result.success) {
      onSuccess?.();
      onClose();
    }
  };

  // Handle email change
  const handleEmailChange = (e) => {
    setRecipientEmail(e.target.value);
    if (validationError) setValidationError('');
  };

  // Default message preview
  const defaultSubject = `Invoice ${invoice?.invoice_number} from ${COMPANY_INFO.name}`;
  const defaultMessage = message.trim() || 
    `Please find attached invoice ${invoice?.invoice_number} for ${formatCurrency(invoice?.total, invoice?.currency)}, due on ${formatDate(invoice?.due_date)}.`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Invoice"
      size="md"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={SendIcon}
            onClick={handleSend}
            loading={isPending}
          >
            Send Invoice
          </Button>
        </>
      }
    >
      <div className="send-invoice-modal">
        {/* Invoice summary */}
        <div className="send-invoice-modal__summary">
          <div className="send-invoice-modal__summary-row">
            <span>Invoice</span>
            <span className="send-invoice-modal__invoice-number">
              {invoice?.invoice_number}
            </span>
          </div>
          <div className="send-invoice-modal__summary-row">
            <span>Amount</span>
            <span>{formatCurrency(invoice?.total, invoice?.currency)}</span>
          </div>
          <div className="send-invoice-modal__summary-row">
            <span>Due Date</span>
            <span>{formatDate(invoice?.due_date)}</span>
          </div>
        </div>

        {/* Form */}
        <div className="send-invoice-modal__form">
          <Input
            label="Recipient Email"
            type="email"
            placeholder="client@example.com"
            value={recipientEmail}
            onChange={handleEmailChange}
            error={validationError}
            required
          />

          <TextArea
            label="Personal Message (optional)"
            placeholder="Add a personal message to include in the email..."
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            hint="Leave blank to use the default message"
          />
        </div>

        {/* Preview */}
        <div className="send-invoice-modal__preview">
          <h4>Email Preview</h4>
          <div className="send-invoice-modal__preview-box">
            <p className="send-invoice-modal__preview-subject">
              <strong>Subject:</strong> {defaultSubject}
            </p>
            <p className="send-invoice-modal__preview-message">
              {defaultMessage}
            </p>
            <p className="send-invoice-modal__preview-attachment">
              📎 {invoice?.invoice_number}.pdf
            </p>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="send-invoice-modal__error">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SendInvoiceModal;
