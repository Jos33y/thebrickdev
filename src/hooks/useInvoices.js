/**
 * useInvoices - Hook for invoice data operations
 * 
 * Uses TanStack Query for caching and mutations.
 * Handles invoices, line items, and related calculations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Query keys
const INVOICES_KEY = ['invoices'];
const invoiceKey = (id) => ['invoices', id];

/**
 * Fetch all invoices with client info
 */
const fetchInvoices = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(id, name, company, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Fetch single invoice with client and line items
 */
const fetchInvoice = async (id) => {
  // Fetch invoice with client
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(id, name, company, email, phone, location)
    `)
    .eq('id', id)
    .single();

  if (invoiceError) throw invoiceError;

  // Fetch line items
  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', id)
    .order('sort_order', { ascending: true });

  if (itemsError) throw itemsError;

  // Fetch payments
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', id)
    .order('received_date', { ascending: false });

  if (paymentsError) throw paymentsError;

  return { ...invoice, items, payments };
};

/**
 * Generate next invoice number
 */
const generateInvoiceNumber = async () => {
  const { data, error } = await supabase.rpc('generate_invoice_number');
  if (error) throw error;
  return data;
};

/**
 * Create a new invoice with line items
 */
const createInvoice = async ({ items, ...invoiceData }) => {
  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert([{ ...invoiceData, invoice_number: invoiceNumber }])
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // Create line items if provided
  if (items && items.length > 0) {
    const itemsWithInvoiceId = items.map((item, index) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      sort_order: index,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId);

    if (itemsError) throw itemsError;

    // Recalculate totals
    await supabase.rpc('calculate_invoice_totals', { invoice_uuid: invoice.id });
  }

  // Fetch and return complete invoice
  return fetchInvoice(invoice.id);
};

/**
 * Update an existing invoice
 */
const updateInvoice = async ({ id, items, ...invoiceData }) => {
  // Update invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update(invoiceData)
    .eq('id', id);

  if (invoiceError) throw invoiceError;

  // If items provided, replace all line items
  if (items !== undefined) {
    // Delete existing items
    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);

    if (deleteError) throw deleteError;

    // Insert new items
    if (items.length > 0) {
      const itemsWithInvoiceId = items.map((item, index) => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price,
        sort_order: index,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;
    }

    // Recalculate totals
    await supabase.rpc('calculate_invoice_totals', { invoice_uuid: id });
  }

  // Fetch and return updated invoice
  return fetchInvoice(id);
};

/**
 * Delete an invoice (only drafts)
 */
const deleteInvoice = async (id) => {
  // Check if invoice is draft
  const { data: invoice, error: checkError } = await supabase
    .from('invoices')
    .select('status')
    .eq('id', id)
    .single();

  if (checkError) throw checkError;

  if (invoice.status !== 'draft') {
    throw new Error('Only draft invoices can be deleted');
  }

  // Delete invoice (cascade will delete items)
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return id;
};

/**
 * Update invoice status
 */
const updateInvoiceStatus = async ({ id, status }) => {
  const updates = { status };
  
  // Add timestamp for sent status
  if (status === 'sent') {
    updates.sent_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Hook: Get all invoices
 */
export function useInvoices(options = {}) {
  return useQuery({
    queryKey: INVOICES_KEY,
    queryFn: fetchInvoices,
    ...options,
  });
}

/**
 * Hook: Get single invoice with items and payments
 */
export function useInvoice(id, options = {}) {
  return useQuery({
    queryKey: invoiceKey(id),
    queryFn: () => fetchInvoice(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook: Create invoice mutation
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}

/**
 * Hook: Update invoice mutation
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (data) => {
      queryClient.setQueryData(invoiceKey(data.id), data);
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}

/**
 * Hook: Delete invoice mutation
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: (deletedId) => {
      queryClient.removeQueries({ queryKey: invoiceKey(deletedId) });
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}

/**
 * Hook: Update invoice status
 */
export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoiceStatus,
    onSuccess: (data) => {
      queryClient.setQueryData(invoiceKey(data.id), (old) => ({
        ...old,
        ...data,
      }));
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}

export default useInvoices;
