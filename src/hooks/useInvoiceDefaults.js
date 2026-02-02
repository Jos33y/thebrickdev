/**
 * useInvoiceDefaults - Hook to get invoice form defaults from Settings
 * 
 * Returns default values for:
 * - currency (from settings.default_currency)
 * - payment_terms (from settings.default_payment_terms)
 * - notes (from settings.invoice_notes_template)
 * 
 * Use in InvoiceCreate/InvoiceForm to pre-fill fields
 */

import { useSettings } from './useSettings';

// Fallback defaults if settings not available
const FALLBACK_DEFAULTS = {
  currency: 'USD',
  payment_terms: 'net_15',
  notes: 'Thank you for your business!',
};

/**
 * Hook: useInvoiceDefaults
 * Returns default values for invoice forms from Settings
 */
export function useInvoiceDefaults() {
  const { data: settings, isLoading } = useSettings();

  const defaults = {
    currency: settings?.default_currency || FALLBACK_DEFAULTS.currency,
    payment_terms: settings?.default_payment_terms || FALLBACK_DEFAULTS.payment_terms,
    notes: settings?.invoice_notes_template || FALLBACK_DEFAULTS.notes,
  };

  return {
    defaults,
    isLoading,
    // Helper to check if we have settings loaded
    hasSettings: !!settings,
  };
}

export default useInvoiceDefaults;