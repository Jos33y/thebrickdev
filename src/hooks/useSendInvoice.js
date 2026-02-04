/**
 * useSendInvoice - Hook for sending invoices via Vercel Serverless Function
 * 
 * Supports PDF attachment via:
 * - pdfBase64: base64 encoded PDF (from client-side generation)
 * - pdfUrl: URL to hosted PDF
 */

import { useState } from 'react';
import { formatCurrency, formatDate } from '../lib/formatters';
import { supabase } from '../lib/supabase';

const DEFAULT_COMPANY = {
  company_name: 'My Business',
  company_email: '',
  company_website: '',
};

const fetchSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('company_name, company_email, company_website')
    .single();

  if (error) {
    console.warn('Could not fetch settings for email, using defaults');
    return DEFAULT_COMPANY;
  }
  return data;
};

const generateEmailHTML = ({ 
  invoiceNumber, recipientName, amount, currency, dueDate, 
  customMessage, companyName, companyWebsite, hasPdfAttachment
}) => {
  const message = customMessage || 
    `Please find attached invoice ${invoiceNumber} for ${formatCurrency(amount, currency)}, due on ${formatDate(dueDate)}.`;
  const websiteDisplay = companyWebsite?.replace(/^https?:\/\//, '') || '';
  const attachmentNote = hasPdfAttachment 
    ? '📎 The full invoice PDF is attached to this email.'
    : '📄 Please find your invoice details above.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e5e5;">
      <div style="font-size: 24px; font-weight: bold; color: #ea580c;">${companyName}</div>
      <div style="font-family: monospace; font-size: 18px; color: #ea580c; margin-top: 10px;">${invoiceNumber}</div>
    </div>
    <p>Hi${recipientName ? ` ${recipientName}` : ''},</p>
    <div style="background-color: #fafafa; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0;">${message}</p>
    </div>
    <table style="width: 100%; margin: 30px 0; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 10px 0; color: #666;">Invoice Number</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 600;">${invoiceNumber}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 10px 0; color: #666;">Due Date</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 600;">${formatDate(dueDate)}</td>
      </tr>
      <tr>
        <td style="padding: 15px 0; color: #666; font-size: 18px;">Amount Due</td>
        <td style="padding: 15px 0; text-align: right; font-weight: 600; font-size: 18px; color: #ea580c;">${formatCurrency(amount, currency)}</td>
      </tr>
    </table>
    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 6px; font-size: 14px; color: #0369a1;">
      ${attachmentNote}
    </div>
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #888; font-size: 14px;">
      <p style="margin: 0;">${companyName}</p>
      ${websiteDisplay ? `<p style="margin: 5px 0;">${websiteDisplay}</p>` : ''}
    </div>
  </div>
</body>
</html>`;
};

const generateEmailText = ({ 
  invoiceNumber, recipientName, amount, currency, dueDate, 
  customMessage, companyName, companyWebsite 
}) => {
  const websiteDisplay = companyWebsite?.replace(/^https?:\/\//, '') || '';
  return `
Invoice ${invoiceNumber} from ${companyName}

Hi${recipientName ? ` ${recipientName}` : ''},

${customMessage || `Please find attached invoice ${invoiceNumber} for ${formatCurrency(amount, currency)}, due on ${formatDate(dueDate)}.`}

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Due Date: ${formatDate(dueDate)}
- Amount Due: ${formatCurrency(amount, currency)}

---
${companyName}
${websiteDisplay}
  `.trim();
};

/**
 * Hook: Send invoice email with optional PDF attachment
 */
export function useSendInvoice() { 
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const sendInvoice = async ({ invoice, recipientEmail, message, pdfBase64, pdfUrl }) => {
    setIsPending(true);
    setError(null);

    try {
      const settings = await fetchSettings();
      const companyName = settings.company_name || DEFAULT_COMPANY.company_name;
      const companyWebsite = settings.company_website || '';
      const hasPdfAttachment = !!(pdfBase64 || pdfUrl);

      const html = generateEmailHTML({
        invoiceNumber: invoice.invoice_number,
        recipientName: invoice.client?.name,
        amount: invoice.total,
        currency: invoice.currency,
        dueDate: invoice.due_date,
        customMessage: message,
        companyName,
        companyWebsite,
        hasPdfAttachment,
      });

      const text = generateEmailText({
        invoiceNumber: invoice.invoice_number,
        recipientName: invoice.client?.name,
        amount: invoice.total,
        currency: invoice.currency,
        dueDate: invoice.due_date,
        customMessage: message,
        companyName,
        companyWebsite,
      });

      const payload = {
        to: recipientEmail,
        subject: `Invoice ${invoice.invoice_number} from ${companyName}`,
        html,
        text,
        invoiceNumber: invoice.invoice_number,
      };

      if (pdfBase64) {
        payload.pdfBase64 = pdfBase64;
      } else if (pdfUrl) {
        payload.pdfUrl = pdfUrl;
      }

      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send email');

      setIsPending(false);
      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to send email';
      setError(errorMessage);
      setIsPending(false);
      return { success: false, error: errorMessage };
    }
  };

  return { sendInvoice, isPending, error, reset: () => setError(null) };
}

export default useSendInvoice;