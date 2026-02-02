/**
 * usePayments - Hook for payment data operations
 * 
 * Matches the working pattern from useInvoices/useClients.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Query keys
const PAYMENTS_KEY = ['payments'];
const paymentKey = (id) => ['payments', id];

/**
 * Fetch all payments with invoice info
 */
const fetchPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      invoice:invoices(id, invoice_number, total, currency, client:clients(id, name, company))
    `)
    .order('received_date', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Fetch single payment with details
 */
const fetchPayment = async (id) => {
  // Fetch payment with invoice
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select(`
      *,
      invoice:invoices(id, invoice_number, total, currency, client:clients(id, name, company))
    `)
    .eq('id', id)
    .single();

  if (paymentError) throw paymentError;

  // Fetch type-specific details
  let details = null;

  if (payment.payment_type === 'bank') {
    const { data } = await supabase
      .from('payment_bank_details')
      .select('*')
      .eq('payment_id', id)
      .maybeSingle();
    details = data;
  } else if (payment.payment_type === 'platform') {
    const { data } = await supabase
      .from('payment_platform_details')
      .select('*')
      .eq('payment_id', id)
      .maybeSingle();
    details = data;
  } else if (payment.payment_type === 'crypto') {
    const { data } = await supabase
      .from('payment_crypto_details')
      .select('*')
      .eq('payment_id', id)
      .maybeSingle();
    details = data;
  }

  return { ...payment, details };
};

/**
 * Create a new payment with type-specific details
 */
const createPayment = async ({ details, ...paymentData }) => {
  console.log('Creating payment:', paymentData);
  console.log('With details:', details);

  // Create payment
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert([paymentData])
    .select()
    .single();

  if (paymentError) {
    console.error('Payment insert error:', paymentError);
    throw paymentError;
  }

  console.log('Payment created:', payment);

  // Create type-specific details if provided
  if (details && payment.payment_type) {
    const detailsTable = `payment_${payment.payment_type}_details`;
    const detailsData = { payment_id: payment.id, ...details };
    
    console.log(`Inserting into ${detailsTable}:`, detailsData);
    
    const { error: detailsError } = await supabase
      .from(detailsTable)
      .insert([detailsData]);

    if (detailsError) {
      console.error('Details insert error:', detailsError);
      throw detailsError;
    }
  }

  return payment;
};

/**
 * Update a payment
 */
const updatePayment = async ({ id, details, ...paymentData }) => {
  // Update payment
  const { error: paymentError } = await supabase
    .from('payments')
    .update(paymentData)
    .eq('id', id);

  if (paymentError) throw paymentError;

  // Update type-specific details if provided
  if (details && paymentData.payment_type) {
    const detailsTable = `payment_${paymentData.payment_type}_details`;
    
    // Delete old details and insert new
    await supabase.from(detailsTable).delete().eq('payment_id', id);
    
    const { error: detailsError } = await supabase
      .from(detailsTable)
      .insert([{ payment_id: id, ...details }]);

    if (detailsError) throw detailsError;
  }

  return fetchPayment(id);
};

/**
 * Delete a payment
 */
const deletePayment = async (id) => {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return id;
};

/**
 * Update payment status
 */
const updatePaymentStatus = async ({ id, status, cleared_date }) => {
  const updateData = { status };
  if (status === 'cleared' && cleared_date) {
    updateData.cleared_date = cleared_date;
  }
  
  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =============================================================================
// HOOKS
// =============================================================================

export function usePayments(options = {}) {
  return useQuery({
    queryKey: PAYMENTS_KEY,
    queryFn: fetchPayments,
    ...options,
  });
}

export function usePayment(id, options = {}) {
  return useQuery({
    queryKey: paymentKey(id),
    queryFn: () => fetchPayment(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKey(data.id) });
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePayment,
    onSuccess: (deletedId) => {
      queryClient.removeQueries({ queryKey: paymentKey(deletedId) });
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKey(data.id) });
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export default usePayments;