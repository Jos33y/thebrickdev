/**
 * Application Constants
 * 
 * Single source of truth for all constant values used in the portal.
 */

// =============================================================================
// INVOICE CONSTANTS
// =============================================================================

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

// =============================================================================
// PAYMENT CONSTANTS
// =============================================================================

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

// =============================================================================
// CURRENCY CONSTANTS
// =============================================================================

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

// =============================================================================
// CLIENT CONSTANTS
// =============================================================================

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

// =============================================================================
// PROSPECT CONSTANTS (Phase 2)
// =============================================================================

// Prospect pipeline stages
export const PROSPECT_STAGE = {
  IDENTIFIED: 'identified',
  CONTACTED: 'contacted',
  REPLIED: 'replied',
  CALL_SCHEDULED: 'call_scheduled',
  PROPOSAL_SENT: 'proposal_sent',
  NEGOTIATING: 'negotiating',
  WON: 'won',
  LOST: 'lost',
  NO_RESPONSE: 'no_response',
};

export const PROSPECT_STAGE_LABELS = {
  [PROSPECT_STAGE.IDENTIFIED]: 'Identified',
  [PROSPECT_STAGE.CONTACTED]: 'Contacted',
  [PROSPECT_STAGE.REPLIED]: 'Replied',
  [PROSPECT_STAGE.CALL_SCHEDULED]: 'Call Scheduled',
  [PROSPECT_STAGE.PROPOSAL_SENT]: 'Proposal Sent',
  [PROSPECT_STAGE.NEGOTIATING]: 'Negotiating',
  [PROSPECT_STAGE.WON]: 'Won',
  [PROSPECT_STAGE.LOST]: 'Lost',
  [PROSPECT_STAGE.NO_RESPONSE]: 'No Response',
};

// Stage colors for StatusBadge
export const PROSPECT_STAGE_COLORS = {
  [PROSPECT_STAGE.IDENTIFIED]: 'neutral',
  [PROSPECT_STAGE.CONTACTED]: 'info',
  [PROSPECT_STAGE.REPLIED]: 'info',
  [PROSPECT_STAGE.CALL_SCHEDULED]: 'warning',
  [PROSPECT_STAGE.PROPOSAL_SENT]: 'warning',
  [PROSPECT_STAGE.NEGOTIATING]: 'warning',
  [PROSPECT_STAGE.WON]: 'success',
  [PROSPECT_STAGE.LOST]: 'danger',
  [PROSPECT_STAGE.NO_RESPONSE]: 'neutral',
};

// Ordered stages for pipeline progress
export const PROSPECT_STAGE_ORDER = [
  PROSPECT_STAGE.IDENTIFIED,
  PROSPECT_STAGE.CONTACTED,
  PROSPECT_STAGE.REPLIED,
  PROSPECT_STAGE.CALL_SCHEDULED,
  PROSPECT_STAGE.PROPOSAL_SENT,
  PROSPECT_STAGE.NEGOTIATING,
  PROSPECT_STAGE.WON,
];

// Prospect sources
export const PROSPECT_SOURCE = {
  CRAIGSLIST: 'craigslist',
  GOOGLE_MAPS: 'google_maps',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  UPWORK: 'upwork',
  FIVERR: 'fiverr',
  REFERRAL: 'referral',
  WEBSITE: 'website',
  COLD_OUTREACH: 'cold_outreach',
  OTHER: 'other',
};

export const PROSPECT_SOURCE_LABELS = {
  [PROSPECT_SOURCE.CRAIGSLIST]: 'Craigslist',
  [PROSPECT_SOURCE.GOOGLE_MAPS]: 'Google Maps',
  [PROSPECT_SOURCE.INSTAGRAM]: 'Instagram',
  [PROSPECT_SOURCE.LINKEDIN]: 'LinkedIn',
  [PROSPECT_SOURCE.UPWORK]: 'Upwork',
  [PROSPECT_SOURCE.FIVERR]: 'Fiverr',
  [PROSPECT_SOURCE.REFERRAL]: 'Referral',
  [PROSPECT_SOURCE.WEBSITE]: 'Website Inquiry',
  [PROSPECT_SOURCE.COLD_OUTREACH]: 'Cold Outreach',
  [PROSPECT_SOURCE.OTHER]: 'Other',
};

// Prospect activity types
export const PROSPECT_ACTIVITY = {
  NOTE: 'note',
  EMAIL_SENT: 'email_sent',
  EMAIL_RECEIVED: 'email_received',
  CALL: 'call',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  MEETING: 'meeting',
  PROPOSAL: 'proposal',
  STAGE_CHANGE: 'stage_change',
  FOLLOW_UP: 'follow_up',
};

