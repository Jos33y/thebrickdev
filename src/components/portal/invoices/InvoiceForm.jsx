/**
 * InvoiceForm - Form for creating/editing invoices
 * 
 * Now integrates with Settings for defaults:
 * - default_currency
 * - default_payment_terms  
 * - invoice_notes_template
 */

import { useState, useEffect, useMemo } from 'react';
import { Button, Input, Select, TextArea, DatePicker, Card } from '../common';
import { PlusIcon, TrashIcon } from '../../common/Icons';
import { useClients } from '../../../hooks/useClients';
import { useSettings } from '../../../hooks/useSettings';
import {
  PAYMENT_TERMS,
  PAYMENT_TERMS_LABELS,
  PAYMENT_TERMS_DAYS,
  CURRENCIES,
} from '../../../lib/constants';
import { formatCurrency } from '../../../lib/formatters';

// Default empty line item
const emptyLineItem = {
  description: '',
  quantity: 1,
  unit_price: '',
};

// Payment terms options
const paymentTermsOptions = Object.entries(PAYMENT_TERMS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// Currency options
const currencyOptions = Object.keys(CURRENCIES).map((code) => ({
  value: code,
  label: code,
}));

/**
 * Calculate due date from issue date and payment terms
 */
const calculateDueDate = (issueDate, paymentTerms) => {
  if (!issueDate) return '';
  const days = PAYMENT_TERMS_DAYS[paymentTerms] || 0;
  const date = new Date(issueDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Format today's date as YYYY-MM-DD
 */
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const InvoiceForm = ({
  initialData = null,
  preselectedClientId = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = !!initialData;

  // Fetch clients for dropdown
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  
  // Fetch settings for defaults
  const { data: settings } = useSettings();

  // Get defaults from settings (with fallbacks)
  const defaultCurrency = settings?.default_currency || 'USD';
  const defaultPaymentTerms = settings?.default_payment_terms || PAYMENT_TERMS.NET_30;
  const defaultNotes = settings?.invoice_notes_template || '';

  // Form state - initialized with settings defaults
  const [formData, setFormData] = useState({
    client_id: preselectedClientId || '',
    issue_date: getTodayDate(),
    payment_terms: defaultPaymentTerms,
    due_date: calculateDueDate(getTodayDate(), defaultPaymentTerms),
    currency: defaultCurrency,
    tax_rate: 0,
    notes: defaultNotes,
  });

  const [items, setItems] = useState([{ ...emptyLineItem }]);
  const [errors, setErrors] = useState({});
  const [settingsApplied, setSettingsApplied] = useState(false);

  // Apply settings defaults when they load (only for new invoices)
  useEffect(() => {
    if (settings && !isEditing && !settingsApplied) {
      setFormData(prev => ({
        ...prev,
        currency: settings.default_currency || prev.currency,
        payment_terms: settings.default_payment_terms || prev.payment_terms,
        notes: settings.invoice_notes_template || prev.notes,
        due_date: calculateDueDate(prev.issue_date, settings.default_payment_terms || prev.payment_terms),
      }));
      setSettingsApplied(true);
    }
  }, [settings, isEditing, settingsApplied]);

  // Initialize form with existing data (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        client_id: initialData.client_id || '',
        issue_date: initialData.issue_date || getTodayDate(),
        payment_terms: initialData.payment_terms || PAYMENT_TERMS.NET_30,
        due_date: initialData.due_date || '',
        currency: initialData.currency || 'USD',
        tax_rate: initialData.tax_rate || 0,
        notes: initialData.notes || '',
      });

      if (initialData.items && initialData.items.length > 0) {
        setItems(initialData.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })));
      }
    }
  }, [initialData]);

  // Update due date when issue date or payment terms change
  useEffect(() => {
    if (formData.issue_date && formData.payment_terms && !isEditing) {
      const newDueDate = calculateDueDate(formData.issue_date, formData.payment_terms);
      setFormData(prev => ({ ...prev, due_date: newDueDate }));
    }
  }, [formData.issue_date, formData.payment_terms, isEditing]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
      return sum + amount;
    }, 0);

    const taxRate = parseFloat(formData.tax_rate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  }, [items, formData.tax_rate]);

  // Client options for select
  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.company ? `${client.name} (${client.company})` : client.name,
  }));

  // Handle form field change
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle line item change
  const handleItemChange = (index, field) => (e) => {
    const value = e.target.value;
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: null }));
    }
  };

  // Add line item
  const addItem = () => {
    setItems(prev => [...prev, { ...emptyLineItem }]);
  };

  // Remove line item
  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.client_id) {
      newErrors.client_id = 'Please select a client';
    }

    if (!formData.issue_date) {
      newErrors.issue_date = 'Issue date is required';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    // Validate items - at least one valid item
    const validItems = items.filter(item => 
      item.description.trim() && 
      parseFloat(item.quantity) > 0 && 
      parseFloat(item.unit_price) >= 0
    );

    if (validItems.length === 0) {
      newErrors.items = 'At least one line item with description and quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Filter valid items and format data
    const validItems = items
      .filter(item => item.description.trim())
      .map(item => ({
        description: item.description.trim(),
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
      }));

    const submitData = {
      ...formData,
      client_id: formData.client_id || null,
      tax_rate: parseFloat(formData.tax_rate) || 0,
      notes: formData.notes.trim() || null,
      items: validItems,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="invoice-form">
      {/* Client & Dates Section */}
      <Card title="Invoice Details" padding="md">
        <div className="invoice-form__grid">
          {/* Client */}
          <div className="invoice-form__field invoice-form__field--full">
            <Select
              label="Client"
              placeholder={clientsLoading ? 'Loading clients...' : 'Select a client'}
              options={clientOptions}
              value={formData.client_id}
              onChange={handleChange('client_id')}
              error={errors.client_id}
              required
              disabled={clientsLoading}
            />
          </div>

          {/* Issue Date */}
          <DatePicker
            label="Issue Date"
            value={formData.issue_date}
            onChange={handleChange('issue_date')}
            error={errors.issue_date}
            required
          />

          {/* Payment Terms */}
          <Select
            label="Payment Terms"
            options={paymentTermsOptions}
            value={formData.payment_terms}
            onChange={handleChange('payment_terms')}
          />

          {/* Due Date */}
          <DatePicker
            label="Due Date"
            value={formData.due_date}
            onChange={handleChange('due_date')}
            error={errors.due_date}
            required
          />

          {/* Currency */}
          <Select
            label="Currency"
            options={currencyOptions}
            value={formData.currency}
            onChange={handleChange('currency')}
          />
        </div>
      </Card>

      {/* Line Items Section */}
      <Card title="Line Items" padding="md">
        {errors.items && (
          <p className="invoice-form__error">{errors.items}</p>
        )}

        <div className="invoice-form__items">
          {/* Header */}
          <div className="invoice-form__items-header">
            <span className="invoice-form__items-col invoice-form__items-col--desc">Description</span>
            <span className="invoice-form__items-col invoice-form__items-col--qty">Qty</span>
            <span className="invoice-form__items-col invoice-form__items-col--price">Unit Price</span>
            <span className="invoice-form__items-col invoice-form__items-col--amount">Amount</span>
            <span className="invoice-form__items-col invoice-form__items-col--action"></span>
          </div>

          {/* Items */}
          {items.map((item, index) => {
            const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
            return (
              <div key={index} className="invoice-form__item-row">
                <div className="invoice-form__items-col invoice-form__items-col--desc">
                  <Input
                    placeholder="Service description"
                    value={item.description}
                    onChange={handleItemChange(index, 'description')}
                  />
                </div>
                <div className="invoice-form__items-col invoice-form__items-col--qty">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1"
                    value={item.quantity}
                    onChange={handleItemChange(index, 'quantity')}
                  />
                </div>
                <div className="invoice-form__items-col invoice-form__items-col--price">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.unit_price}
                    onChange={handleItemChange(index, 'unit_price')}
                  />
                </div>
                <div className="invoice-form__items-col invoice-form__items-col--amount">
                  <span className="invoice-form__amount">
                    {formatCurrency(amount, formData.currency)}
                  </span>
                </div>
                <div className="invoice-form__items-col invoice-form__items-col--action">
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      aria-label="Remove item"
                    >
                      <TrashIcon size={16} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Item Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={PlusIcon}
            onClick={addItem}
            className="invoice-form__add-item"
          >
            Add Line Item
          </Button>
        </div>

        {/* Totals */}
        <div className="invoice-form__totals">
          <div className="invoice-form__totals-row">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal, formData.currency)}</span>
          </div>

          <div className="invoice-form__totals-row invoice-form__totals-row--tax">
            <div className="invoice-form__tax-input">
              <span>Tax</span>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.tax_rate}
                onChange={handleChange('tax_rate')}
                className="invoice-form__tax-field"
              />
              <span>%</span>
            </div>
            <span>{formatCurrency(totals.taxAmount, formData.currency)}</span>
          </div>

          <div className="invoice-form__totals-row invoice-form__totals-row--total">
            <span>Total</span>
            <span>{formatCurrency(totals.total, formData.currency)}</span>
          </div>
        </div>
      </Card>

      {/* Notes Section */}
      <Card title="Notes" padding="md">
        <TextArea
          placeholder="Additional notes for the client (payment instructions, thank you message, etc.)"
          rows={3}
          value={formData.notes}
          onChange={handleChange('notes')}
        />
      </Card>

      {/* Actions */}
      <div className="invoice-form__actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
        >
          {isEditing ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;