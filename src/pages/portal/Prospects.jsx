/**
 * Prospects - Main prospects page with list view
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Card,
  Button,
  StatusBadge,
  DataTable,
  SearchInput,
  Tabs,
  Select,
  EmptyState,
  LoadingState,
} from '../../components/portal/common';
import {
  PlusIcon,
  ProspectsIcon,
  GridIcon,
  ListIcon,
  ChartIcon,
} from '../../components/common/Icons';
import { useProspects } from '../../hooks/useProspects';
import { formatCurrency, formatRelativeDate } from '../../lib/formatters';
import ProspectAnalytics from './ProspectAnalytics';
import '../../styles/portal/prospects.css';

// Stage configuration
const STAGES = {
  identified: { label: 'Identified', color: 'neutral' },
  contacted: { label: 'Contacted', color: 'info' },
  replied: { label: 'Replied', color: 'info' },
  call_scheduled: { label: 'Call Scheduled', color: 'warning' },
  proposal_sent: { label: 'Proposal Sent', color: 'warning' },
  negotiating: { label: 'Negotiating', color: 'warning' },
  won: { label: 'Won', color: 'success' },
  lost: { label: 'Lost', color: 'danger' },
  no_response: { label: 'No Response', color: 'neutral' },
};

// Source options
const SOURCE_OPTIONS = [
  { value: '', label: 'Select an option' },
  { value: 'craigslist', label: 'Craigslist' },
  { value: 'google_maps', label: 'Google Maps' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'upwork', label: 'Upwork' },
  { value: 'fiverr', label: 'Fiverr' },
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'other', label: 'Other' },
];

// Table columns - Using correct CSS class names
const columns = [
  {
    key: 'name',
    label: 'Name',
    render: (value, row) => (
      <div className="prospect-cell">
        <span className="prospect-cell__name">{value}</span>
        {row.company && <span className="prospect-cell__company">{row.company}</span>}
      </div>
    ),
  },
  {
    key: 'source',
    label: 'Source',
    render: (value) => SOURCE_OPTIONS.find(s => s.value === value)?.label || value,
  },
  {
    key: 'stage',
    label: 'Stage',
    render: (value) => (
      <StatusBadge
        status={STAGES[value]?.color || 'neutral'}
        label={STAGES[value]?.label || value}
      />
    ),
  },
  {
    key: 'estimated_value',
    label: 'Value',
    render: (value, row) => value ? formatCurrency(value, row.currency || 'USD') : '-',
  },
  {
    key: 'next_follow_up',
    label: 'Follow-up',
    render: (value) => {
      if (!value) return '-';
      const isOverdue = new Date(value) < new Date();
      return (
        <span style={{ color: isOverdue ? '#f97316' : 'inherit' }}>
          {formatRelativeDate(value)}
        </span>
      );
    },
  },
  {
    key: 'activity_count',
    label: 'Activity',
    render: (value) => `${value || 0} notes`,
  },
];

const Prospects = () => {
  const navigate = useNavigate();
  const { data: prospects, isLoading, error } = useProspects();

  // View state
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Calculate stats
  const stats = {
    active: prospects?.filter(p => !['won', 'lost', 'no_response'].includes(p.stage)).length || 0,
    pipelineValue: prospects
      ?.filter(p => !['won', 'lost', 'no_response'].includes(p.stage))
      .reduce((sum, p) => sum + (p.estimated_value || 0), 0) || 0,
    needsFollowUp: prospects?.filter(p => {
      if (['won', 'lost', 'no_response'].includes(p.stage)) return false;
      if (!p.next_follow_up) return false;
      return new Date(p.next_follow_up) <= new Date();
    }).length || 0,
    won: prospects?.filter(p => p.stage === 'won').length || 0,
  };

  // Filter prospects
  const filteredProspects = prospects?.filter(p => {
    if (activeTab === 'active' && ['won', 'lost', 'no_response'].includes(p.stage)) return false;
    if (activeTab === 'won' && p.stage !== 'won') return false;
    if (activeTab === 'lost' && !['lost', 'no_response'].includes(p.stage)) return false;
    if (sourceFilter && p.source !== sourceFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.name?.toLowerCase().includes(query) ||
        p.company?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  // Tabs
  const tabs = [
    { value: 'active', label: 'Active', count: stats.active },
    { value: 'all', label: 'All', count: prospects?.length || 0 },
    { value: 'won', label: 'Won', count: stats.won },
    { value: 'lost', label: 'Lost', count: prospects?.filter(p => ['lost', 'no_response'].includes(p.stage)).length || 0 },
  ];

  if (isLoading) return <LoadingState text="Loading prospects..." />;

  if (error) {
    return (
      <div className="portal-page">
        <PageHeader title="Prospects" />
        <Card>
          <EmptyState
            icon={ProspectsIcon}
            title="Failed to load prospects"
            description="There was an error loading your prospects."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <PageHeader
        title="Prospects"
        subtitle={`${stats.active} active prospects in pipeline`}
        actions={
          <div className="prospects-header-actions">
            <div className="view-toggle">
              <button
                className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <ListIcon size={16} />
              </button>
              <button
                className={`view-toggle__btn ${viewMode === 'kanban' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => navigate('/portal/prospects/pipeline')}
                title="Pipeline View"
              >
                <GridIcon size={16} />
              </button>
              <button
                className={`view-toggle__btn ${viewMode === 'analytics' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('analytics')}
                title="Analytics"
              >
                <ChartIcon size={16} />
              </button>
            </div>
            <Button
              variant="primary"
              icon={PlusIcon}
              onClick={() => navigate('/portal/prospects/new')}
            >
              Add Prospect
            </Button>
          </div>
        }
      />

      {viewMode === 'analytics' ? (
        <ProspectAnalytics />
      ) : (
        <>
          {/* Stats Row */}
          <div className="prospects-stats">
            <div className="prospects-stat">
              <span className="prospects-stat__value">{stats.active}</span>
              <span className="prospects-stat__label">Active</span>
            </div>
            <div className="prospects-stat">
              <span className="prospects-stat__value">{formatCurrency(stats.pipelineValue, 'USD')}</span>
              <span className="prospects-stat__label">Pipeline Value</span>
            </div>
            <div className="prospects-stat">
              <span className={`prospects-stat__value ${stats.needsFollowUp > 0 ? 'prospects-stat__value--warning' : ''}`}>
                {stats.needsFollowUp}
              </span>
              <span className="prospects-stat__label">Needs Follow-up</span>
            </div>
            <div className="prospects-stat">
              <span className="prospects-stat__value prospects-stat__value--success">{stats.won}</span>
              <span className="prospects-stat__label">Won</span>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <div className="prospects-filters">
              <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
              <div className="prospects-filters__right">
                <Select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  options={SOURCE_OPTIONS}
                  className="prospects-filters__select"
                />
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prospects..."
                />
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card>
            {filteredProspects.length === 0 ? (
              <EmptyState
                icon={ProspectsIcon}
                title={searchQuery || sourceFilter ? 'No matching prospects' : 'No prospects yet'}
                description={
                  searchQuery || sourceFilter
                    ? 'Try adjusting your filters'
                    : 'Add your first prospect to start tracking your pipeline.'
                }
                action={
                  !searchQuery && !sourceFilter && (
                    <Button
                      variant="primary"
                      icon={PlusIcon}
                      onClick={() => navigate('/portal/prospects/new')}
                    >
                      Add Prospect
                    </Button>
                  )
                }
              />
            ) : (
              <DataTable
                columns={columns}
                data={filteredProspects}
                onRowClick={(row) => navigate(`/portal/prospects/${row.id}`)}
              />
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Prospects;