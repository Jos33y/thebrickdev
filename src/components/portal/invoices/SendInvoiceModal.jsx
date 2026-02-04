/**
 * SendInvoiceModal - Modal for sending invoice via email WITH PDF ATTACHMENT
 * 
 * Generates PDF using @react-pdf/renderer and attaches to email
 */

import { useState, useEffect } from 'react';
import { Modal, Button, Input, TextArea } from '../common';
import { SendIcon } from '../../common/Icons';
import { useSendInvoice } from '../../../hooks/useSendInvoice';
import { useSettings } from '../../../hooks/useSettings';
import { formatCurrency, formatDate } from '../../../lib/formatters';
import { generateInvoicePDFBlob } from '../../../lib/pdf';

/**
 * Convert Blob to Base64 string
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Remove the data:application/pdf;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const SendInvoiceModal = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const { sendInvoice, isPending, error, reset } = useSendInvoice();
  const { data: settings } = useSettings();

  // Get company name from settings
  const companyName = settings?.company_name || 'My Business';

  // Form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  // Handle send with PDF attachment
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
    setIsGeneratingPDF(true);

    try {
      // Generate PDF blob
      const pdfBlob = await generateInvoicePDFBlob(invoice);
      
      // Convert to base64
      const pdfBase64 = await blobToBase64(pdfBlob);

      // Send email with PDF attachment
      const result = await sendInvoice({
        invoice,
        recipientEmail: recipientEmail.trim(),
        message: message.trim(),
        pdfBase64, // Attach the PDF
      });

      if (result.success) {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setValidationError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle email change
  const handleEmailChange = (e) => {
    setRecipientEmail(e.target.value);
    if (validationError) setValidationError('');
  };

  // Default message preview
  const defaultSubject = `Invoice ${invoice?.invoice_number} from ${companyName}`;
  const defaultMessage = message.trim() || 
    `Please find attached invoice ${invoice?.invoice_number} for ${formatCurrency(invoice?.total, invoice?.currency)}, due on ${formatDate(invoice?.due_date)}.`;

  const isLoading = isPending || isGeneratingPDF;
  const loadingText = isGeneratingPDF ? 'Generating PDF...' : 'Sending...';

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
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={SendIcon}
            onClick={handleSend}
            loading={isLoading}
          >
            {isLoading ? loadingText : 'Send Invoice'}
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