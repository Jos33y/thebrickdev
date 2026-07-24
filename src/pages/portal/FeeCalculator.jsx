/**
 * FeeCalculator - Standalone fee calculation tool
 *
 * Helps price quotes with payment fees absorbed:
 * - Merchant-pays mode: gross up your quote to net the target after fees
 * - Customer-pays mode: see what client pays at checkout and your VAT drag
 *
 * Rates fetched from fee_rates table. Configure new rates by inserting
 * rows there (no code change needed).
 */

import { useState, useMemo, useEffect } from 'react';
import {
  PageHeader,
  Card,
  Input,
  Select,
  LoadingState,
} from '../../components/portal/common';
import { SettingsIcon, InvoiceIcon, DashboardIcon } from '../../components/common/Icons';
import { useFeeRates } from '../../hooks/useFeeRates';
import { formatCurrency } from '../../lib/formatters';
import {
  FEE_MODES,
  FEE_MODE_LABELS,
  METHOD_LABELS,
  PROVIDER_LABELS,
  calculateFee,
  calculateReferenceTable,
  findRate,
  getAvailableMethods,
  getAvailableCurrencies,
  getAvailableProviders,
} from '../../lib/feeCalculator';

// Note: CalculatorIcon and PercentIcon aren't in Icons.jsx yet.
// Using SettingsIcon and InvoiceIcon as placeholders. Swap when Icons.jsx updates.
const CalculatorIcon = SettingsIcon;
const PercentIcon = InvoiceIcon;
const TableIcon = DashboardIcon;

