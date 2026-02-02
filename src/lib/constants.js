/**
 * Application Constants
 * 
 * Single source of truth for all constant values used in the portal.
 */

// Invoice statuses
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUS.DRAFT]: 'Draft',
  [INVOICE_STATUS.SENT]: 'Sent',
  [INVOICE_STATUS.PAID]: 'Paid',
  [INVOICE_STATUS.OVERDUE]: 'Overdue',
  [INVOICE_STATUS.CANCELLED]: 'Cancelled',
};

// Payment terms
export const PAYMENT_TERMS = {
  DUE_ON_RECEIPT: 'due_on_receipt',
  NET_7: 'net_7',
  NET_15: 'net_15',
  NET_30: 'net_30',
  NET_60: 'net_60',
};

export const PAYMENT_TERMS_LABELS = {
  [PAYMENT_TERMS.DUE_ON_RECEIPT]: 'Due on Receipt',
  [PAYMENT_TERMS.NET_7]: 'Net 7',
  [PAYMENT_TERMS.NET_15]: 'Net 15',
  [PAYMENT_TERMS.NET_30]: 'Net 30',
  [PAYMENT_TERMS.NET_60]: 'Net 60',
};

export const PAYMENT_TERMS_DAYS = {
  [PAYMENT_TERMS.DUE_ON_RECEIPT]: 0,
  [PAYMENT_TERMS.NET_7]: 7,
  [PAYMENT_TERMS.NET_15]: 15,
  [PAYMENT_TERMS.NET_30]: 30,
  [PAYMENT_TERMS.NET_60]: 60,
};

// Payment types
export const PAYMENT_TYPE = {
  BANK: 'bank',
  PLATFORM: 'platform',
  CRYPTO: 'crypto',
};

export const PAYMENT_TYPE_LABELS = {
  [PAYMENT_TYPE.BANK]: 'Bank Transfer',
  [PAYMENT_TYPE.PLATFORM]: 'Platform',
  [PAYMENT_TYPE.CRYPTO]: 'Crypto',
};

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  CLEARED: 'cleared',
  FAILED: 'failed',
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.CLEARED]: 'Cleared',
  [PAYMENT_STATUS.FAILED]: 'Failed',
};

// Platforms (Grey, Payoneer, Wise)
export const PLATFORMS = {
  GREY: 'grey',
  PAYONEER: 'payoneer',
  WISE: 'wise',
  OTHER: 'other',
};

export const PLATFORM_LABELS = {
  [PLATFORMS.GREY]: 'Grey.co',
  [PLATFORMS.PAYONEER]: 'Payoneer',
  [PLATFORMS.WISE]: 'Wise',
  [PLATFORMS.OTHER]: 'Other',
};

// Crypto types
export const CRYPTO_TYPES = {
  USDT: 'USDT',
  USDC: 'USDC',
  BTC: 'BTC',
  ETH: 'ETH',
  OTHER: 'other',
};

export const CRYPTO_TYPE_LABELS = {
  [CRYPTO_TYPES.USDT]: 'USDT (Tether)',
  [CRYPTO_TYPES.USDC]: 'USDC',
  [CRYPTO_TYPES.BTC]: 'Bitcoin (BTC)',
  [CRYPTO_TYPES.ETH]: 'Ethereum (ETH)',
  [CRYPTO_TYPES.OTHER]: 'Other',
};

// Crypto networks
export const CRYPTO_NETWORKS = {
  TRC20: 'TRC20',
  ERC20: 'ERC20',
  BEP20: 'BEP20',
  BITCOIN: 'Bitcoin',
  OTHER: 'other',
};

export const CRYPTO_NETWORK_LABELS = {
  [CRYPTO_NETWORKS.TRC20]: 'TRC20 (Tron)',
  [CRYPTO_NETWORKS.ERC20]: 'ERC20 (Ethereum)',
  [CRYPTO_NETWORKS.BEP20]: 'BEP20 (BSC)',
  [CRYPTO_NETWORKS.BITCOIN]: 'Bitcoin Network',
  [CRYPTO_NETWORKS.OTHER]: 'Other',
};

// Nigerian banks
export const BANKS = {
  KUDA: 'kuda',
  OPAY: 'opay',
  CARBON: 'carbon',
  PALMPAY: 'palmpay',
  GTBANK: 'gtbank',
  OTHER: 'other',
};

export const BANK_LABELS = {
  [BANKS.KUDA]: 'Kuda Bank',
  [BANKS.OPAY]: 'OPay',
  [BANKS.CARBON]: 'Carbon',
  [BANKS.PALMPAY]: 'PalmPay',
  [BANKS.GTBANK]: 'GTBank',
  [BANKS.OTHER]: 'Other',
};

// Currencies
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  NGN: 'NGN',
};

export const CURRENCY_SYMBOLS = {
  [CURRENCIES.USD]: '$',
  [CURRENCIES.EUR]: '€',
  [CURRENCIES.GBP]: '£',
  [CURRENCIES.NGN]: '₦',
};

// Client statuses
export const CLIENT_STATUS = {
  PROSPECT: 'prospect',
  ACTIVE: 'active',
  PAST: 'past',
  LOST: 'lost',
};

export const CLIENT_STATUS_LABELS = {
  [CLIENT_STATUS.PROSPECT]: 'Prospect',
  [CLIENT_STATUS.ACTIVE]: 'Active',
  [CLIENT_STATUS.PAST]: 'Past',
  [CLIENT_STATUS.LOST]: 'Lost',
};

// Company information (for invoices)
export const COMPANY_INFO = {
  name: 'The Brick Dev Studios',
  email: 'hello@thebrickdev.com',
  phone: '+2348162438553',
  website: 'https://thebrickdev.com',
  address: 'Lagos, Nigeria',
};

// Visa target (for dashboard reference)
export const VISA_TARGET = {
  monthlyEUR: 3480,
  savingsEUR: 15660,
};
