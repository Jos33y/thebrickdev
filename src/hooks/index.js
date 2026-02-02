/**
 * Custom Hooks
 * 
 * Reusable hooks for data fetching, auth, and common logic.
 */

export { useAuth } from './useAuth';

// Client hooks
export {
  useClients,
  useClient,
  useClientWithInvoices,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from './useClients';

// Invoice hooks
export {
  useInvoices,
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useUpdateInvoiceStatus,
} from './useInvoices';

// Payment hooks
export {
  usePayments,
  usePayment,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
  useUpdatePaymentStatus,
} from './usePayments';

// Email hooks
export { useSendInvoice } from './useSendInvoice';

// Future hooks (uncomment as implemented):
// export { useDashboard } from './useDashboard';
