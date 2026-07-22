/**
 * PDF Utilities - Functions for generating and downloading PDFs
 *
 * Fetches company info from Settings by default (portal use).
 * Callers can also pass companyInfo directly to skip the fetch —
 * needed for the public /invoice/:token page which has no auth
 * (settings RLS doesn't allow anon access).
 */

import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import InvoicePDF from './InvoicePDF';
import { supabase } from '../supabase';

// Default company info fallback
const DEFAULT_COMPANY = {
  name: 'My Business',
  email: '',
  address: '',
  website: '',
};

/**
 * Fetch company info from settings for PDF generation.
 * Only usable in authenticated contexts (settings is not anon-readable).
 */
async function fetchCompanyInfo() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('company_name, company_email, company_phone, company_address, company_city, company_country, company_website')
      .single();

    if (error) {
      console.warn('Could not fetch settings for PDF, using defaults:', error.message);
      return DEFAULT_COMPANY;
    }

    // Build address from parts
    const address = [
      data.company_address,
      data.company_city,
      data.company_country,
    ].filter(Boolean).join(', ');

    return {
      name: data.company_name || DEFAULT_COMPANY.name,
      email: data.company_email || '',
      phone: data.company_phone || '',
      address: address,
      website: data.company_website || '',
    };
  } catch (err) {
    console.warn('Failed to fetch company info:', err);
    return DEFAULT_COMPANY;
  }
}

/**
 * Resolve company info: use provided companyInfo if given, else fetch from settings.
 * Providing companyInfo is required on the public page (no auth for settings).
 */
async function resolveCompanyInfo(providedCompanyInfo) {
  if (providedCompanyInfo) return providedCompanyInfo;
  return fetchCompanyInfo();
}

/**
 * Generate and download invoice PDF
 *
 * @param {Object} invoice - Invoice data with client, items, and payments
 * @param {Object} [companyInfo] - Optional. Pass to skip the settings fetch
 *                                  (required on public page where settings
 *                                  is not anon-readable).
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function downloadInvoicePDF(invoice, companyInfo) {
  try {
    const resolvedCompany = await resolveCompanyInfo(companyInfo);

    const blob = await pdf(
      createElement(InvoicePDF, { invoice, companyInfo: resolvedCompany })
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Timestamp suffix (YYYYMMDDHHmmss) prevents browser from appending "(1)", "(2)" etc.
    // and gives you a natural sort order in the Downloads folder.
    const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    link.download = `${invoice.invoice_number}-${ts}.pdf`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate PDF blob (for email attachment or preview)
 *
 * @param {Object} invoice - Invoice data
 * @param {Object} [companyInfo] - Optional. Pass to skip the settings fetch.
 * @returns {Promise<Blob>}
 */
export async function generateInvoicePDFBlob(invoice, companyInfo) {
  const resolvedCompany = await resolveCompanyInfo(companyInfo);

  const blob = await pdf(
    createElement(InvoicePDF, { invoice, companyInfo: resolvedCompany })
  ).toBlob();

  return blob;
}

/**
 * Open invoice PDF in new tab (for preview/print)
 *
 * @param {Object} invoice - Invoice data
 * @param {Object} [companyInfo] - Optional. Pass to skip the settings fetch.
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function previewInvoicePDF(invoice, companyInfo) {
  try {
    const resolvedCompany = await resolveCompanyInfo(companyInfo);

    const blob = await pdf(
      createElement(InvoicePDF, { invoice, companyInfo: resolvedCompany })
    ).toBlob();

    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 60000);

    return { success: true };
  } catch (error) {
    console.error('Failed to preview PDF:', error);
    return { success: false, error: error.message };
  }
}

export { InvoicePDF };
