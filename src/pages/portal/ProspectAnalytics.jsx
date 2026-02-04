/**
 * ProspectAnalytics - CRM Analytics Dashboard
 */

import { Card, LoadingState } from '../../components/portal/common';
import { useProspectAnalytics } from '../../hooks/useProspectAnalytics';
import { formatCurrency } from '../../lib/formatters';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import '../../styles/portal/analytics.css';

// Source labels
const SOURCE_LABELS = {
  craigslist: 'Craigslist',
  google_maps: 'Google Maps',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  upwork: 'Upwork',
  fiverr: 'Fiverr',
  referral: 'Referral',
  website: 'Website',
  cold_outreach: 'Cold Outreach',
  other: 'Other',
};

// Stage labels
const STAGE_LABELS = {
  identified: 'Identified',
  contacted: 'Contacted',
  replied: 'Replied',
  call_scheduled: 'Call Scheduled',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiating',
  won: 'Won',
  lost: 'Lost',
  no_response: 'No Response',
};

// Stage colors
const STAGE_COLORS = {
  identified: '#9ca3af',
  contacted: '#60a5fa',
  replied: '#38bdf8',
  call_scheduled: '#fbbf24',
  proposal_sent: '#fb923c',
  negotiating: '#f97316',
  won: '#22c55e',
  lost: '#ef4444',
  no_response: '#6b7280',
};

// Tooltip styles
const tooltipStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  fontSize: '12px',
  padding: '6px 10px',
};

