/**
 * PDF Utilities - Functions for generating and downloading PDFs
 */

import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import InvoicePDF from './InvoicePDF';

/**
 * Generate and download invoice PDF
 * 
 * @param {Object} invoice - Invoice data with client and items
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function downloadInvoicePDF(invoice) {
  try {
    // Generate PDF blob
    const blob = await pdf(createElement(InvoicePDF, { invoice })).toBlob();
    
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
  const blob = await pdf(createElement(InvoicePDF, { invoice })).toBlob();
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
    const blob = await pdf(createElement(InvoicePDF, { invoice })).toBlob();
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