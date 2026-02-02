/**
 * ClientDetail - Single client view
 * 
 * Shows:
 * - Client information
 * - Edit/Delete actions
 * - Client's invoices list
 * - Revenue stats from this client
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Button,
  Card,
  StatusBadge,
  DataTable,
  Modal,
  EmptyState,
  LoadingState,
} from '../../components/portal/common';
import ClientForm from '../../components/portal/clients/ClientForm';
import {
  EditIcon,
  TrashIcon,
  InvoiceIcon,
  PlusIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
} from '../../components/common/Icons';
import {
  useClientWithInvoices,
  useUpdateClient,
  useDeleteClient,
} from '../../hooks/useClients';
import { formatDate, formatCurrency } from '../../lib/formatters';

// Invoice table columns
const invoiceColumns = [
  {
    key: 'invoice_number',
    header: 'Invoice',
  },
  {
    key: 'issue_date',
    header: 'Date',
    render: (value) => formatDate(value),
  },
  {
    key: 'total',
    header: 'Amount',
    render: (value, row) => formatCurrency(value, row.currency),
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <StatusBadge status={value} />,
  },
];

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Data fetching
  const { data: client, isLoading, error } = useClientWithInvoices(id);
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  // Calculate stats
  const stats = client?.invoices
    ? {
        totalInvoices: client.invoices.length,
        totalRevenue: client.invoices
          .filter((inv) => inv.status === 'paid')
          .reduce((sum, inv) => sum + (inv.total || 0), 0),
        pendingAmount: client.invoices
          .filter((inv) => ['sent', 'overdue'].includes(inv.status))
          .reduce((sum, inv) => sum + (inv.total || 0), 0),
      }
    : { totalInvoices: 0, totalRevenue: 0, pendingAmount: 0 };

  // Handle update
  const handleUpdate = async (data) => {
    try {
      await updateClient.mutateAsync({ id, ...data });
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update client:', err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteClient.mutateAsync(id);
      navigate('/portal/clients');
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  };

  // Handle invoice row click
  const handleInvoiceClick = (invoice) => {
    navigate(`/portal/invoices/${invoice.id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="portal-page">
        <LoadingState text="Loading client..." />
      </div>
    );
  }

  // Error state
  if (error || !client) {
    return (
      <div className="portal-page">
        <PageHeader title="Client Not Found" backTo="/portal/clients" />
        <Card>
          <EmptyState
            title="Client not found"
            description="This client may have been deleted or doesn't exist."
            action={
              <Button onClick={() => navigate('/portal/clients')}>
                Back to Clients
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="portal-page portal-client-detail">
      <PageHeader
        title={client.name}
        subtitle={client.company || 'No company'}
        backTo="/portal/clients"
        backLabel="Clients"
        actions={
          <div className="page-header__actions">
            <Button
              variant="secondary"
              icon={EditIcon}
              onClick={() => setShowEditModal(true)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              icon={TrashIcon}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* Client Info & Stats */}
      <div className="client-detail__grid">
        {/* Client Info Card */}
        <Card title="Contact Information" padding="md">
          <div className="client-info">
            <div className="client-info__status">
              <StatusBadge status={client.status} size="lg" />
            </div>

            <div className="client-info__fields">
              {client.email && (
                <div className="client-info__field">
                  <MailIcon size={16} className="client-info__icon" />
                  <a href={`mailto:${client.email}`}>{client.email}</a>
                </div>
              )}

              {client.phone && (
                <div className="client-info__field">
                  <PhoneIcon size={16} className="client-info__icon" />
                  <a href={`tel:${client.phone}`}>{client.phone}</a>
                </div>
              )}

              {client.location && (
                <div className="client-info__field">
                  <MapPinIcon size={16} className="client-info__icon" />
                  <span>{client.location}</span>
                </div>
              )}

              {!client.email && !client.phone && !client.location && (
                <p className="text-muted">No contact information added.</p>
              )}
            </div>

            {client.notes && (
              <div className="client-info__notes">
                <h4>Notes</h4>
                <p>{client.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Stats Card */}
        <Card title="Revenue Summary" padding="md">
          <div className="client-stats">
            <div className="client-stats__item">
              <span className="client-stats__value">
                {formatCurrency(stats.totalRevenue, 'USD')}
              </span>
              <span className="client-stats__label">Total Revenue</span>
            </div>

            <div className="client-stats__item">
              <span className="client-stats__value">
                {formatCurrency(stats.pendingAmount, 'USD')}
              </span>
              <span className="client-stats__label">Pending</span>
            </div>

            <div className="client-stats__item">
              <span className="client-stats__value">{stats.totalInvoices}</span>
              <span className="client-stats__label">Invoices</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices */}
      <Card
        title="Invoices"
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={PlusIcon}
            onClick={() => navigate(`/portal/invoices/new?client=${id}`)}
          >
            New Invoice
          </Button>
        }
        padding="none"
      >
        <DataTable
          columns={invoiceColumns}
          data={client.invoices || []}
          onRowClick={handleInvoiceClick}
          emptyState={
            <EmptyState
              icon={InvoiceIcon}
              title="No invoices yet"
              description="Create an invoice for this client."
              action={
                <Button
                  variant="primary"
                  icon={PlusIcon}
                  onClick={() => navigate(`/portal/invoices/new?client=${id}`)}
                >
                  Create Invoice
                </Button>
              }
            />
          }
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Client"
        size="md"
      >
        <ClientForm
          initialData={client}
          onSubmit={handleUpdate}
          onCancel={() => setShowEditModal(false)}
          isSubmitting={updateClient.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Client"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteClient.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteClient.isPending}
            >
              Delete Client
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{client.name}</strong>?
        </p>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>
          This action cannot be undone. Invoices associated with this client
          will not be deleted but will no longer be linked.
        </p>
      </Modal>
    </div>
  );
};

export default ClientDetail;
