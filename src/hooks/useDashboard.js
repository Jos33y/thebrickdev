/**
 * useDashboard - Comprehensive dashboard statistics
 * 
 * Tracks:
 * - Monthly income tracking
 * - Savings/goal progress (uses current_savings from Settings)
 * - Income by source (bank, platform, crypto)
 * - Currency breakdown
 * - Year-to-date totals
 * - Average monthly income
 * - Prospect pipeline stats (Phase 2)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfYear,
  format, 
  isAfter, 
  isBefore,
  parseISO
} from 'date-fns';

// Approximate conversion rates (for display purposes only)
// In production, these would come from an API
const CONVERSION_RATES = {
  USD: { EUR: 0.92, GBP: 0.79, USD: 1, NGN: 1550 },
  EUR: { USD: 1.09, GBP: 0.86, EUR: 1, NGN: 1680 },
  GBP: { USD: 1.27, EUR: 1.16, GBP: 1, NGN: 1960 },
  NGN: { USD: 0.00065, EUR: 0.0006, GBP: 0.00051, NGN: 1 },
};

/**
 * Convert amount between currencies
 * EXPORTED for use in Dashboard component currency toggle
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount || fromCurrency === toCurrency) return amount;
  const rate = CONVERSION_RATES[fromCurrency]?.[toCurrency] || 1;
  return amount * rate;
};

/**
 * Fetch dashboard data
 */
