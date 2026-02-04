/**
 * Dashboard - The Brick Dev Portal
 * Premium SaaS-quality business dashboard
 * Updated with Sales Pipeline (Phase 2)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { useDashboard, convertCurrency } from '../../hooks/useDashboard';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { 
  TrendingUpIcon,
  ClientsIcon,
  InvoiceIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  PlusIcon,
  PaymentIcon,
  WalletIcon,
  ProspectsIcon,
  TargetIcon
} from '../../components/common/Icons';
import '../../styles/portal/dashboard.css';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN'];

// Stage labels for display
const STAGE_LABELS = {
  identified: 'New',
  contacted: 'Contacted',
  replied: 'Replied',
  call_scheduled: 'Call',
  proposal_sent: 'Proposal',
  negotiating: 'Negotiating',
};

// Helper to format amount in selected currency
const formatInCurrency = (amount, fromCurrency, toCurrency) => {
  const converted = convertCurrency(amount, fromCurrency, toCurrency);
  return formatCurrency(converted, toCurrency);
};

// Chart Tooltip
const ChartTooltip = ({ active, payload, displayCurrency }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const converted = convertCurrency(d?.revenue || 0, 'USD', displayCurrency);
  return (
    <div className="dash-tooltip">
      <span className="dash-tooltip__label">{d?.monthFull}</span>
      <span className="dash-tooltip__value">{formatCurrency(converted, displayCurrency)}</span>
      {d?.meetsTarget && <span className="dash-tooltip__badge">✓ Target</span>}
    </div>
  );
};

const Dashboard = () => {
  const { data, isLoading } = useDashboard();
  const [currency, setCurrency] = useState('USD');

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const sourceColors = { bank: '#ea580c', platform: '#0ea5e9', crypto: '#8b5cf6' };
  const currencyColors = { USD: '#22c55e', EUR: '#3b82f6', GBP: '#f59e0b', NGN: '#14b8a6' };
  const totalByCurrency = Object.values(data?.incomeByCurrency || {}).reduce((a, b) => a + b, 0);

  // Convert dashboard values to selected currency
  const displayAmount = (amount) => {
    if (!amount) return formatCurrency(0, currency);
    const converted = convertCurrency(amount, 'USD', currency);
    return formatCurrency(converted, currency);
  };

  // Convert chart data to selected currency
  const chartData = (data?.monthlyData || []).map(m => ({
    ...m,
    revenueDisplay: convertCurrency(m.revenue, 'USD', currency)
  }));

  // Target in selected currency
  const monthlyTargetDisplay = convertCurrency(data?.monthlyTarget || 5000, 'USD', currency);
  const savingsTargetDisplay = convertCurrency(data?.savingsTarget || 20000, 'USD', currency);

  return (
    <div className="dash">
      {/* ==================== HEADER ==================== */}
      <header className="dash-header">
        <div>
          <h1>Dashboard</h1>
          <p>Business Income Overview</p>
        </div>
        <div className="dash-currency">
          {CURRENCIES.map(c => (
            <button key={c} onClick={() => setCurrency(c)} className={currency === c ? 'active' : ''}>
              {c}
            </button>
          ))}
        </div>
      </header>

      {/* ==================== QUICK ACTIONS ==================== */}
      <div className="dash-actions">
        <Link to="/portal/invoices/new" className="dash-action dash-action--primary">
          <PlusIcon size={15} />
          <span>New Invoice</span>
        </Link>
        <Link to="/portal/prospects/new" className="dash-action">
          <ProspectsIcon size={15} />
          <span>Add Prospect</span>
        </Link>
        <Link to="/portal/payments/new" className="dash-action">
          <PaymentIcon size={15} />
          <span>Record Payment</span>
        </Link>
        <Link to="/portal/clients/new" className="dash-action">
          <ClientsIcon size={15} />
          <span>Add Client</span>
        </Link>
      </div>

      {/* ==================== METRICS GRID ==================== */}
      <section className="dash-metrics">
        {/* Primary Metric */}
        <div className="dash-metric dash-metric--primary">
          <div className="dash-metric__icon">
            <TrendingUpIcon size={20} />
          </div>
          <div className="dash-metric__content">
            <span className="dash-metric__label">This Month</span>
            <span className="dash-metric__value">
              {isLoading ? '—' : displayAmount(data?.monthlyRevenue)}
            </span>
            <span className="dash-metric__sub">{currentMonth} {currentYear}</span>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="dash-metric">
          <div className="dash-metric__icon"><WalletIcon size={18} /></div>
          <div className="dash-metric__content">
            <span className="dash-metric__label">Year to Date</span>
            <span className="dash-metric__value">
              {isLoading ? '—' : displayAmount(data?.ytdRevenue)}
            </span>
            <span className="dash-metric__sub">{currentYear}</span>
          </div>
        </div>

        <div className="dash-metric">
          <div className="dash-metric__icon"><WalletIcon size={18} /></div>
          <div className="dash-metric__content">
            <span className="dash-metric__label">All Time</span>
            <span className="dash-metric__value">
              {isLoading ? '—' : displayAmount(data?.totalRevenue)}
            </span>
          </div>
        </div>

        <div className="dash-metric">
          <div className="dash-metric__icon"><TrendingUpIcon size={18} /></div>
          <div className="dash-metric__content">
            <span className="dash-metric__label">Avg Monthly</span>
            <span className="dash-metric__value">
              {isLoading ? '—' : displayAmount(data?.avgMonthly)}
            </span>
            <span className="dash-metric__sub">Active months</span>
          </div>
        </div>
      </section>

      {/* ==================== GOALS + HEALTH ROW ==================== */}
      <div className="dash-row">
        {/* Financial Goals Card */}
        <section className="dash-card dash-card--visa">
          <div className="dash-card__head">
            <h2>Financial Goals</h2>
            <span className="dash-tag">{data?.monthsMeetingTarget || 0}/12 on target</span>
          </div>
          <div className="dash-card__body">
            {/* Monthly Target */}
            <div className="dash-target">
              <div className="dash-target__row">
                <span className="dash-target__name">Monthly Revenue Target</span>
                <span className="dash-target__amounts">
                  <strong>{displayAmount(data?.monthlyRevenue)}</strong>
                  <span className="dash-target__sep">/</span>
                  {formatCurrency(monthlyTargetDisplay, currency)}
                </span>
              </div>
              <div className="dash-target__bar">
                <div className="dash-target__fill dash-target__fill--orange" style={{ width: `${data?.monthlyProgress || 0}%` }} />
              </div>
              <span className="dash-target__pct">{(data?.monthlyProgress || 0).toFixed(0)}%</span>
            </div>

            {/* Savings Target */}
            <div className="dash-target">
              <div className="dash-target__row">
                <span className="dash-target__name">Savings Goal</span>
                <span className="dash-target__amounts">
                  <strong>{displayAmount(data?.currentSavings)}</strong>
                  <span className="dash-target__sep">/</span>
                  {formatCurrency(savingsTargetDisplay, currency)}
                </span>
              </div>
              <div className="dash-target__bar">
                <div className="dash-target__fill dash-target__fill--blue" style={{ width: `${data?.savingsProgress || 0}%` }} />
              </div>
              <span className="dash-target__pct">{(data?.savingsProgress || 0).toFixed(0)}%</span>
            </div>
          </div>
        </section>

        {/* Business Health Card - Now includes pipeline */}
        <section className="dash-card">
          <div className="dash-card__head">
            <h2>Business Health</h2>
          </div>
          <div className="dash-card__body">
            <div className="dash-health">
              {/* Active Prospects */}
              <div className="dash-health__item">
                <ProspectsIcon size={18} />
                <div className="dash-health__data">
                  <span className="dash-health__num">{data?.prospects?.active || 0}</span>
                  <span className="dash-health__label">In Pipeline</span>
                </div>
                <span className="dash-health__extra">{displayAmount(data?.prospects?.pipelineValue)} value</span>
              </div>

              {/* Active Clients */}
              <div className="dash-health__item">
                <ClientsIcon size={18} />
                <div className="dash-health__data">
                  <span className="dash-health__num">{data?.activeClients || 0}</span>
                  <span className="dash-health__label">Active Clients</span>
                </div>
                <span className="dash-health__extra">{data?.totalClients || 0} total</span>
              </div>

              {/* Pending Invoices */}
              <div className="dash-health__item">
                <InvoiceIcon size={18} />
                <div className="dash-health__data">
                  <span className="dash-health__num">{data?.pendingCount || 0}</span>
                  <span className="dash-health__label">Pending</span>
                </div>
                <span className="dash-health__extra">Awaiting payment</span>
              </div>

              {/* Follow-ups Needed */}
              <div className={`dash-health__item ${data?.prospects?.needsFollowUp > 0 ? 'dash-health__item--danger' : 'dash-health__item--success'}`}>
                {data?.prospects?.needsFollowUp > 0 ? <AlertTriangleIcon size={18} /> : <CheckCircleIcon size={18} />}
                <div className="dash-health__data">
                  <span className="dash-health__num">{data?.prospects?.needsFollowUp || 0}</span>
                  <span className="dash-health__label">Follow-ups Due</span>
                </div>
                <span className="dash-health__extra">{data?.prospects?.needsFollowUp > 0 ? 'Needs attention' : 'All clear'}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ==================== CHART ==================== */}
      <section className="dash-card">
        <div className="dash-card__head">
          <h2>Revenue</h2>
          <span className="dash-card__sub">Last 12 months • {formatCurrency(monthlyTargetDisplay, currency)} target line</span>
        </div>
        <div className="dash-card__body dash-card__body--chart">
          {isLoading ? (
            <div className="dash-skeleton" style={{ height: 220 }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  tickFormatter={v => {
                    const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'NGN' ? '₦' : '$';
                    return v >= 1000 ? `${symbol}${(v/1000).toFixed(0)}k` : `${symbol}${v}`;
                  }}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<ChartTooltip displayCurrency={currency} />} cursor={{ fill: 'rgba(234, 88, 12, 0.08)' }} />
                <ReferenceLine y={monthlyTargetDisplay} stroke="#ea580c" strokeDasharray="4 4" strokeWidth={1} />
                <Bar dataKey="revenueDisplay" fill="#ea580c" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ==================== PIPELINE + INVOICES ROW ==================== */}
      <div className="dash-row">
        {/* Sales Pipeline */}
        <section className="dash-card">
          <div className="dash-card__head">
            <h2>Sales Pipeline</h2>
            <Link to="/portal/prospects" className="dash-link">View all <ChevronRightIcon size={14} /></Link>
          </div>
          <div className="dash-card__body dash-card__body--list">
            {isLoading ? (
              <div className="dash-skeleton" style={{ height: 180 }} />
            ) : data?.prospects?.recent?.length > 0 ? (
              <div className="dash-prospects">
                {data.prospects.recent.map(prospect => (
                  <Link key={prospect.id} to={`/portal/prospects/${prospect.id}`} className="dash-prospect">
                    <div className="dash-prospect__left">
                      <span className="dash-prospect__name">{prospect.name}</span>
                      <span className="dash-prospect__company">{prospect.company || prospect.source}</span>
                    </div>
                    <div className="dash-prospect__right">
                      {prospect.estimated_value && (
                        <span className="dash-prospect__value">
                          {formatCurrency(prospect.estimated_value, prospect.currency || 'USD')}
                        </span>
                      )}
                      <span className={`dash-prospect__stage dash-prospect__stage--${prospect.stage}`}>
                        {STAGE_LABELS[prospect.stage] || prospect.stage}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <p>No prospects yet</p>
                <Link to="/portal/prospects/new" className="dash-action dash-action--sm">Add Prospect</Link>
              </div>
            )}
          </div>
        </section>

        {/* Recent Invoices */}
        <section className="dash-card">
          <div className="dash-card__head">
            <h2>Recent Invoices</h2>
            <Link to="/portal/invoices" className="dash-link">View all <ChevronRightIcon size={14} /></Link>
          </div>
          <div className="dash-card__body dash-card__body--list">
            {isLoading ? (
              <div className="dash-skeleton" style={{ height: 180 }} />
            ) : data?.recentInvoices?.length > 0 ? (
              <div className="dash-invoices">
                {data.recentInvoices.map(inv => (
                  <Link key={inv.id} to={`/portal/invoices/${inv.id}`} className="dash-invoice">
                    <div className="dash-invoice__left">
                      <span className="dash-invoice__num">{inv.invoice_number}</span>
                      <span className="dash-invoice__client">{inv.clients?.name || '—'}</span>
                    </div>
                    <div className="dash-invoice__right">
                      <span className="dash-invoice__amt">{formatCurrency(inv.total, inv.currency)}</span>
                      <span className={`dash-invoice__status dash-invoice__status--${inv.status}`}>{inv.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <p>No invoices yet</p>
                <Link to="/portal/invoices/new" className="dash-action dash-action--sm">Create Invoice</Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ==================== SOURCES ROW ==================== */}
      <section className="dash-card">
        <div className="dash-card__head">
          <h2>Income Sources</h2>
        </div>
        <div className="dash-card__body">
          <div className="dash-sources">
            {/* By Channel */}
            <div className="dash-sources__group">
              <h3>By Channel</h3>
              {Object.entries(sourceColors).map(([key, color]) => {
                const amount = data?.incomeBySource?.[key] || 0;
                const pct = data?.totalRevenue > 0 ? (amount / data.totalRevenue) * 100 : 0;
                return (
                  <div key={key} className="dash-source">
                    <span className="dash-source__dot" style={{ background: color }} />
                    <span className="dash-source__name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <div className="dash-source__bar">
                      <div style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="dash-source__amt">{displayAmount(amount)}</span>
                  </div>
                );
              })}
            </div>

            {/* By Currency */}
            <div className="dash-sources__group">
              <h3>By Currency Received</h3>
              {Object.entries(currencyColors).map(([key, color]) => {
                const amount = data?.incomeByCurrency?.[key] || 0;
                const pct = totalByCurrency > 0 ? (amount / totalByCurrency) * 100 : 0;
                return (
                  <div key={key} className="dash-source">
                    <span className="dash-source__dot" style={{ background: color }} />
                    <span className="dash-source__name">{key}</span>
                    <div className="dash-source__bar">
                      <div style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="dash-source__amt">{formatCurrency(amount, key)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;