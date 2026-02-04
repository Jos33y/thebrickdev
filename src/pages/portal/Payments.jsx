/**
 * Payments - Payment list page
 * 
 * Fixed: Changed statusTabs from { id } to { value } to match Tabs component API
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Card,
  Button,
  DataTable,
  SearchInput,
  Tabs,
  StatusBadge,
  EmptyState,
} from '../../components/portal/common';
import { PlusIcon, PaymentIcon } from '../../components/common/Icons';
import { usePayments } from '../../hooks/usePayments';
import { formatCurrency, formatDate } from '../../lib/formatters';

const PAYMENT_TYPE_LABELS = {
  bank: 'Bank',
  platform: 'Platform',
  crypto: 'Crypto',
};

// Table columns
const columns = [
  {
    key: 'received_date',
    header: 'Date',
    render: (value) => formatDate(value),
  },
  {
    key: 'invoice',
    header: 'Invoice',
    render: (value) => value?.invoice_number || '—',
  },
  {
    key: 'client',
    header: 'Client',
    render: (_, row) => row.invoice?.client?.name || '—',
  },
  {
    key: 'payment_type',
    header: 'Method',
    render: (value) => PAYMENT_TYPE_LABELS[value] || value,
  },
  {
    key: 'amount_received',
    header: 'Amount',
    render: (value, row) => formatCurrency(value, row.currency_received),
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <StatusBadge status={value} />,
  },
];

// FIXED: Changed from { id } to { value } to match Tabs component API
const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'cleared', label: 'Cleared' },
  { value: 'pending', label: 'Pending' },
];

const Payments = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: payments = [], isLoading, error } = usePayments();

  // Calculate summary
  const summary = useMemo(() => {
    const cleared = payments.filter(p => p.status === 'cleared');
    const pending = payments.filter(p => p.status === 'pending');
    return {
      totalCleared: cleared.reduce((sum, p) => sum + (p.amount_received || 0), 0),
      clearedCount: cleared.length,
      pendingCount: pending.length,
    };
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    let result = payments;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.invoice?.invoice_number?.toLowerCase().includes(query) ||
        p.invoice?.client?.name?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [payments, statusFilter, searchQuery]);

  // Tabs with counts - FIXED: using tab.value instead of tab.id
  const tabsWithCounts = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.value === 'all' 
      ? payments.length 
      : tab.value === 'cleared' 
        ? summary.clearedCount 
        : summary.pendingCount,
  }));

  // Handle row click
  const handleRowClick = (payment) => {
    navigate(`/portal/payments/${payment.id}`);
  };

  // Error state
  if (error) {
    return (
      <div className="portal-page">
        <PageHeader title="Payments" />
        <Card>
          <EmptyState
            icon={PaymentIcon}
            title="Failed to load payments"
            description={error.message || 'Something went wrong. Please try again.'}
            action={
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="portal-page portal-payments">
      <PageHeader
        title="Payments"
        subtitle={`${summary.clearedCount} cleared`}
        actions={
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={() => navigate('/portal/payments/new')}
          >
            Record Payment
          </Button>
        }
      />

      <Card padding="none">
        {/* Filters */}
        <div className="list-filters">
          <Tabs
            tabs={tabsWithCounts}
            activeTab={statusFilter}
            onChange={setStatusFilter}
          />
          <div className="list-filters__search">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payments..."
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredPayments}
          onRowClick={handleRowClick}
          loading={isLoading}
          emptyState={
            <EmptyState
              icon={PaymentIcon}
              title={searchQuery || statusFilter !== 'all' ? 'No payments found' : 'No payments yet'}
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Record your first payment to get started.'
              }
              action={
                !searchQuery && statusFilter === 'all' && (
                  <Button
                    variant="primary"
                    icon={PlusIcon}
                    onClick={() => navigate('/portal/payments/new')}
                  >
                    Record Payment
                  </Button>
                )
              }
            />
          }
        />
      </Card>
    </div>
  );
};

export default Payments;