/**
 * Settings - Portal settings page
 * 
 * Sections:
 * - Company Information (for invoice headers)
 * - Invoice Defaults (currency, terms, prefix)
 * - Financial Goals (income target, savings goal, CURRENT SAVINGS)
 * - Account (change password)
 */

import { useState } from 'react';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  TextArea,
  LoadingState,
} from '../../components/portal/common';
import {
  SettingsIcon,
  InvoiceIcon,
  LockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '../../components/common/Icons';
import { useSettings, useUpdateSettings, useChangePassword } from '../../hooks/useSettings';
import { formatCurrency } from '../../lib/formatters';

// Note: BuildingIcon and TargetIcon need to be added to Icons.jsx
const BuildingIcon = SettingsIcon;
const TargetIcon = SettingsIcon;

// Currency options
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

// Payment terms options
const PAYMENT_TERMS_OPTIONS = [
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_7', label: 'Net 7 (7 days)' },
  { value: 'net_15', label: 'Net 15 (15 days)' },
  { value: 'net_30', label: 'Net 30 (30 days)' },
  { value: 'net_60', label: 'Net 60 (60 days)' },
];

const Settings = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const changePassword = useChangePassword();

  // Form states
  const [companyForm, setCompanyForm] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState(null);
  const [goalsForm, setGoalsForm] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Success/error messages
  const [messages, setMessages] = useState({});

  // Initialize forms when settings load
  if (settings && !companyForm) {
    setCompanyForm({
      company_name: settings.company_name || '',
      company_email: settings.company_email || '',
      company_phone: settings.company_phone || '',
      company_address: settings.company_address || '',
      company_city: settings.company_city || '',
      company_country: settings.company_country || '',
      tax_id: settings.tax_id || '',
    });
    setInvoiceForm({
      default_currency: settings.default_currency || 'USD',
      default_payment_terms: settings.default_payment_terms || 'net_15',
      invoice_prefix: settings.invoice_prefix || 'BRK',
      invoice_notes_template: settings.invoice_notes_template || '',
    });
    setGoalsForm({
      monthly_income_target: settings.monthly_income_target || 5000,
      monthly_income_currency: settings.monthly_income_currency || 'USD',
      savings_goal: settings.savings_goal || 20000,
      savings_goal_currency: settings.savings_goal_currency || 'USD',
      current_savings: settings.current_savings || 0, // NEW
      goal_target_date: settings.goal_target_date || '',
    });
  }

  // Handle company info save
  const handleSaveCompany = async () => {
    try {
      await updateSettings.mutateAsync(companyForm);
      setMessages({ ...messages, company: { type: 'success', text: 'Company info saved!' } });
      setTimeout(() => setMessages((m) => ({ ...m, company: null })), 3000);
    } catch (err) {
      setMessages({ ...messages, company: { type: 'error', text: err.message } });
    }
  };

  // Handle invoice defaults save
  const handleSaveInvoice = async () => {
    try {
      await updateSettings.mutateAsync(invoiceForm);
      setMessages({ ...messages, invoice: { type: 'success', text: 'Invoice defaults saved!' } });
      setTimeout(() => setMessages((m) => ({ ...m, invoice: null })), 3000);
    } catch (err) {
      setMessages({ ...messages, invoice: { type: 'error', text: err.message } });
    }
  };

  // Handle goals save
  const handleSaveGoals = async () => {
    try {
      await updateSettings.mutateAsync(goalsForm);
      setMessages({ ...messages, goals: { type: 'success', text: 'Goals saved!' } });
      setTimeout(() => setMessages((m) => ({ ...m, goals: null })), 3000);
    } catch (err) {
      setMessages({ ...messages, goals: { type: 'error', text: err.message } });
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessages({ ...messages, password: { type: 'error', text: 'Passwords do not match' } });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessages({ ...messages, password: { type: 'error', text: 'Password must be at least 8 characters' } });
      return;
    }

    try {
      await changePassword.mutateAsync({ newPassword: passwordForm.newPassword });
      setMessages({ ...messages, password: { type: 'success', text: 'Password changed successfully!' } });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessages((m) => ({ ...m, password: null })), 3000);
    } catch (err) {
      setMessages({ ...messages, password: { type: 'error', text: err.message } });
    }
  };

  // Calculate savings progress
  const savingsProgress = goalsForm?.savings_goal > 0 
    ? Math.min(100, ((goalsForm?.current_savings || 0) / goalsForm.savings_goal) * 100)
    : 0;

  if (isLoading || !companyForm) {
    return (
      <div className="portal-page portal-settings">
        <LoadingState text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="portal-page portal-settings">
      <PageHeader
        title="Settings"
        subtitle="Manage your portal configuration"
      />

      <div className="settings__grid">
        {/* Company Information */}
        <Card
          title="Company Information"
          subtitle="Used on invoice headers"
          icon={BuildingIcon}
          padding="md"
        >
          <div className="settings__form">
            <div className="settings__form-grid">
              <Input
                label="Company Name"
                value={companyForm.company_name}
                onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                placeholder="Your Business Name"
              />
              <Input
                label="Email"
                type="email"
                value={companyForm.company_email}
                onChange={(e) => setCompanyForm({ ...companyForm, company_email: e.target.value })}
                placeholder="hello@example.com"
              />
            </div>

            <div className="settings__form-grid">
              <Input
                label="Phone"
                value={companyForm.company_phone}
                onChange={(e) => setCompanyForm({ ...companyForm, company_phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
              <Input
                label="Tax ID / VAT"
                value={companyForm.tax_id}
                onChange={(e) => setCompanyForm({ ...companyForm, tax_id: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <Input
              label="Address"
              value={companyForm.company_address}
              onChange={(e) => setCompanyForm({ ...companyForm, company_address: e.target.value })}
              placeholder="Street address"
            />

            <div className="settings__form-grid">
              <Input
                label="City"
                value={companyForm.company_city}
                onChange={(e) => setCompanyForm({ ...companyForm, company_city: e.target.value })}
                placeholder="City"
              />
              <Input
                label="Country"
                value={companyForm.company_country}
                onChange={(e) => setCompanyForm({ ...companyForm, company_country: e.target.value })}
                placeholder="Country"
              />
            </div>

            {messages.company && (
              <div className={`settings__message settings__message--${messages.company.type}`}>
                {messages.company.type === 'success' ? <CheckCircleIcon size={16} /> : <AlertCircleIcon size={16} />}
                {messages.company.text}
              </div>
            )}

            <div className="settings__form-actions">
              <Button
                variant="primary"
                onClick={handleSaveCompany}
                loading={updateSettings.isPending}
              >
                Save Company Info
              </Button>
            </div>
          </div>
        </Card>

        {/* Invoice Defaults */}
        <Card
          title="Invoice Defaults"
          subtitle="Default values for new invoices"
          icon={InvoiceIcon}
          padding="md"
        >
          <div className="settings__form">
            <div className="settings__form-grid">
              <Select
                label="Default Currency"
                value={invoiceForm.default_currency}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, default_currency: e.target.value })}
                options={CURRENCY_OPTIONS}
              />
              <Select
                label="Default Payment Terms"
                value={invoiceForm.default_payment_terms}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, default_payment_terms: e.target.value })}
                options={PAYMENT_TERMS_OPTIONS}
              />
            </div>

            <Input
              label="Invoice Prefix"
              value={invoiceForm.invoice_prefix}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_prefix: e.target.value.toUpperCase() })}
              placeholder="BRK"
              hint="Invoice numbers will be: PREFIX-YYYY-001"
            />

            <TextArea
              label="Default Invoice Notes"
              value={invoiceForm.invoice_notes_template}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_notes_template: e.target.value })}
              placeholder="Thank you for your business!"
              rows={3}
            />

            {messages.invoice && (
              <div className={`settings__message settings__message--${messages.invoice.type}`}>
                {messages.invoice.type === 'success' ? <CheckCircleIcon size={16} /> : <AlertCircleIcon size={16} />}
                {messages.invoice.text}
              </div>
            )}

            <div className="settings__form-actions">
              <Button
                variant="primary"
                onClick={handleSaveInvoice}
                loading={updateSettings.isPending}
              >
                Save Invoice Defaults
              </Button>
            </div>
          </div>
        </Card>

        {/* Financial Goals */}
        <Card
          title="Financial Goals"
          subtitle="Set targets for your dashboard"
          icon={TargetIcon}
          padding="md"
        >
          <div className="settings__form">
            <p className="settings__form-hint">
              These targets are displayed on your dashboard to track progress.
            </p>

            <div className="settings__form-grid">
              <Input
                label="Monthly Revenue Target"
                type="number"
                value={goalsForm.monthly_income_target}
                onChange={(e) => setGoalsForm({ ...goalsForm, monthly_income_target: parseFloat(e.target.value) || 0 })}
                placeholder="5000"
              />
              <Select
                label="Currency"
                value={goalsForm.monthly_income_currency}
                onChange={(e) => setGoalsForm({ ...goalsForm, monthly_income_currency: e.target.value })}
                options={CURRENCY_OPTIONS}
              />
            </div>

            <div className="settings__form-grid">
              <Input
                label="Savings Goal"
                type="number"
                value={goalsForm.savings_goal}
                onChange={(e) => setGoalsForm({ ...goalsForm, savings_goal: parseFloat(e.target.value) || 0 })}
                placeholder="20000"
                hint="Your target savings amount"
              />
              <Select
                label="Currency"
                value={goalsForm.savings_goal_currency}
                onChange={(e) => setGoalsForm({ ...goalsForm, savings_goal_currency: e.target.value })}
                options={CURRENCY_OPTIONS}
              />
            </div>

            {/* Current Savings - NEW */}
            <div className="settings__savings-section">
              <Input
                label="Current Savings Balance"
                type="number"
                value={goalsForm.current_savings}
                onChange={(e) => setGoalsForm({ ...goalsForm, current_savings: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                hint="Update this when you save or withdraw money"
              />
              
              {goalsForm.savings_goal > 0 && (
                <div className="settings__savings-progress">
                  <div className="settings__savings-progress-header">
                    <span>Progress</span>
                    <span>
                      {formatCurrency(goalsForm.current_savings || 0, goalsForm.savings_goal_currency)} / {formatCurrency(goalsForm.savings_goal, goalsForm.savings_goal_currency)}
                    </span>
                  </div>
                  <div className="settings__savings-progress-bar">
                    <div 
                      className="settings__savings-progress-fill"
                      style={{ width: `${savingsProgress}%` }}
                    />
                  </div>
                  <span className="settings__savings-progress-percent">{savingsProgress.toFixed(0)}%</span>
                </div>
              )}
            </div>

            <Input
              label="Goal Target Date"
              type="date"
              value={goalsForm.goal_target_date || ''}
              onChange={(e) => setGoalsForm({ ...goalsForm, goal_target_date: e.target.value })}
              hint="Optional - milestone date for your goals"
            />

            {messages.goals && (
              <div className={`settings__message settings__message--${messages.goals.type}`}>
                {messages.goals.type === 'success' ? <CheckCircleIcon size={16} /> : <AlertCircleIcon size={16} />}
                {messages.goals.text}
              </div>
            )}

            <div className="settings__form-actions">
              <Button
                variant="primary"
                onClick={handleSaveGoals}
                loading={updateSettings.isPending}
              >
                Save Goals
              </Button>
            </div>
          </div>
        </Card>

        {/* Account / Change Password */}
        <Card
          title="Account"
          subtitle="Change your password"
          icon={LockIcon}
          padding="md"
        >
          <div className="settings__form">
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="••••••••"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="••••••••"
            />

            {messages.password && (
              <div className={`settings__message settings__message--${messages.password.type}`}>
                {messages.password.type === 'success' ? <CheckCircleIcon size={16} /> : <AlertCircleIcon size={16} />}
                {messages.password.text}
              </div>
            )}

            <div className="settings__form-actions">
              <Button
                variant="primary"
                onClick={handleChangePassword}
                loading={changePassword.isPending}
                disabled={!passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                Change Password
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;