export function ProspectAnalytics() {
  const { data: analytics, isLoading, error } = useProspectAnalytics();

  if (isLoading) {
    return (
      <div className="prospect-analytics">
        <LoadingState message="Calculating analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="prospect-analytics">
        <div className="prospect-analytics__error">
          Failed to load analytics. Please try again.
        </div>
      </div>
    );
  }

  const { summary, periods, bySource, byStage, topSources, monthlyTrend } = analytics;

  // Prepare stage data for pie chart
  const stageData = Object.entries(byStage)
    .filter(([_, data]) => data.count > 0)
    .map(([stage, data]) => ({
      name: STAGE_LABELS[stage] || stage,
      value: data.count,
      fill: STAGE_COLORS[stage] || '#9ca3af',
    }));

  // Prepare source data for bar chart - limit to top 5
  const sourceData = Object.entries(bySource)
    .filter(([_, data]) => data.total > 0)
    .map(([source, data]) => ({
      name: SOURCE_LABELS[source]?.split(' ')[0] || source,
      fullName: SOURCE_LABELS[source] || source,
      total: data.total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="prospect-analytics">
      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="analytics-summary__card analytics-summary__card--primary">
          <div className="analytics-summary__label">Pipeline Value</div>
          <div className="analytics-summary__value">
            {formatCurrency(summary.pipelineValue, 'USD')}
          </div>
          <div className="analytics-summary__sub">
            {summary.active} active prospects
          </div>
        </div>

        <div className="analytics-summary__card">
          <div className="analytics-summary__label">Revenue Won</div>
          <div className="analytics-summary__value analytics-summary__value--success">
            {formatCurrency(summary.wonValue, 'USD')}
          </div>
          <div className="analytics-summary__sub">
            {summary.won} deals closed
          </div>
        </div>

        <div className="analytics-summary__card">
          <div className="analytics-summary__label">Conversion Rate</div>
          <div className="analytics-summary__value">
            {summary.conversionRate.toFixed(1)}%
          </div>
          <div className="analytics-summary__sub">
            of closed prospects
          </div>
        </div>

        <div className="analytics-summary__card">
          <div className="analytics-summary__label">Avg Days to Win</div>
          <div className="analytics-summary__value">
            {summary.avgDaysToWin}
          </div>
          <div className="analytics-summary__sub">
            days in pipeline
          </div>
        </div>
      </div>

      {/* This Month + Pipeline Distribution */}
      <div className="analytics-row">
        <Card className="analytics-card">
          <div className="analytics-card__header">
            <h3>This Month</h3>
          </div>
          <div className="analytics-card__body">
            <div className="analytics-comparison">
              <div className="analytics-comparison__item">
                <span className="analytics-comparison__label">New Prospects</span>
                <span className="analytics-comparison__value">{periods.thisMonth.created}</span>
                <span className={`analytics-comparison__change ${periods.thisMonth.created >= periods.lastMonth.created ? 'positive' : 'negative'}`}>
                  {periods.thisMonth.created >= periods.lastMonth.created ? '↑' : '↓'} vs {periods.lastMonth.created} last month
                </span>
              </div>
              <div className="analytics-comparison__item">
                <span className="analytics-comparison__label">Deals Won</span>
                <span className="analytics-comparison__value">{periods.thisMonth.won}</span>
                <span className={`analytics-comparison__change ${periods.thisMonth.won >= periods.lastMonth.won ? 'positive' : 'negative'}`}>
                  {periods.thisMonth.won >= periods.lastMonth.won ? '↑' : '↓'} vs {periods.lastMonth.won} last month
                </span>
              </div>
              <div className="analytics-comparison__item">
                <span className="analytics-comparison__label">Revenue Won</span>
                <span className="analytics-comparison__value analytics-comparison__value--money">
                  {formatCurrency(periods.thisMonth.wonValue, 'USD')}
                </span>
                <span className={`analytics-comparison__change ${periods.thisMonth.wonValue >= periods.lastMonth.wonValue ? 'positive' : 'negative'}`}>
                  {periods.thisMonth.wonValue >= periods.lastMonth.wonValue ? '↑' : '↓'} vs {formatCurrency(periods.lastMonth.wonValue, 'USD')}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="analytics-card">
          <div className="analytics-card__header">
            <h3>Pipeline Distribution</h3>
          </div>
          <div className="analytics-card__body analytics-card__body--chart">
            {stageData.length > 0 ? (
              <div className="analytics-chart-row">
                <div style={{ width: '55%', height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="analytics-legend analytics-legend--vertical">
                  {stageData.map((entry, index) => (
                    <div key={index} className="analytics-legend__item">
                      <span className="analytics-legend__dot" style={{ background: entry.fill }} />
                      <span className="analytics-legend__label">{entry.name}</span>
                      <span className="analytics-legend__value">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="analytics-card__empty">No data yet</div>
            )}
          </div>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="analytics-card analytics-card--full">
        <div className="analytics-card__header">
          <h3>Monthly Activity</h3>
        </div>
        <div className="analytics-card__body analytics-card__body--chart">
          {monthlyTrend.length > 0 ? (
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} barSize={16} barGap={4}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(245,240,235,0.5)', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(245,240,235,0.5)', fontSize: 11 }}
                    allowDecimals={false}
                    width={25}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="created" name="Created" fill="#60a5fa" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="won" name="Won" fill="#22c55e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="analytics-card__empty">No data yet</div>
          )}
        </div>
      </Card>

      {/* Source Performance */}
      <div className="analytics-row">
        <Card className="analytics-card">
          <div className="analytics-card__header">
            <h3>Prospects by Source</h3>
          </div>
          <div className="analytics-card__body analytics-card__body--chart">
            {sourceData.length > 0 ? (
              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceData} layout="vertical" barSize={10}>
                    <XAxis 
                      type="number" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(245,240,235,0.5)', fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'rgba(245,240,235,0.75)', fontSize: 11 }}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar dataKey="total" name="Total" fill="#60a5fa" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="analytics-card__empty">No data yet</div>
            )}
          </div>
        </Card>

        <Card className="analytics-card">
          <div className="analytics-card__header">
            <h3>Top Converting Sources</h3>
          </div>
          <div className="analytics-card__body">
            {topSources.length > 0 ? (
              <div className="analytics-rankings">
                {topSources.slice(0, 5).map((source, index) => (
                  <div key={source.source} className="analytics-ranking-item">
                    <span className="analytics-ranking-item__rank">{index + 1}</span>
                    <div className="analytics-ranking-item__info">
                      <span className="analytics-ranking-item__name">
                        {SOURCE_LABELS[source.source] || source.source}
                      </span>
                      <span className="analytics-ranking-item__stats">
                        {source.won}/{source.total} won
                      </span>
                    </div>
                    <span className="analytics-ranking-item__value">
                      {source.conversionRate.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="analytics-card__empty">No closed deals yet</div>
            )}
          </div>
        </Card>
      </div>

      {/* Overall Stats */}
      <Card className="analytics-card analytics-card--full">
        <div className="analytics-card__header">
          <h3>Overall Statistics</h3>
        </div>
        <div className="analytics-card__body">
          <div className="analytics-stats-grid">
            <div className="analytics-stat">
              <span className="analytics-stat__label">Total Prospects</span>
              <span className="analytics-stat__value">{summary.total}</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__label">Active</span>
              <span className="analytics-stat__value">{summary.active}</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__label">Won</span>
              <span className="analytics-stat__value analytics-stat__value--success">{summary.won}</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__label">Lost</span>
              <span className="analytics-stat__value analytics-stat__value--danger">{summary.lost}</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__label">No Response</span>
              <span className="analytics-stat__value">{summary.noResponse}</span>
            </div>
            <div className="analytics-stat">
              <span className="analytics-stat__label">Overall Win Rate</span>
              <span className="analytics-stat__value">{summary.overallConversionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProspectAnalytics;