/**
 * PaymentEdit - Edit existing payment
 */

import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, LoadingState, Card, EmptyState, Button } from '../../components/portal/common';
import PaymentForm from '../../components/portal/payments/PaymentForm';
import { usePayment, useUpdatePayment } from '../../hooks/usePayments';

const PaymentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: payment, isLoading, error } = usePayment(id);
  const updatePayment = useUpdatePayment();

  const handleSubmit = async (data) => {
    try {
      await updatePayment.mutateAsync({ id, ...data });
      navigate(`/portal/payments/${id}`);
    } catch (err) {
      console.error('Failed to update payment:', err);
      alert('Failed to update payment: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCancel = () => {
    navigate(`/portal/payments/${id}`);
  };

  if (isLoading) {
    return (
      <div className="portal-page">
        <LoadingState text="Loading payment..." />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="portal-page">
        <PageHeader title="Payment Not Found" backTo="/portal/payments" />
        <Card>
          <EmptyState
            title="Payment not found"
            description="This payment may have been deleted."
            action={<Button onClick={() => navigate('/portal/payments')}>Back to Payments</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="portal-page portal-payment-edit">
      <PageHeader
        title="Edit Payment"
        backTo={`/portal/payments/${id}`}
        backLabel="Payment Details"
      />

      <PaymentForm
        initialData={payment}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updatePayment.isPending}
      />
    </div>
  );
};

export default PaymentEdit;