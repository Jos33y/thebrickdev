/**
 * useClients - Hook for client data operations
 * 
 * Uses TanStack Query for caching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Query keys
const CLIENTS_KEY = ['clients'];
const clientKey = (id) => ['clients', id];

/**
 * Fetch all clients
 */
const fetchClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Fetch single client by ID
 */
const fetchClient = async (id) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetch client with their invoices
 */
const fetchClientWithInvoices = async (id) => {
  // Fetch client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (clientError) throw clientError;

  // Fetch client's invoices
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false });

  if (invoicesError) throw invoicesError;

  return { ...client, invoices };
};

/**
 * Create a new client
 */
const createClient = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update an existing client
 */
const updateClient = async ({ id, ...clientData }) => {
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a client
 */
const deleteClient = async (id) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return id;
};

/**
 * Hook: Get all clients
 */
export function useClients(options = {}) {
  return useQuery({
    queryKey: CLIENTS_KEY,
    queryFn: fetchClients,
    ...options,
  });
}

/**
 * Hook: Get single client
 */
export function useClient(id, options = {}) {
  return useQuery({
    queryKey: clientKey(id),
    queryFn: () => fetchClient(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook: Get client with invoices
 */
export function useClientWithInvoices(id, options = {}) {
  return useQuery({
    queryKey: [...clientKey(id), 'invoices'],
    queryFn: () => fetchClientWithInvoices(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook: Create client mutation
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      // Invalidate clients list to refetch
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
    },
  });
}

/**
 * Hook: Update client mutation
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (data) => {
      // Update the specific client in cache
      queryClient.setQueryData(clientKey(data.id), data);
      // Invalidate clients list
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
    },
  });
}

/**
 * Hook: Delete client mutation
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: clientKey(deletedId) });
      // Invalidate clients list
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
    },
  });
}

export default useClients;
