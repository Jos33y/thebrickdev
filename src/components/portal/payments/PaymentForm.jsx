/**
 * PaymentForm - Simple form for recording payments
 * 
 * Follows the working pattern from InvoiceForm/ClientForm.
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Select, TextArea } from '../common';
import { useInvoices } from '../../../hooks/useInvoices';
import { formatCurrency } from '../../../lib/formatters';

// Payment types matching database
const PAYMENT_TYPES = [
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'platform', label: 'Platform (Grey/Payoneer/Wise)' },
  { value: 'crypto', label: 'Cryptocurrency' },
];

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'cleared', label: 'Cleared' },
  { value: 'failed', label: 'Failed' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'NGN', label: 'NGN' },
  { value: 'CAD', label: 'CAD' },
];

const PLATFORMS = [
  { value: 'grey', label: 'Grey' },
  { value: 'payoneer', label: 'Payoneer' },
  { value: 'wise', label: 'Wise' },
  { value: 'other', label: 'Other' },
];

const CRYPTO_TYPES = [
  { value: 'USDT', label: 'USDT' },
  { value: 'USDC', label: 'USDC' },
  { value: 'BTC', label: 'BTC' },
  { value: 'ETH', label: 'ETH' },
  { value: 'other', label: 'Other' },
];

const CRYPTO_NETWORKS = [
  { value: 'TRC20', label: 'TRC20' },
  { value: 'ERC20', label: 'ERC20' },
  { value: 'BEP20', label: 'BEP20' },
  { value: 'Bitcoin', label: 'Bitcoin' },
  { value: 'other', label: 'Other' },
];

const getTodayDate = () => new Date().toISOString().split('T')[0];

const PaymentForm = ({
  initialData = null,
  preselectedInvoiceId = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = !!initialData;
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();

  // Main form state
  const [formData, setFormData] = useState({
    invoice_id: preselectedInvoiceId || '',
    payment_type: 'bank',
    amount_received: '',
    currency_received: 'USD',
    received_date: getTodayDate(),
    status: 'cleared',
    cleared_date: '',
    notes: '',
  });

  // Bank details
  const [bankName, setBankName] = useState('');
  const [accountRef, setAccountRef] = useState('');
  const [transferRef, setTransferRef] = useState('');

  // Platform details
  const [platform, setPlatform] = useState('grey');
  const [platformTxRef, setPlatformTxRef] = useState('');
  const [platformUsdAmount, setPlatformUsdAmount] = useState('');
  const [platformRate, setPlatformRate] = useState('');
  const [platformNgnAmount, setPlatformNgnAmount] = useState('');
  const [depositBank, setDepositBank] = useState('');
  const [depositDate, setDepositDate] = useState('');
  const [depositRef, setDepositRef] = useState('');

  // Crypto details
  const [cryptoType, setCryptoType] = useState('USDT');
  const [cryptoNetwork, setCryptoNetwork] = useState('TRC20');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');

  const [error, setError] = useState('');

  // Initialize with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        invoice_id: initialData.invoice_id || '',
        payment_type: initialData.payment_type || 'bank',
        amount_received: initialData.amount_received?.toString() || '',
        currency_received: initialData.currency_received || 'USD',
        received_date: initialData.received_date || getTodayDate(),
        status: initialData.status || 'cleared',
        cleared_date: initialData.cleared_date || '',
        notes: initialData.notes || '',
      });

      if (initialData.details) {
        const d = initialData.details;
        if (initialData.payment_type === 'bank') {
          setBankName(d.bank_name || '');
          setAccountRef(d.account_reference || '');
          setTransferRef(d.transfer_reference || '');
        } else if (initialData.payment_type === 'platform') {
          setPlatform(d.platform || 'grey');
          setPlatformTxRef(d.transaction_reference || '');
          setPlatformUsdAmount(d.amount_received_usd?.toString() || '');
          setPlatformRate(d.conversion_rate?.toString() || '');
          setPlatformNgnAmount(d.amount_ngn?.toString() || '');
          setDepositBank(d.deposit_bank || '');
          setDepositDate(d.deposit_date || '');
          setDepositRef(d.deposit_reference || '');
        } else if (initialData.payment_type === 'crypto') {
          setCryptoType(d.crypto_type || 'USDT');
          setCryptoNetwork(d.network || 'TRC20');
          setCryptoAmount(d.amount_crypto?.toString() || '');
          setWalletAddress(d.wallet_address || '');
          setTxHash(d.transaction_hash || '');
          setDepositBank(d.deposit_bank || '');
          setDepositDate(d.deposit_date || '');
          setDepositRef(d.deposit_reference || '');
        }
      }
    }
  }, [initialData]);

  // Update currency when invoice selected
  useEffect(() => {
    if (formData.invoice_id && !isEditing) {
      const inv = invoices.find(i => i.id === formData.invoice_id);
      if (inv) {
        setFormData(prev => ({ ...prev, currency_received: inv.currency }));
      }
    }
  }, [formData.invoice_id, invoices, isEditing]);

  // Selected invoice for display
  const selectedInvoice = useMemo(() => {
    return invoices.find(i => i.id === formData.invoice_id);
  }, [invoices, formData.invoice_id]);

  // Invoice options
  const invoiceOptions = useMemo(() => {
    return invoices
      .filter(inv => inv.status !== 'draft')
      .map(inv => ({
        value: inv.id,
        label: `${inv.invoice_number} - ${inv.client?.name || 'No client'} (${formatCurrency(inv.total, inv.currency)})`,
      }));
  }, [invoices]);

  // Handle main form change
  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Validate
  const validate = () => {
    if (!formData.invoice_id) {
      setError('Please select an invoice');
      return false;
    }
    if (!formData.amount_received || parseFloat(formData.amount_received) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (!formData.received_date) {
      setError('Please enter the received date');
      return false;
    }
    
    // Type-specific validation
    if (formData.payment_type === 'bank' && !bankName.trim()) {
      setError('Please enter the bank name');
      return false;
    }
    if (formData.payment_type === 'crypto' && !cryptoAmount) {
      setError('Please enter the crypto amount');
      return false;
    }

    setError('');
    return true;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Build details based on type
    let details = null;

    if (formData.payment_type === 'bank') {
      details = {
        bank_name: bankName.trim(),
        account_reference: accountRef.trim() || null,
        transfer_reference: transferRef.trim() || null,
      };
    } else if (formData.payment_type === 'platform') {
      details = {
        platform: platform,
        transaction_reference: platformTxRef.trim() || null,
        amount_received_usd: platformUsdAmount ? parseFloat(platformUsdAmount) : null,
        conversion_rate: platformRate ? parseFloat(platformRate) : null,
        amount_ngn: platformNgnAmount ? parseFloat(platformNgnAmount) : null,
        deposit_bank: depositBank.trim() || null,
        deposit_date: depositDate || null,
        deposit_reference: depositRef.trim() || null,
      };
    } else if (formData.payment_type === 'crypto') {
      details = {
        crypto_type: cryptoType,
        network: cryptoNetwork || null,
        amount_crypto: parseFloat(cryptoAmount),
        wallet_address: walletAddress.trim() || null,
        transaction_hash: txHash.trim() || null,
        deposit_bank: depositBank.trim() || null,
        deposit_date: depositDate || null,
        deposit_reference: depositRef.trim() || null,
      };
    }

    const submitData = {
      invoice_id: formData.invoice_id,
      payment_type: formData.payment_type,
      amount_received: parseFloat(formData.amount_received),
      currency_received: formData.currency_received,
      received_date: formData.received_date,
      status: formData.status,
      cleared_date: formData.cleared_date || null,
      notes: formData.notes.trim() || null,
      details,
    };

    console.log('Submitting payment:', submitData);
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      {error && <div className="form-error">{error}</div>}

      {/* Invoice */}
      <Card title="Invoice" padding="md">
        <Select
          label="Invoice"
          placeholder={invoicesLoading ? 'Loading...' : 'Select invoice'}
          options={invoiceOptions}
          value={formData.invoice_id}
          onChange={handleChange('invoice_id')}
          required
          disabled={invoicesLoading}
        />
        {selectedInvoice && (
          <p className="form-hint" style={{ marginTop: '0.5rem' }}>
            Invoice Total: {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
          </p>
        )}
      </Card>

      {/* Payment Info */}
      <Card title="Payment Details" padding="md">
        <div className="form-grid">
          <Input
            label="Amount Received"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount_received}
            onChange={handleChange('amount_received')}
            required
          />
          <Select
            label="Currency"
            options={CURRENCIES}
            value={formData.currency_received}
            onChange={handleChange('currency_received')}
          />
          <Input
            label="Date Received"
            type="date"
            value={formData.received_date}
            onChange={handleChange('received_date')}
            required
          />
          <Select
            label="Status"
            options={PAYMENT_STATUSES}
            value={formData.status}
            onChange={handleChange('status')}
          />
        </div>
      </Card>

      {/* Payment Type */}
      <Card title="Payment Method" padding="md">
        <Select
          label="Payment Type"
          options={PAYMENT_TYPES}
          value={formData.payment_type}
          onChange={handleChange('payment_type')}
        />

        {/* Bank Details */}
        {formData.payment_type === 'bank' && (
          <div className="form-section">
            <div className="form-grid">
              <Input
                label="Bank Name"
                placeholder="e.g., Wise, GTBank, Chase"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
              <Input
                label="Account Reference"
                placeholder="Your account reference"
                value={accountRef}
                onChange={(e) => setAccountRef(e.target.value)}
              />
              <Input
                label="Transfer Reference"
                placeholder="Transfer reference number"
                value={transferRef}
                onChange={(e) => setTransferRef(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Platform Details */}
        {formData.payment_type === 'platform' && (
          <div className="form-section">
            <div className="form-grid">
              <Select
                label="Platform"
                options={PLATFORMS}
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              />
              <Input
                label="Transaction Reference"
                placeholder="Platform transaction ID"
                value={platformTxRef}
                onChange={(e) => setPlatformTxRef(e.target.value)}
              />
              <Input
                label="Amount (USD)"
                type="number"
                min="0"
                step="0.01"
                value={platformUsdAmount}
                onChange={(e) => setPlatformUsdAmount(e.target.value)}
              />
              <Input
                label="Conversion Rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 1550"
                value={platformRate}
                onChange={(e) => setPlatformRate(e.target.value)}
              />
              <Input
                label="Amount (NGN)"
                type="number"
                min="0"
                step="0.01"
                value={platformNgnAmount}
                onChange={(e) => setPlatformNgnAmount(e.target.value)}
              />
              <Input
                label="Deposit Bank"
                placeholder="e.g., Kuda, GTBank"
                value={depositBank}
                onChange={(e) => setDepositBank(e.target.value)}
              />
              <Input
                label="Deposit Date"
                type="date"
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
              />
              <Input
                label="Deposit Reference"
                value={depositRef}
                onChange={(e) => setDepositRef(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Crypto Details */}
        {formData.payment_type === 'crypto' && (
          <div className="form-section">
            <div className="form-grid">
              <Select
                label="Crypto Type"
                options={CRYPTO_TYPES}
                value={cryptoType}
                onChange={(e) => setCryptoType(e.target.value)}
              />
              <Select
                label="Network"
                options={CRYPTO_NETWORKS}
                value={cryptoNetwork}
                onChange={(e) => setCryptoNetwork(e.target.value)}
              />
              <Input
                label="Crypto Amount"
                type="number"
                min="0"
                step="0.00000001"
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
                required
              />
              <Input
                label="Wallet Address"
                placeholder="Receiving wallet"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
              <Input
                label="Transaction Hash"
                placeholder="Blockchain tx hash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
              />
              <Input
                label="Deposit Bank"
                placeholder="e.g., Kuda, GTBank"
                value={depositBank}
                onChange={(e) => setDepositBank(e.target.value)}
              />
              <Input
                label="Deposit Date"
                type="date"
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
              />
              <Input
                label="Deposit Reference"
                value={depositRef}
                onChange={(e) => setDepositRef(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Notes */}
      <Card title="Notes" padding="md">
        <TextArea
          placeholder="Additional notes..."
          rows={3}
          value={formData.notes}
          onChange={handleChange('notes')}
        />
      </Card>

      {/* Actions */}
      <div className="form-actions">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isEditing ? 'Update Payment' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;