/**
 * InvoiceEdit - Edit existing invoice page
 */

import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, LoadingState, Card, EmptyState, Button } from '../../components/portal/common';
import InvoiceForm from '../../components/portal/invoices/InvoiceForm';
import { useInvoice, useUpdateInvoice } from '../../hooks/useInvoices';

const InvoiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch invoice
  const { data: invoice, isLoading, error } = useInvoice(id);
  const updateInvoice = useUpdateInvoice();

  const handleSubmit = async (data) => {
    try {
      await updateInvoice.mutateAsync({ id, ...data });
      navigate(`/portal/invoices/${id}`);
    } catch (err) {
      console.error('Failed to update invoice:', err);
    }
  };

  const handleCancel = () => {
    navigate(`/portal/invoices/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="portal-page">
        <LoadingState text="Loading invoice..." />
      </div>
    );
  }

  // Error or not found
  if (error || !invoice) {
    return (
      <div className="portal-page">
        <PageHeader title="Invoice Not Found" backTo="/portal/invoices" />
        <Card>
          <EmptyState
            title="Invoice not found"
            description="This invoice may have been deleted or doesn't exist."
            action={
              <Button onClick={() => navigate('/portal/invoices')}>
                Back to Invoices
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Can only edit drafts
  if (invoice.status !== 'draft') {
    return (
      <div className="portal-page">
        <PageHeader 
          title="Cannot Edit Invoice" 
          backTo={`/portal/invoices/${id}`}
          backLabel="Back to Invoice"
        />
        <Card>
          <EmptyState
            title="Invoice cannot be edited"
            description="Only draft invoices can be edited. This invoice has already been sent or paid."
            action={
              <Button onClick={() => navigate(`/portal/invoices/${id}`)}>
                View Invoice
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="portal-page portal-invoice-edit">
      <PageHeader
        title={`Edit ${invoice.invoice_number}`}
        subtitle="Make changes to your draft invoice"
        backTo={`/portal/invoices/${id}`}
        backLabel="Back to Invoice"
      />

      <InvoiceForm
        initialData={invoice}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateInvoice.isPending}
      />
    </div>
  );
};

export default InvoiceEdit;