const fetchDashboardData = async () => {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  
  // Fetch all data in parallel (including prospects)
  const [paymentsResult, invoicesResult, clientsResult, settingsResult, prospectsResult] = await Promise.all([
    supabase
      .from('payments')
      .select('id, amount_received, currency_received, received_date, status, payment_type')
      .eq('status', 'cleared'),
    supabase
      .from('invoices')
      .select('id, invoice_number, client_id, total, currency, status, due_date, issue_date, clients(name)')
      .neq('status', 'draft'),
    supabase
      .from('clients')
      .select('id, status'),
    supabase
      .from('settings')
      .select('monthly_income_target, monthly_income_currency, savings_goal, savings_goal_currency, current_savings, goal_target_date')
      .single(),
    // Fetch prospects with activity count
    supabase
      .from('prospects')
      .select('id, name, company, stage, estimated_value, currency, source, next_follow_up, created_at')
  ]);

  if (paymentsResult.error) console.error('Payments error:', paymentsResult.error);
  if (invoicesResult.error) console.error('Invoices error:', invoicesResult.error);
  if (clientsResult.error) console.error('Clients error:', clientsResult.error);
  if (prospectsResult.error) console.error('Prospects error:', prospectsResult.error);

  const payments = paymentsResult.data || [];
  const invoices = invoicesResult.data || [];
  const clients = clientsResult.data || [];
  const prospects = prospectsResult.data || [];
  
  // Settings with fallback defaults
  const settings = settingsResult.data || {
    monthly_income_target: 5000,
    monthly_income_currency: 'USD',
    savings_goal: 20000,
    savings_goal_currency: 'USD',
    current_savings: 0,
    goal_target_date: null
  };

  // Helper function to calculate totals in a specific currency
  const calculateTotalsInCurrency = (paymentsList, targetCurrency) => {
    return paymentsList.reduce((sum, p) => {
      return sum + convertCurrency(Number(p.amount_received || 0), p.currency_received, targetCurrency);
    }, 0);
  };

  // Calculate totals in USD (base currency for display)
  const totalRevenueUSD = calculateTotalsInCurrency(payments, 'USD');

  // Current month revenue
  const currentMonthPayments = payments.filter(p => {
    if (!p.received_date) return false;
    const date = parseISO(p.received_date);
    return date >= currentMonthStart && date <= currentMonthEnd;
  });

  const monthlyRevenueUSD = calculateTotalsInCurrency(currentMonthPayments, 'USD');

  // Year-to-date revenue
  const ytdPayments = payments.filter(p => {
    if (!p.received_date) return false;
    return parseISO(p.received_date) >= yearStart;
  });

  const ytdRevenueUSD = calculateTotalsInCurrency(ytdPayments, 'USD');

  // Average monthly (based on months with activity)
  const monthsWithPayments = new Set(
    payments.map(p => p.received_date ? format(parseISO(p.received_date), 'yyyy-MM') : null).filter(Boolean)
  );
  const avgMonthlyUSD = monthsWithPayments.size > 0 ? totalRevenueUSD / monthsWithPayments.size : 0;

  // Income by source type (in USD)
  const incomeBySource = {
    bank: calculateTotalsInCurrency(payments.filter(p => p.payment_type === 'bank'), 'USD'),
    platform: calculateTotalsInCurrency(payments.filter(p => p.payment_type === 'platform'), 'USD'),
    crypto: calculateTotalsInCurrency(payments.filter(p => p.payment_type === 'crypto'), 'USD'),
  };

  // Income by currency received (raw amounts in original currency)
  const incomeByCurrency = {
    USD: payments.filter(p => p.currency_received === 'USD').reduce((sum, p) => 
      sum + Number(p.amount_received || 0), 0),
    EUR: payments.filter(p => p.currency_received === 'EUR').reduce((sum, p) => 
      sum + Number(p.amount_received || 0), 0),
    GBP: payments.filter(p => p.currency_received === 'GBP').reduce((sum, p) => 
      sum + Number(p.amount_received || 0), 0),
    NGN: payments.filter(p => p.currency_received === 'NGN').reduce((sum, p) => 
      sum + Number(p.amount_received || 0), 0),
  };

  // Clients
  const activeClients = clients.filter(c => c.status === 'active').length;

  // Invoices
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'viewed');
  const overdueInvoices = invoices.filter(inv => {
    if (inv.status === 'paid' || inv.status === 'cancelled') return false;
    if (!inv.due_date) return false;
    return isAfter(now, parseISO(inv.due_date));
  });

  // Recent invoices
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date))
    .slice(0, 5);

  // ==========================================================================
  // PROSPECT STATS (Phase 2)
  // ==========================================================================
  
  // Active stages (not won, lost, or no_response)
  const activeStages = ['identified', 'contacted', 'replied', 'call_scheduled', 'proposal_sent', 'negotiating'];
  const closedStages = ['won', 'lost', 'no_response'];
  
  // Active prospects (in pipeline)
  const activeProspects = prospects.filter(p => activeStages.includes(p.stage));
  
  // Won prospects
  const wonProspects = prospects.filter(p => p.stage === 'won');
  
  // Pipeline value (estimated value of active prospects in USD)
  const pipelineValueUSD = activeProspects.reduce((sum, p) => {
    if (!p.estimated_value) return sum;
    return sum + convertCurrency(p.estimated_value, p.currency || 'USD', 'USD');
  }, 0);
  
  // Prospects needing follow-up (next_follow_up is today or past)
  const needsFollowUp = prospects.filter(p => {
    if (!p.next_follow_up) return false;
    if (closedStages.includes(p.stage)) return false;
    const followUpDate = parseISO(p.next_follow_up);
    return isBefore(followUpDate, now) || format(followUpDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
  });
  
  // Recent prospects (last 5 added)
  const recentProspects = [...prospects]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  
  // Prospects by stage (for mini pipeline view)
  const prospectsByStage = activeStages.reduce((acc, stage) => {
    acc[stage] = prospects.filter(p => p.stage === stage).length;
    return acc;
  }, {});

  // Get monthly target in USD for calculations
  const monthlyTargetUSD = convertCurrency(
    settings.monthly_income_target, 
    settings.monthly_income_currency, 
    'USD'
  );
  
  const savingsTargetUSD = convertCurrency(
    settings.savings_goal,
    settings.savings_goal_currency,
    'USD'
  );

  // Current savings converted to USD
  const currentSavingsUSD = convertCurrency(
    settings.current_savings || 0,
    settings.savings_goal_currency,
    'USD'
  );

  // Monthly data for chart (last 12 months)
  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthPayments = payments.filter(p => {
      if (!p.received_date) return false;
      const date = parseISO(p.received_date);
      return date >= monthStart && date <= monthEnd;
    });

    const revenue = calculateTotalsInCurrency(monthPayments, 'USD');

    monthlyData.push({
      month: format(monthDate, 'MMM'),
      monthShort: format(monthDate, 'MMM')[0],
      monthFull: format(monthDate, 'MMMM yyyy'),
      revenue,
      meetsTarget: revenue >= monthlyTargetUSD,
    });
  }

  // Progress calculations
  const monthlyProgress = monthlyTargetUSD > 0 
    ? Math.min((monthlyRevenueUSD / monthlyTargetUSD) * 100, 100) 
    : 0;
  
  // Savings progress uses current_savings (manually updated in Settings)
  const savingsProgress = savingsTargetUSD > 0 
    ? Math.min((currentSavingsUSD / savingsTargetUSD) * 100, 100) 
    : 0;

  // Months meeting target
  const monthsMeetingTarget = monthlyData.filter(m => m.meetsTarget).length;

  return {
    // Revenue totals (in USD - will be converted in component)
    totalRevenue: totalRevenueUSD,
    monthlyRevenue: monthlyRevenueUSD,
    ytdRevenue: ytdRevenueUSD,
    avgMonthly: avgMonthlyUSD,
    
    // Breakdowns
    incomeBySource,
    incomeByCurrency,
    
    // Clients
    activeClients,
    totalClients: clients.length,
    
    // Invoices
    pendingInvoices,
    pendingCount: pendingInvoices.length,
    overdueInvoices,
    overdueCount: overdueInvoices.length,
    recentInvoices,
    
    // ==========================================================================
    // PROSPECT DATA (Phase 2)
    // ==========================================================================
    prospects: {
      active: activeProspects.length,
      total: prospects.length,
      pipelineValue: pipelineValueUSD,
      needsFollowUp: needsFollowUp.length,
      wonCount: wonProspects.length,
      byStage: prospectsByStage,
      recent: recentProspects,
    },
    
    // Chart data
    monthlyData,
    
    // Targets from settings (converted to USD for consistency)
    monthlyTarget: monthlyTargetUSD,
    savingsTarget: savingsTargetUSD,
    currentSavings: currentSavingsUSD,
    monthlyProgress,
    savingsProgress,
    monthsMeetingTarget,
    
    // Original settings values (for display in settings currency if needed)
    settings: {
      monthlyIncomeTarget: settings.monthly_income_target,
      monthlyIncomeCurrency: settings.monthly_income_currency,
      savingsGoal: settings.savings_goal,
      savingsGoalCurrency: settings.savings_goal_currency,
      currentSavings: settings.current_savings || 0,
      goalTargetDate: settings.goal_target_date
    },
    
    // Conversion helper exposed for component use
    convertCurrency,
  };
};

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}

export default useDashboard;