const FeeCalculator = () => {
  const { data: rates, isLoading, error } = useFeeRates();

  // Configuration state
  const [provider, setProvider] = useState('flutterwave');
  const [currency, setCurrency] = useState('GBP');
  const [paymentMethod, setPaymentMethod] = useState('card_international');
  const [feeMode, setFeeMode] = useState(FEE_MODES.MERCHANT_PAYS);
  const [targetNet, setTargetNet] = useState('');

  // Derive available options from loaded rates
  const availableProviders = useMemo(() => getAvailableProviders(rates), [rates]);
  const availableCurrencies = useMemo(
    () => getAvailableCurrencies(rates, provider),
    [rates, provider]
  );
  const availableMethods = useMemo(
    () => getAvailableMethods(rates, provider, currency),
    [rates, provider, currency]
  );

  // Auto-correct payment method if it's not available for current provider+currency
  useEffect(() => {
    if (availableMethods.length > 0 && !availableMethods.includes(paymentMethod)) {
      setPaymentMethod(availableMethods[0]);
    }
  }, [availableMethods, paymentMethod]);

  // Auto-correct currency if not available for provider
  useEffect(() => {
    if (availableCurrencies.length > 0 && !availableCurrencies.includes(currency)) {
      setCurrency(availableCurrencies[0]);
    }
  }, [availableCurrencies, currency]);

  // Find the active rate
  const activeRate = useMemo(
    () => findRate(rates, { provider, currency, payment_method: paymentMethod }),
    [rates, provider, currency, paymentMethod]
  );

  // Calculate for the entered target
  const calculation = useMemo(() => {
    const target = parseFloat(targetNet);
    if (!target || target <= 0) return null;
    return calculateFee({ targetNet: target, rate: activeRate, feeMode });
  }, [targetNet, activeRate, feeMode]);

  // Reference table calculations
  const referenceTable = useMemo(
    () => calculateReferenceTable({ rate: activeRate, feeMode }),
    [activeRate, feeMode]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="portal-page fee-calc">
        <LoadingState text="Loading fee rates..." />
      </div>
    );
  }

  // Error state
  if (error || !rates || rates.length === 0) {
    return (
      <div className="portal-page fee-calc">
        <PageHeader title="Fee Calculator" subtitle="Payment fee calculations" />
        <Card padding="md">
          <p className="fee-calc__empty">
            No fee rates configured. Run the fee_rates schema migration to seed rates.
          </p>
        </Card>
      </div>
    );
  }

  // Build dropdown options
  const providerOptions = availableProviders.map((p) => ({
    value: p,
    label: PROVIDER_LABELS[p] || p,
  }));
  const currencyOptions = availableCurrencies.map((c) => ({
    value: c,
    label: c,
  }));
  const methodOptions = availableMethods.map((m) => ({
    value: m,
    label: METHOD_LABELS[m] || m,
  }));

  return (
    <div className="portal-page fee-calc">
      <PageHeader
        title="Fee Calculator"
        subtitle="Quote clients with payment fees absorbed"
      />

      <div className="fee-calc__grid">
        {/* ============================================================
             CONFIGURATION
             ============================================================ */}
        <Card
          title="Configuration"
          subtitle="Choose the payment context you're pricing for"
          icon={SettingsIcon}
          padding="md"
        >
          <div className="fee-calc__config">
            <div className="fee-calc__config-grid">
              <Select
                label="Provider"
                options={providerOptions}
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
              <Select
                label="Currency"
                options={currencyOptions}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <Select
                label="Payment Method"
                options={methodOptions}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div>

            {/* Fee mode toggle */}
            <div className="fee-calc__mode">
              <label className="fee-calc__mode-label">Fee Mode</label>
              <div className="fee-calc__mode-buttons">
                <button
                  type="button"
                  className={`fee-calc__mode-btn ${
                    feeMode === FEE_MODES.MERCHANT_PAYS ? 'fee-calc__mode-btn--active' : ''
                  }`}
                  onClick={() => setFeeMode(FEE_MODES.MERCHANT_PAYS)}
                >
                  Merchant pays
                </button>
                <button
                  type="button"
                  className={`fee-calc__mode-btn ${
                    feeMode === FEE_MODES.CUSTOMER_PAYS ? 'fee-calc__mode-btn--active' : ''
                  }`}
                  onClick={() => setFeeMode(FEE_MODES.CUSTOMER_PAYS)}
                >
                  Customer pays
                </button>
              </div>
              <p className="fee-calc__mode-hint">
                {feeMode === FEE_MODES.MERCHANT_PAYS
                  ? 'You absorb the fee. Client pays the invoice amount flat. Quote is grossed-up to net your target.'
                  : 'Client pays fee on top at checkout. You still pay VAT on the fee (small drag).'}
              </p>
            </div>

            {/* Active rate summary */}
            {activeRate && (
              <div className="fee-calc__rate-summary">
                <div className="fee-calc__rate-summary-row">
                  <span className="fee-calc__rate-label">Fee</span>
                  <span className="fee-calc__rate-value">
                    {activeRate.fee_percentage}%
                    {activeRate.fee_fixed > 0 &&
                      ` + ${formatCurrency(activeRate.fee_fixed, currency)}`}
                  </span>
                </div>
                <div className="fee-calc__rate-summary-row">
                  <span className="fee-calc__rate-label">VAT on fee</span>
                  <span className="fee-calc__rate-value">{activeRate.vat_percentage}%</span>
                </div>
                <div className="fee-calc__rate-summary-row">
                  <span className="fee-calc__rate-label">Effective from</span>
                  <span className="fee-calc__rate-value">{activeRate.effective_from}</span>
                </div>
                {activeRate.notes && (
                  <div className="fee-calc__rate-note">{activeRate.notes}</div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* ============================================================
             SINGLE CALCULATION
             ============================================================ */}
        <Card
          title="Calculate a Quote"
          subtitle="Type what you want to net, get your recommended quote"
          icon={PercentIcon}
          padding="md"
        >
          <div className="fee-calc__single">
            <div className="fee-calc__target">
              <Input
                label={`Target Net Amount (${currency})`}
                type="number"
                min="0"
                step="0.01"
                value={targetNet}
                onChange={(e) => setTargetNet(e.target.value)}
                placeholder="e.g. 170"
                hint={
                  feeMode === FEE_MODES.MERCHANT_PAYS
                    ? 'What you want to net after Flutterwave takes their cut'
                    : 'What you want to net after VAT drag (client covers the fee)'
                }
              />
            </div>

            {calculation && (
              <div className="fee-calc__result">
                {/* Headline: recommended quote */}
                <div className="fee-calc__result-headline">
                  <span className="fee-calc__result-headline-label">Quote client</span>
                  <span className="fee-calc__result-headline-amount">
                    {formatCurrency(calculation.recommendedQuote, currency)}
                  </span>
                </div>

                {/* Breakdown table */}
                <div className="fee-calc__breakdown">
                  <div className="fee-calc__breakdown-row">
                    <span className="fee-calc__breakdown-label">Invoice amount</span>
                    <span className="fee-calc__breakdown-value">
                      {formatCurrency(calculation.recommendedQuote, currency)}
                    </span>
                  </div>
                  <div className="fee-calc__breakdown-row">
                    <span className="fee-calc__breakdown-label">
                      Client pays at checkout
                    </span>
                    <span className="fee-calc__breakdown-value">
                      {formatCurrency(calculation.clientPays, currency)}
                    </span>
                  </div>
                  <div className="fee-calc__breakdown-row fee-calc__breakdown-row--negative">
                    <span className="fee-calc__breakdown-label">
                      Provider fee ({activeRate.fee_percentage}%)
                    </span>
                    <span className="fee-calc__breakdown-value">
                      −{formatCurrency(calculation.feeTaken, currency)}
                    </span>
                  </div>
                  <div className="fee-calc__breakdown-row fee-calc__breakdown-row--negative">
                    <span className="fee-calc__breakdown-label">
                      VAT on fee ({activeRate.vat_percentage}%)
                    </span>
                    <span className="fee-calc__breakdown-value">
                      −{formatCurrency(calculation.vatTaken, currency)}
                    </span>
                  </div>
                  <div className="fee-calc__breakdown-row fee-calc__breakdown-row--total">
                    <span className="fee-calc__breakdown-label">You receive</span>
                    <span className="fee-calc__breakdown-value">
                      {formatCurrency(calculation.youReceive, currency)}
                    </span>
                  </div>
                  <div className="fee-calc__breakdown-row fee-calc__breakdown-row--buffer">
                    <span className="fee-calc__breakdown-label">Buffer above target</span>
                    <span className="fee-calc__breakdown-value">
                      +{formatCurrency(calculation.buffer, currency)}
                    </span>
                  </div>
                </div>

                {/* Effective rate summary */}
                <div className="fee-calc__effective">
                  <span className="fee-calc__effective-label">
                    Effective cost to you
                  </span>
                  <span className="fee-calc__effective-value">
                    {calculation.effectiveRate}% of quote
                  </span>
                </div>
              </div>
            )}

            {!calculation && (
              <div className="fee-calc__placeholder">
                Enter a target amount above to see the recommended quote
              </div>
            )}
          </div>
        </Card>

        {/* ============================================================
             QUICK REFERENCE TABLE
             ============================================================ */}
        <Card
          title="Quick Reference"
          subtitle={`Pre-calculated quotes for common amounts (${currency}, ${
            feeMode === FEE_MODES.MERCHANT_PAYS ? 'merchant-pays' : 'customer-pays'
          })`}
          icon={TableIcon}
          padding="md"
        >
          {activeRate ? (
            <div className="fee-calc__table-wrap">
              <table className="fee-calc__table">
                <thead>
                  <tr>
                    <th>Target Net</th>
                    <th>Quote to Client</th>
                    <th>Client Pays</th>
                    <th>Fee + VAT</th>
                    <th>You Receive</th>
                    <th>Buffer</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceTable.map((calc) => (
                    <tr key={calc.targetNet}>
                      <td className="fee-calc__table-target">
                        {formatCurrency(calc.targetNet, currency)}
                      </td>
                      <td className="fee-calc__table-quote">
                        {formatCurrency(calc.recommendedQuote, currency)}
                      </td>
                      <td>{formatCurrency(calc.clientPays, currency)}</td>
                      <td className="fee-calc__table-fee">
                        −{formatCurrency(calc.totalCost, currency)}
                      </td>
                      <td>{formatCurrency(calc.youReceive, currency)}</td>
                      <td className="fee-calc__table-buffer">
                        +{formatCurrency(calc.buffer, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="fee-calc__empty">
              No rate configured for {provider} / {currency} / {METHOD_LABELS[paymentMethod] || paymentMethod}.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FeeCalculator;
