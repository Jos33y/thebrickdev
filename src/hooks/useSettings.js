/**
 * useSettings - Hook for managing portal settings
 * 
 * Handles:
 * - Fetching settings
 * - Updating settings
 * - Single-row pattern (settings table has only one row)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Fetch settings (single row)
const fetchSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single();

  if (error) {
    // If no settings exist yet, return defaults
    if (error.code === 'PGRST116') {
      return {
        company_name: 'The Brick Dev Studios',
        company_email: 'hello@thebrickdev.com',
        company_phone: '',
        company_address: '',
        company_city: '',
        company_country: 'Nigeria',
        tax_id: '',
        logo_url: '',
        default_currency: 'USD',
        default_payment_terms: 'net_15',
        invoice_prefix: 'BRK',
        invoice_notes_template: 'Thank you for your business!',
        monthly_income_target: 5000.00,
        monthly_income_currency: 'USD',
        savings_goal: 20000.00,
        savings_goal_currency: 'USD',
        goal_target_date: null,
      };
    }
    throw error;
  }

  return data;
};

// Update settings
const updateSettings = async (updates) => {
  // First, check if settings row exists
  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .single();

  if (existing?.id) {
    // Update existing row
    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert new row (first time setup)
    const { data, error } = await supabase
      .from('settings')
      .insert(updates)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

/**
 * Hook: useSettings
 * Fetches portal settings
 */
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook: useUpdateSettings
 * Updates portal settings
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
    },
  });
};

/**
 * Hook: useChangePassword
 * Changes user password via Supabase Auth
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({ newPassword }) => {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return data;
    },
  });
};

export default useSettings;