/**
 * useCreatePaymentLink
 *
 * Hook to generate a Flutterwave hosted payment link for an invoice.
 * Calls POST /api/create-payment-link on the server, which:
 *   1. Fetches the invoice + client from Supabase
 *   2. Calls Flutterwave to create a hosted checkout link
 *   3. Persists payment_link_url, payment_link_ref, payment_link_provider on the invoice
 *   4. Returns the link to the frontend
 *
 * Usage:
 *   const { createPaymentLink, loading, error } = useCreatePaymentLink();
 *   const result = await createPaymentLink(invoiceId);
 *   if (result.success) {
 *     window.open(result.paymentLinkUrl, '_blank');
 *   }
 */

import { useState } from 'react';

export function useCreatePaymentLink() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function createPaymentLink(invoiceId) {
    if (!invoiceId) {
      const err = 'invoiceId is required';
      setError(err);
      return { success: false, error: err };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = data.error || 'Failed to create payment link';
        setError(message);
        return { success: false, error: message, details: data.details };
      }

      return {
        success: true,
        paymentLinkUrl: data.payment_link_url,
        paymentLinkRef: data.payment_link_ref,
        warning: data.warning || null,
      };
    } catch (err) {
      const message = err.message || 'Network error creating payment link';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  return { createPaymentLink, loading, error };
}

export default useCreatePaymentLink;
