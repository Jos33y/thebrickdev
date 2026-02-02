/**
 * Invoices - Invoice list page
 * 
 * Shows all invoices with status filters and search.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Button,
  Card,
  DataTable,
  SearchInput,
  Tabs,
  StatusBadge,
  EmptyState,
} from '../../components/portal/common';
import { PlusIcon, InvoiceIcon } from '../../components/common/Icons';
import { useInvoices } from '../../hooks/useInvoices';
import { formatCurrency, formatDate } from '../../lib/formatters';

// Status tabs configuration
const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

// Table columns
const columns = [
  {
    key: 'invoice_number',
    header: 'Invoice',
    render: (value) => (
      <span className="invoice-number">{value}</span>
    ),
  },
  {
    key: 'client',
    header: 'Client',
    render: (client) => client ? (
      <div className="client-name-cell">
        <span className="client-name-cell__name">{client.name}</span>
        {client.company && (
          <span className="client-name-cell__company">{client.company}</span>
        )}
      </div>
    ) : (
      <span className="text-muted">No client</span>
    ),
  },
  {
    key: 'issue_date',
    header: 'Date',
    render: (value) => formatDate(value),
  },
  {
    key: 'due_date',
    header: 'Due',
    render: (value, row) => {
      const isOverdue = row.status === 'overdue' || 
        (row.status === 'sent' && new Date(value) < new Date());
      return (
        <span className={isOverdue ? 'text-danger' : ''}>
          {formatDate(value)}
        </span>
      );
    },
  },
  {
    key: 'total',
    header: 'Amount',
    render: (value, row) => (
      <span className="invoice-amount">
        {formatCurrency(value, row.currency)}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <StatusBadge status={value} />,
  },
];

const Invoices = () => {
  const navigate = useNavigate();

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Data fetching
  const { data: invoices = [], isLoading, error } = useInvoices();

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Status filter
      if (statusFilter !== 'all' && invoice.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const searchableFields = [
          invoice.invoice_number,
          invoice.client?.name,
          invoice.client?.company,
          invoice.client?.email,
        ].filter(Boolean);

        return searchableFields.some((field) =>
          field.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [invoices, statusFilter, search]);

  // Calculate totals for summary
  const summary = useMemo(() => {
    const totals = {
      all: invoices.length,
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      totalOutstanding: 0,
      totalPaid: 0,
    };

    invoices.forEach((inv) => {
      totals[inv.status] = (totals[inv.status] || 0) + 1;
      if (inv.status === 'paid') {
        totals.totalPaid += inv.total || 0;
      } else if (['sent', 'overdue'].includes(inv.status)) {
        totals.totalOutstanding += inv.total || 0;
      }
    });

    return totals;
  }, [invoices]);

  // Tabs with counts
  const tabsWithCounts = STATUS_TABS.map((tab) => ({
    ...tab,
    count: summary[tab.value] || 0,
  }));

  // Handle row click
  const handleRowClick = (invoice) => {
    navigate(`/portal/invoices/${invoice.id}`);
  };

  // Error state
  if (error) {
    return (
      <div className="portal-page">
        <PageHeader title="Invoices" />
        <Card>
          <EmptyState
            icon={InvoiceIcon}
            title="Error loading invoices"
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
    <div className="portal-page portal-invoices">
      <PageHeader
        title="Invoices"
        subtitle={`${summary.totalOutstanding > 0 
          ? `${formatCurrency(summary.totalOutstanding, 'USD')} outstanding` 
          : 'No outstanding invoices'}`}
        actions={
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={() => navigate('/portal/invoices/new')}
          >
            New Invoice
          </Button>
        }
      />

      {/* Filters */}
      <Card padding="none">
        <div className="invoices-filters">
          {/* Status Tabs */}
          <Tabs
            tabs={tabsWithCounts}
            activeTab={statusFilter}
            onChange={setStatusFilter}
          />

          {/* Search */}
          <div className="invoices-filters__search">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredInvoices}
          onRowClick={handleRowClick}
          loading={isLoading}
          emptyState={
            <EmptyState
              icon={InvoiceIcon}
              title={search || statusFilter !== 'all' ? 'No invoices found' : 'No invoices yet'}
              description={
                search || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first invoice to get started.'
              }
              action={
                !search && statusFilter === 'all' && (
                  <Button
                    variant="primary"
                    icon={PlusIcon}
                    onClick={() => navigate('/portal/invoices/new')}
                  >
                    Create Invoice
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

export default Invoices;
