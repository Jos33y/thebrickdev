/**
 * PDF Utilities - Functions for generating and downloading PDFs
 * 
 * Now fetches company info from Settings before generating PDFs
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
 * Fetch company info from settings for PDF generation
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
 * Generate and download invoice PDF
 * 
 * @param {Object} invoice - Invoice data with client and items
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function downloadInvoicePDF(invoice) {
  try {
    // Fetch company info from settings
    const companyInfo = await fetchCompanyInfo();

    // Generate PDF blob with company info
    const blob = await pdf(
      createElement(InvoicePDF, { invoice, companyInfo })
    ).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoice_number}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
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
 * @returns {Promise<Blob>}
 */
export async function generateInvoicePDFBlob(invoice) {
  // Fetch company info from settings
  const companyInfo = await fetchCompanyInfo();

  const blob = await pdf(
    createElement(InvoicePDF, { invoice, companyInfo })
  ).toBlob();
  
  return blob;
}

/**
 * Open invoice PDF in new tab (for preview/print)
 * 
 * @param {Object} invoice - Invoice data
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function previewInvoicePDF(invoice) {
  try {
    // Fetch company info from settings
    const companyInfo = await fetchCompanyInfo();

    const blob = await pdf(
      createElement(InvoicePDF, { invoice, companyInfo })
    ).toBlob();
    
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Cleanup after a delay
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to preview PDF:', error);
    return { success: false, error: error.message };
  }
}

export { InvoicePDF };