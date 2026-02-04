/**
 * Hooks Index
 * 
 * All custom hooks for the portal.
 * NO DUPLICATE EXPORTS - each function exported from ONE file only.
 */

// Authentication
export { default as useAuth, useUser, useSignOut } from './useAuth';

// Clients
export { 
  default as useClients, 
  useClient, 
  useCreateClient, 
  useUpdateClient, 
  useDeleteClient 
} from './useClients';

// Invoices
export { 
  default as useInvoices, 
  useInvoice, 
  useCreateInvoice, 
  useUpdateInvoice, 
  useDeleteInvoice,
  useUpdateInvoiceStatus 
} from './useInvoices';

// Payments
export { 
  default as usePayments, 
  usePayment, 
  useCreatePayment, 
  useUpdatePayment, 
  useDeletePayment 
} from './usePayments';

// Prospects
export { 
  default as useProspects,
  useProspect,
  useProspectsByStage,
  useCreateProspect,
  useUpdateProspect,
  useDeleteProspect,
  useUpdateProspectStage,
  useAddProspectActivity,
  useConvertToClient,
} from './useProspects';

// Email Templates (CRUD only)
export {
  default as useEmailTemplates,
  useTemplatesForProspect,
  useAllEmailTemplates,
  useEmailTemplate,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  buildTemplateVariables,
  replaceTemplateVariables,
  getSuggestedTemplate,
} from './useEmailTemplates';

// Email Sending (separate from templates)
export { useSendProspectEmail } from './useSendProspectEmail';

// Analytics
export { default as useProspectAnalytics } from './useProspectAnalytics';

// Dashboard
export { default as useDashboard } from './useDashboard';

// Settings
export { 
  default as useSettings, 
  useUpdateSettings,
  useChangePassword 
} from './useSettings';

// Settings integration hooks
export { default as useInvoiceDefaults } from './useInvoiceDefaults';
export { default as useCompanyInfo } from './useCompanyInfo';

// Invoice sending
export { default as useSendInvoice } from './useSendInvoice';