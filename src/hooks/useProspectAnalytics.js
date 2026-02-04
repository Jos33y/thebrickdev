/**
 * useProspectAnalytics - Hook for CRM analytics and stats
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { differenceInDays, parseISO, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

// Define stages inline to avoid import issues
const ACTIVE_STAGES = ['identified', 'contacted', 'replied', 'call_scheduled', 'proposal_sent', 'negotiating'];
const WON_STAGE = 'won';
const LOST_STAGE = 'lost';
const NO_RESPONSE_STAGE = 'no_response';
const CLOSED_STAGES = [WON_STAGE, LOST_STAGE, NO_RESPONSE_STAGE];

const ALL_SOURCES = [
  'craigslist', 'google_maps', 'instagram', 'linkedin', 
  'upwork', 'fiverr', 'referral', 'website', 'cold_outreach', 'other'
];

const ALL_STAGES = [
  'identified', 'contacted', 'replied', 'call_scheduled', 
  'proposal_sent', 'negotiating', 'won', 'lost', 'no_response'
];

/**
 * Fetch comprehensive prospect analytics
 */
export function useProspectAnalytics() {
  return useQuery({
    queryKey: ['prospect-analytics'],
    queryFn: async () => {
      const { data: prospects, error } = await supabase
        .from('prospects')
        .select(`
          *,
          activities:prospect_activities(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return calculateAnalytics(prospects || []);
    },
    refetchInterval: 60000,
  });
}

/**
 * Calculate all analytics from prospects data
 */
function calculateAnalytics(prospects) {
  const now = new Date();
  const thisMonth = startOfMonth(now);
  const lastMonth = startOfMonth(subMonths(now, 1));

  // Basic counts
  const total = prospects.length;
  const active = prospects.filter(p => ACTIVE_STAGES.includes(p.stage)).length;
  const won = prospects.filter(p => p.stage === WON_STAGE).length;
  const lost = prospects.filter(p => p.stage === LOST_STAGE).length;
  const noResponse = prospects.filter(p => p.stage === NO_RESPONSE_STAGE).length;

  // Pipeline value
  const pipelineValue = prospects
    .filter(p => ACTIVE_STAGES.includes(p.stage))
    .reduce((sum, p) => sum + (p.estimated_value || 0), 0);

  const wonValue = prospects
    .filter(p => p.stage === WON_STAGE)
    .reduce((sum, p) => sum + (p.estimated_value || 0), 0);

  // Conversion rates
  const closed = won + lost + noResponse;
  const conversionRate = closed > 0 ? (won / closed) * 100 : 0;
  const overallConversionRate = total > 0 ? (won / total) * 100 : 0;

  // By source analysis
  const bySource = {};
  ALL_SOURCES.forEach(source => {
    const sourceProspects = prospects.filter(p => p.source === source);
    const sourceWon = sourceProspects.filter(p => p.stage === WON_STAGE);
    const sourceClosed = sourceProspects.filter(p => CLOSED_STAGES.includes(p.stage));

    bySource[source] = {
      total: sourceProspects.length,
      active: sourceProspects.filter(p => ACTIVE_STAGES.includes(p.stage)).length,
      won: sourceWon.length,
      lost: sourceProspects.filter(p => p.stage === LOST_STAGE).length,
      conversionRate: sourceClosed.length > 0 ? (sourceWon.length / sourceClosed.length) * 100 : 0,
      pipelineValue: sourceProspects
        .filter(p => ACTIVE_STAGES.includes(p.stage))
        .reduce((sum, p) => sum + (p.estimated_value || 0), 0),
      wonValue: sourceWon.reduce((sum, p) => sum + (p.estimated_value || 0), 0),
    };
  });

  // By stage distribution
  const byStage = {};
  ALL_STAGES.forEach(stage => {
    const stageProspects = prospects.filter(p => p.stage === stage);
    byStage[stage] = {
      count: stageProspects.length,
      value: stageProspects.reduce((sum, p) => sum + (p.estimated_value || 0), 0),
    };
  });

  // Average time in pipeline (for won deals)
  const wonProspects = prospects.filter(p => p.stage === WON_STAGE);
  const avgDaysToWin = wonProspects.length > 0
    ? wonProspects.reduce((sum, p) => {
        const created = parseISO(p.created_at);
        const closed = p.updated_at ? parseISO(p.updated_at) : now;
        return sum + differenceInDays(closed, created);
      }, 0) / wonProspects.length
    : 0;

  // This month stats
  const thisMonthProspects = prospects.filter(p => 
    parseISO(p.created_at) >= thisMonth
  );
  const thisMonthWon = prospects.filter(p => 
    p.stage === WON_STAGE && 
    p.updated_at && 
    parseISO(p.updated_at) >= thisMonth
  );

  // Last month stats
  const lastMonthProspects = prospects.filter(p => {
    const created = parseISO(p.created_at);
    return created >= lastMonth && created < thisMonth;
  });
  const lastMonthWon = prospects.filter(p => {
    if (p.stage !== WON_STAGE || !p.updated_at) return false;
    const updated = parseISO(p.updated_at);
    return updated >= lastMonth && updated < thisMonth;
  });

  // Monthly trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));
    
    const created = prospects.filter(p => {
      const date = parseISO(p.created_at);
      return date >= monthStart && date <= monthEnd;
    }).length;

    const wonInMonth = prospects.filter(p => {
      if (p.stage !== WON_STAGE || !p.updated_at) return false;
      const date = parseISO(p.updated_at);
      return date >= monthStart && date <= monthEnd;
    });

    monthlyTrend.push({
      month: format(monthStart, 'MMM'),
      monthFull: format(monthStart, 'MMMM yyyy'),
      created,
      won: wonInMonth.length,
      wonValue: wonInMonth.reduce((sum, p) => sum + (p.estimated_value || 0), 0),
    });
  }

  // Top sources by conversion
  const topSources = Object.entries(bySource)
    .filter(([_, data]) => data.total >= 1)
    .sort((a, b) => b[1].conversionRate - a[1].conversionRate)
    .slice(0, 5)
    .map(([source, data]) => ({ source, ...data }));

  // Top sources by revenue
  const topSourcesByRevenue = Object.entries(bySource)
    .filter(([_, data]) => data.wonValue > 0)
    .sort((a, b) => b[1].wonValue - a[1].wonValue)
    .slice(0, 5)
    .map(([source, data]) => ({ source, ...data }));

  return {
    summary: {
      total,
      active,
      won,
      lost,
      noResponse,
      pipelineValue,
      wonValue,
      conversionRate,
      overallConversionRate,
      avgDaysToWin: Math.round(avgDaysToWin),
    },
    periods: {
      thisMonth: {
        created: thisMonthProspects.length,
        won: thisMonthWon.length,
        wonValue: thisMonthWon.reduce((sum, p) => sum + (p.estimated_value || 0), 0),
      },
      lastMonth: {
        created: lastMonthProspects.length,
        won: lastMonthWon.length,
        wonValue: lastMonthWon.reduce((sum, p) => sum + (p.estimated_value || 0), 0),
      },
    },
    bySource,
    byStage,
    topSources,
    topSourcesByRevenue,
    monthlyTrend,
  };
}

export default useProspectAnalytics;