/**
 * Formatters
 * 
 * Utility functions for formatting dates, currencies, and other display values.
 */

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { CURRENCY_SYMBOLS, CURRENCIES } from './constants';

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - date-fns format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date or empty string if invalid
 */
export function formatDate(date, formatStr = 'MMM d, yyyy') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatStr);
}

/**
 * Format a date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date with time
 */
export function formatDateTime(date) {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

/**
 * Format a date as relative time (e.g., "3 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (USD, EUR, GBP, NGN)
 * @param {boolean} showSymbol - Whether to show currency symbol (default: true)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = CURRENCIES.USD, showSymbol = true) {
  if (amount === null || amount === undefined) return '';
  
  const num = Number(amount);
  if (isNaN(num)) return '';
  
  const symbol = showSymbol ? (CURRENCY_SYMBOLS[currency] || '') : '';
  
  // Format based on currency
  if (currency === CURRENCIES.NGN) {
    // Nigerian Naira - no decimals typically, use comma separators
    return `${symbol}${num.toLocaleString('en-NG', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })}`;
  }
  
  // USD, EUR, GBP - 2 decimal places
  return `${symbol}${num.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Format a number with commas (no currency)
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '';
  
  const number = Number(num);
  if (isNaN(number)) return '';
  
  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format crypto amount (up to 8 decimal places, trim trailing zeros)
 * @param {number} amount - Amount to format
 * @param {string} symbol - Crypto symbol (USDT, BTC, etc.)
 * @returns {string} Formatted crypto amount
 */
export function formatCrypto(amount, symbol = '') {
  if (amount === null || amount === undefined) return '';
  
  const num = Number(amount);
  if (isNaN(num)) return '';
  
  // Format with up to 8 decimals, then trim trailing zeros
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
  
  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Format a percentage
 * @param {number} value - Value to format (0.15 = 15%)
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {string} Formatted percentage
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '';
  
  const num = Number(value) * 100;
  if (isNaN(num)) return '';
  
  return `${num.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format invoice number for display (already formatted, but validates format)
 * @param {string} invoiceNumber - Invoice number (BRK-2025-001)
 * @returns {string} Invoice number
 */
export function formatInvoiceNumber(invoiceNumber) {
  if (!invoiceNumber) return '';
  return invoiceNumber.toUpperCase();
}

/**
 * Generate initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export function getInitials(name) {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
