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

// Dashboard hooks
export { 
  useDashboard,
  convertCurrency 
} from './useDashboard';

// Settings hooks
export {
  useSettings,
  useUpdateSettings,
  useChangePassword,
} from './useSettings';

// Settings-integrated helpers
export { useInvoiceDefaults } from './useInvoiceDefaults';
export { useCompanyInfo, getCompanyInfo } from './useCompanyInfo';