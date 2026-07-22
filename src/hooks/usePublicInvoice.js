/**
 * usePublicInvoice
 *
 * Fetches a public invoice by its public_token using the get_invoice_by_token
 * Supabase RPC. This RPC runs with SECURITY DEFINER so anon role can call it
 * without exposing the underlying tables via RLS.
 *
 * The RPC returns:
 *   {
 *     invoice: {...},
 *     client: {...},
 *     items: [...],
 *     payments: [...],
 *     company: { company_name, company_email, company_website, ... }
 *   }
 *
 * This hook flattens client + items + payments back onto the invoice object
 * so it can be passed straight to <InvoicePreview /> or <InvoicePDF />.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function fetchPublicInvoice(token) {
  const { data, error } = await supabase.rpc('get_invoice_by_token', {
    p_token: token,
  });

  if (error) throw error;
  if (!data) return null;

  // Reshape so InvoicePreview + InvoicePDF can consume it identically to the portal shape
  return {
    invoice: {
      ...data.invoice,
      client: data.client,
      items: data.items || [],
      payments: data.payments || [],
    },
    company: data.company || {},
  };
}

export function usePublicInvoice(token) {
  return useQuery({
    queryKey: ['publicInvoice', token],
    queryFn: () => fetchPublicInvoice(token),
    enabled: Boolean(token),
    retry: 1,
    staleTime: 30_000, // 30s - allow refetch after payment redirect
  });
}

export default usePublicInvoice;