export const PROSPECT_ACTIVITY_LABELS = {
  [PROSPECT_ACTIVITY.NOTE]: 'Note',
  [PROSPECT_ACTIVITY.EMAIL_SENT]: 'Email Sent',
  [PROSPECT_ACTIVITY.EMAIL_RECEIVED]: 'Email Received',
  [PROSPECT_ACTIVITY.CALL]: 'Phone Call',
  [PROSPECT_ACTIVITY.MESSAGE_SENT]: 'Message Sent',
  [PROSPECT_ACTIVITY.MESSAGE_RECEIVED]: 'Message Received',
  [PROSPECT_ACTIVITY.MEETING]: 'Meeting',
  [PROSPECT_ACTIVITY.PROPOSAL]: 'Proposal Sent',
  [PROSPECT_ACTIVITY.STAGE_CHANGE]: 'Stage Change',
  [PROSPECT_ACTIVITY.FOLLOW_UP]: 'Follow-up',
};

export const PROSPECT_ACTIVITY_ICONS = {
  [PROSPECT_ACTIVITY.NOTE]: '📝',
  [PROSPECT_ACTIVITY.EMAIL_SENT]: '📤',
  [PROSPECT_ACTIVITY.EMAIL_RECEIVED]: '📥',
  [PROSPECT_ACTIVITY.CALL]: '📞',
  [PROSPECT_ACTIVITY.MESSAGE_SENT]: '💬',
  [PROSPECT_ACTIVITY.MESSAGE_RECEIVED]: '💬',
  [PROSPECT_ACTIVITY.MEETING]: '🤝',
  [PROSPECT_ACTIVITY.PROPOSAL]: '📄',
  [PROSPECT_ACTIVITY.STAGE_CHANGE]: '📊',
  [PROSPECT_ACTIVITY.FOLLOW_UP]: '🔔',
};

// =============================================================================
// EMAIL TEMPLATE CONSTANTS (ADD TO YOUR constants.js)
// =============================================================================

export const EMAIL_TEMPLATE_TYPE = {
  INITIAL_OUTREACH: 'initial_outreach',
  FOLLOW_UP_1: 'follow_up_1',
  FOLLOW_UP_2: 'follow_up_2',
  FOLLOW_UP_3: 'follow_up_3',
  PROPOSAL: 'proposal',
  CUSTOM: 'custom',
};

export const EMAIL_TEMPLATE_TYPE_LABELS = {
  initial_outreach: 'Initial Outreach',
  follow_up_1: 'Follow-up #1',
  follow_up_2: 'Follow-up #2',
  follow_up_3: 'Follow-up #3 (Breakup)',
  proposal: 'Proposal',
  custom: 'Custom Email',
};

// Stage that each template type advances to (used by useSendProspectEmail)
export const EMAIL_TEMPLATE_STAGE_MAP = {
  initial_outreach: 'contacted',
  follow_up_1: 'contacted',
  follow_up_2: 'contacted',
  follow_up_3: 'no_response',
  proposal: 'proposal_sent',
  custom: null,
};

// Project types for prospects
export const PROJECT_TYPE = {
  WEBSITE: 'website',
  WEBSITE_REDESIGN: 'website_redesign',
  ECOMMERCE: 'ecommerce',
  WEB_APP: 'web_app',
  MOBILE_APP: 'mobile_app',
  LANDING_PAGE: 'landing_page',
  MAINTENANCE: 'maintenance',
  CONSULTING: 'consulting',
  OTHER: 'other',
};

export const PROJECT_TYPE_LABELS = {
  [PROJECT_TYPE.WEBSITE]: 'Website',
  [PROJECT_TYPE.WEBSITE_REDESIGN]: 'Website Redesign',
  [PROJECT_TYPE.ECOMMERCE]: 'E-commerce Store',
  [PROJECT_TYPE.WEB_APP]: 'Web Application',
  [PROJECT_TYPE.MOBILE_APP]: 'Mobile App',
  [PROJECT_TYPE.LANDING_PAGE]: 'Landing Page',
  [PROJECT_TYPE.MAINTENANCE]: 'Maintenance/Updates',
  [PROJECT_TYPE.CONSULTING]: 'Consulting',
  [PROJECT_TYPE.OTHER]: 'Other',
};

// =============================================================================
// COMPANY INFORMATION
// =============================================================================

export const COMPANY_INFO = {
  name: 'The Brick Dev Studios',
  email: 'hello@thebrickdev.com',
  phone: '+2348162438553',
  website: 'https://thebrickdev.com',
  address: 'Lagos, Nigeria',
};

// =============================================================================
// VISA TARGET (D8 Reference)
// =============================================================================

export const VISA_TARGET = {
  monthlyEUR: 3480,
  savingsEUR: 15660,
};