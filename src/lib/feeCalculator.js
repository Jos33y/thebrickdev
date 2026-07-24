/**
 * Fee Calculator - Pure calculation functions
 *
 * Handles both merchant-pays and customer-pays modes.
 *
 * Merchant-pays: You absorb the fee. Client pays the quote flat.
 *   Formula: quote = target / (1 - fee_rate × (1 + vat_rate))
 *   You pay: fee + VAT on fee
 *
 * Customer-pays: Client pays fee on top. You still pay VAT on the fee.
 *   Formula: quote = target / (1 - fee_rate × vat_rate)  [tiny gross-up for VAT drag]
 *   You pay: only VAT on fee (small)
 */

export const FEE_MODES = {
  MERCHANT_PAYS: 'merchant_pays',
  CUSTOMER_PAYS: 'customer_pays',
};

export const FEE_MODE_LABELS = {
  [FEE_MODES.MERCHANT_PAYS]: 'Merchant pays',
  [FEE_MODES.CUSTOMER_PAYS]: 'Customer pays',
};

/**
 * Round to 2 decimal places.
 */
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Round quote to a "friendly" number based on size.
 * Only meaningful in merchant-pays mode where the gross-up is substantial.
 * Customer-pays uses tighter rounding since the VAT drag is tiny (~0.36%).
 */
export const roundToFriendly = (amount, target, feeMode = FEE_MODES.MERCHANT_PAYS) => {
  if (feeMode === FEE_MODES.CUSTOMER_PAYS) {
    // Customer-pays: tight rounding, VAT drag is negligible
    if (target < 50) return Math.ceil(amount);        // to £1
    if (target < 500) return Math.ceil(amount / 5) * 5;  // to £5
    return Math.ceil(amount / 10) * 10;                  // to £10
  }
  // Merchant-pays: friendlier rounding for clean client-facing quotes
  if (target < 20) return Math.ceil(amount);              // to £1
  if (target < 100) return Math.ceil(amount / 5) * 5;     // to £5
  if (target < 1000) return Math.ceil(amount / 10) * 10;  // to £10
  return Math.ceil(amount / 50) * 50;                     // to £50
};

/**
 * Calculate fees and quote for a target amount.
 *
 * @param {object} params
 * @param {number} params.targetNet - What you want to net after fees
 * @param {object} params.rate - Fee rate row from fee_rates table
 * @param {string} params.feeMode - 'merchant_pays' or 'customer_pays'
 * @returns {object|null} Calculation result or null if invalid input
 */
export const calculateFee = ({ targetNet, rate, feeMode = FEE_MODES.MERCHANT_PAYS }) => {
  if (!rate || !targetNet || targetNet <= 0 || isNaN(targetNet)) {
    return null;
  }

  const feeRate = (rate.fee_percentage || 0) / 100;
  const vatRate = (rate.vat_percentage || 0) / 100;
  const fixedFee = rate.fee_fixed || 0;

  if (feeMode === FEE_MODES.MERCHANT_PAYS) {
    // MERCHANT-PAYS: You absorb everything.
    // quote × (1 - feeRate × (1 + vatRate)) = targetNet + fixedFee_effective
    const burdenRate = feeRate * (1 + vatRate);
    const rawQuote = (targetNet + fixedFee) / (1 - burdenRate);
    const recommendedQuote = roundToFriendly(rawQuote, targetNet, feeMode);

    const feeTaken = recommendedQuote * feeRate + fixedFee;
    const vatTaken = feeTaken * vatRate;
    const totalCost = feeTaken + vatTaken;
    const youReceive = recommendedQuote - totalCost;
    const buffer = youReceive - targetNet;
    const effectiveRate = (totalCost / recommendedQuote) * 100;

    return {
      targetNet,
      feeMode,
      rawQuote: round2(rawQuote),
      recommendedQuote,
      clientPays: recommendedQuote,
      feeTaken: round2(feeTaken),
      vatTaken: round2(vatTaken),
      totalCost: round2(totalCost),
      youReceive: round2(youReceive),
      buffer: round2(buffer),
      effectiveRate: round2(effectiveRate),
      grossUpMultiplier: round2((1 / (1 - burdenRate)) * 10000) / 10000,
    };
  }

  // CUSTOMER-PAYS: Client covers fee at checkout. You still pay VAT on the fee.
  // quote × (1 - feeRate × vatRate) = targetNet
  const vatDragRate = feeRate * vatRate;
  const rawQuote = targetNet / (1 - vatDragRate);
  const recommendedQuote = roundToFriendly(rawQuote, targetNet, feeMode);

  const feeTaken = recommendedQuote * feeRate + fixedFee;
  const vatTaken = feeTaken * vatRate;
  const clientPays = recommendedQuote + feeTaken;
  const youReceive = recommendedQuote - vatTaken;
  const buffer = youReceive - targetNet;
  const effectiveRate = (vatTaken / recommendedQuote) * 100;

  return {
    targetNet,
    feeMode,
    rawQuote: round2(rawQuote),
    recommendedQuote,
    clientPays: round2(clientPays),
    feeTaken: round2(feeTaken),
    vatTaken: round2(vatTaken),
    totalCost: round2(vatTaken),
    youReceive: round2(youReceive),
    buffer: round2(buffer),
    effectiveRate: round2(effectiveRate),
    grossUpMultiplier: round2((1 / (1 - vatDragRate)) * 10000) / 10000,
  };
};

