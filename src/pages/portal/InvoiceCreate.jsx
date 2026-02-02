/**
 * InvoiceCreate - Create new invoice page
 */

import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/portal/common';
import InvoiceForm from '../../components/portal/invoices/InvoiceForm';
import { useCreateInvoice } from '../../hooks/useInvoices';

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client') || null;

  const createInvoice = useCreateInvoice();

  const handleSubmit = async (data) => {
    try {
      const invoice = await createInvoice.mutateAsync(data);
      navigate(`/portal/invoices/${invoice.id}`);
    } catch (err) {
      console.error('Failed to create invoice:', err);
      // Error handling could be improved with toast notifications
    }
  };

  const handleCancel = () => {
    navigate('/portal/invoices');
  };

  return (
    <div className="portal-page portal-invoice-create">
      <PageHeader
        title="New Invoice"
        subtitle="Create a new invoice for your client"
        backTo="/portal/invoices"
        backLabel="Invoices"
      />

      <InvoiceForm
        preselectedClientId={preselectedClientId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createInvoice.isPending}
      />
    </div>
  );
};

export default InvoiceCreate;
