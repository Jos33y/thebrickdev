/**
 * PaymentCreate - Create new payment page
 * 
 * Follows the exact pattern from InvoiceCreate.
 */

import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/portal/common';
import PaymentForm from '../../components/portal/payments/PaymentForm';
import { useCreatePayment } from '../../hooks/usePayments';

const PaymentCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInvoiceId = searchParams.get('invoice') || null;

  const createPayment = useCreatePayment();

  const handleSubmit = async (data) => {
    try {
      console.log('PaymentCreate handleSubmit:', data);
      const payment = await createPayment.mutateAsync(data);
      console.log('Payment created successfully:', payment);
      navigate(`/portal/payments/${payment.id}`);
    } catch (err) {
      console.error('Failed to create payment:', err);
      alert('Failed to create payment: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCancel = () => {
    navigate('/portal/payments');
  };

  return (
    <div className="portal-page portal-payment-create">
      <PageHeader
        title="Record Payment"
        subtitle="Record a payment received from a client"
        backTo="/portal/payments"
        backLabel="Payments"
      />

      <PaymentForm
        preselectedInvoiceId={preselectedInvoiceId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createPayment.isPending}
      />
    </div>
  );
};

export default PaymentCreate;