/**
 * Standard reference amounts for the quick reference table.
 * Covers everything from micro-subscriptions to enterprise projects.
 */
export const REFERENCE_AMOUNTS = [
  5, 10, 25, 50, 100, 200, 500, 1000, 1500, 2000, 3000, 5000, 7000,
];

/**
 * Generate calculations for all reference amounts.
 */
export const calculateReferenceTable = ({ rate, feeMode }) => {
  if (!rate) return [];
  return REFERENCE_AMOUNTS
    .map((amount) => calculateFee({ targetNet: amount, rate, feeMode }))
    .filter(Boolean);
};

/**
 * Get available payment methods for a given provider + currency combination.
 * Used to populate the payment method dropdown dynamically.
 */
export const getAvailableMethods = (rates, provider, currency) => {
  if (!rates) return [];
  const methods = rates
    .filter((r) => r.provider === provider && r.currency === currency && r.is_active)
    .map((r) => r.payment_method);
  return [...new Set(methods)];
};

/**
 * Get available currencies for a given provider.
 */
export const getAvailableCurrencies = (rates, provider) => {
  if (!rates) return [];
  const currencies = rates
    .filter((r) => r.provider === provider && r.is_active)
    .map((r) => r.currency);
  return [...new Set(currencies)];
};

/**
 * Get available providers from loaded rates.
 */
export const getAvailableProviders = (rates) => {
  if (!rates) return [];
  const providers = rates.filter((r) => r.is_active).map((r) => r.provider);
  return [...new Set(providers)];
};

/**
 * Find the active rate for provider + currency + method.
 */
export const findRate = (rates, { provider, currency, payment_method }) => {
  if (!rates) return null;
  return rates.find(
    (r) =>
      r.provider === provider &&
      r.currency === currency &&
      r.payment_method === payment_method &&
      r.is_active
  );
};

/**
 * Human-readable label for payment method codes.
 */
export const METHOD_LABELS = {
  card_international: 'Card (international)',
  card_local: 'Card (local)',
  bank_transfer: 'Bank transfer',
  ussd: 'USSD',
  crypto: 'Crypto',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  mobile_money: 'Mobile money',
};

/**
 * Human-readable label for providers.
 */
export const PROVIDER_LABELS = {
  flutterwave: 'Flutterwave',
  raenest: 'Raenest',
  stripe_uk: 'Stripe UK',
  grey: 'Grey',
  paystack: 'Paystack',
};

export default {
  FEE_MODES,
  FEE_MODE_LABELS,
  calculateFee,
  calculateReferenceTable,
  roundToFriendly,
  getAvailableMethods,
  getAvailableCurrencies,
  getAvailableProviders,
  findRate,
  METHOD_LABELS,
  PROVIDER_LABELS,
  REFERENCE_AMOUNTS,
};
