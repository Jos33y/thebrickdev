/**
 * useFeeRates - Hook for fetching fee rates from Supabase
 *
 * Fee rates are near-static (change quarterly at most), so aggressive caching
 * is safe. Backing table: fee_rates.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const FEE_RATES_KEY = ['fee_rates'];

/**
 * Fetch all active fee rates.
 */
const fetchFeeRates = async () => {
  const { data, error } = await supabase
    .from('fee_rates')
    .select('*')
    .eq('is_active', true)
    .order('provider', { ascending: true })
    .order('currency', { ascending: true })
    .order('payment_method', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Hook: Get all active fee rates
 */
export function useFeeRates(options = {}) {
  return useQuery({
    queryKey: FEE_RATES_KEY,
    queryFn: fetchFeeRates,
    staleTime: 1000 * 60 * 60, // 1 hour — rates change rarely
    refetchOnWindowFocus: false,
    ...options,
  });
}

export default useFeeRates;
