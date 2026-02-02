/**
 * Clients - Client list page
 * 
 * Shows:
 * - Client list with search
 * - Status filter tabs
 * - Add new client modal
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
  Modal,
  EmptyState,
} from '../../components/portal/common';
import ClientForm from '../../components/portal/clients/ClientForm';
import { PlusIcon, ClientsIcon } from '../../components/common/Icons';
import { useClients, useCreateClient } from '../../hooks/useClients';
import { formatRelativeTime } from '../../lib/formatters';

// Status tabs configuration
const STATUS_TABS = [
  { value: 'all', label: 'All Clients' },
  { value: 'active', label: 'Active' },
  { value: 'prospect', label: 'Prospects' },
  { value: 'past', label: 'Past' },
  { value: 'lost', label: 'Lost' },
];

// Table columns
const columns = [
  {
    key: 'name',
    header: 'Name',
    render: (value, row) => (
      <div className="client-name-cell">
        <span className="client-name-cell__name">{value}</span>
        {row.company && (
          <span className="client-name-cell__company">{row.company}</span>
        )}
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (value) => value || <span className="text-muted">—</span>,
  },
  {
    key: 'location',
    header: 'Location',
    render: (value) => value || <span className="text-muted">—</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: 'created_at',
    header: 'Added',
    render: (value) => formatRelativeTime(value),
  },
];

const Clients = () => {
  const navigate = useNavigate();
  
  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Data fetching
  const { data: clients = [], isLoading, error } = useClients();
  const createClient = useCreateClient();

  // Filter clients by search and status
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Status filter
      if (statusFilter !== 'all' && client.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const searchableFields = [
          client.name,
          client.company,
          client.email,
          client.location,
        ].filter(Boolean);

        return searchableFields.some((field) =>
          field.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [clients, statusFilter, search]);

  // Count clients by status for tabs
  const statusCounts = useMemo(() => {
    const counts = { all: clients.length };
    STATUS_TABS.slice(1).forEach((tab) => {
      counts[tab.value] = clients.filter((c) => c.status === tab.value).length;
    });
    return counts;
  }, [clients]);

  // Tabs with counts
  const tabsWithCounts = STATUS_TABS.map((tab) => ({
    ...tab,
    count: statusCounts[tab.value] || 0,
  }));

  // Handle create client
  const handleCreateClient = async (data) => {
    try {
      await createClient.mutateAsync(data);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create client:', err);
      // Error handling could be improved with toast notifications
    }
  };

  // Handle row click
  const handleRowClick = (client) => {
    navigate(`/portal/clients/${client.id}`);
  };

  // Error state
  if (error) {
    return (
      <div className="portal-page">
        <PageHeader title="Clients" />
        <Card>
          <EmptyState
            icon={ClientsIcon}
            title="Error loading clients"
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
    <div className="portal-page portal-clients">
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} total client${clients.length !== 1 ? 's' : ''}`}
        actions={
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={() => setShowCreateModal(true)}
          >
            Add Client
          </Button>
        }
      />

      {/* Filters */}
      <Card padding="none">
        <div className="clients-filters">
          {/* Status Tabs */}
          <Tabs
            tabs={tabsWithCounts}
            activeTab={statusFilter}
            onChange={setStatusFilter}
          />

          {/* Search */}
          <div className="clients-filters__search">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredClients}
          onRowClick={handleRowClick}
          loading={isLoading}
          emptyState={
            <EmptyState
              icon={ClientsIcon}
              title={search || statusFilter !== 'all' ? 'No clients found' : 'No clients yet'}
              description={
                search || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by adding your first client.'
              }
              action={
                !search && statusFilter === 'all' && (
                  <Button
                    variant="primary"
                    icon={PlusIcon}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Add Client
                  </Button>
                )
              }
            />
          }
        />
      </Card>

      {/* Create Client Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Client"
        size="md"
      >
        <ClientForm
          onSubmit={handleCreateClient}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={createClient.isPending}
        />
      </Modal>
    </div>
  );
};

export default Clients;