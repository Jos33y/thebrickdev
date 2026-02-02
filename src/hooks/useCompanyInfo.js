/**
 * useCompanyInfo - Hook to get company info from Settings
 * 
 * Returns company details for:
 * - PDF generation (header, footer)
 * - Email templates
 * - Invoice display
 * 
 * Use instead of hardcoded COMPANY_INFO constant
 */

import { useSettings } from './useSettings';

// Fallback defaults if settings not available
const FALLBACK_COMPANY = {
  name: 'My Business',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  website: '',
  taxId: '',
  logoUrl: '',
};

/**
 * Hook: useCompanyInfo
 * Returns company information from Settings
 */
export function useCompanyInfo() {
  const { data: settings, isLoading } = useSettings();

  const company = {
    name: settings?.company_name || FALLBACK_COMPANY.name,
    email: settings?.company_email || FALLBACK_COMPANY.email,
    phone: settings?.company_phone || FALLBACK_COMPANY.phone,
    address: settings?.company_address || FALLBACK_COMPANY.address,
    city: settings?.company_city || FALLBACK_COMPANY.city,
    country: settings?.company_country || FALLBACK_COMPANY.country,
    website: settings?.company_website || FALLBACK_COMPANY.website,
    taxId: settings?.tax_id || FALLBACK_COMPANY.taxId,
    logoUrl: settings?.logo_url || FALLBACK_COMPANY.logoUrl,
  };

  // Full address formatted
  const fullAddress = [
    company.address,
    company.city,
    company.country,
  ].filter(Boolean).join(', ');

  return {
    company,
    fullAddress,
    isLoading,
    hasCompanyInfo: !!settings?.company_name,
  };
}

/**
 * Sync function to get company info (for non-React contexts like PDF generation)
 * Use with caution - returns defaults if DB call fails
 */
export async function getCompanyInfo(supabase) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('company_name, company_email, company_phone, company_address, company_city, company_country, company_website, tax_id, logo_url')
      .single();

    if (error) throw error;

    return {
      name: data.company_name || FALLBACK_COMPANY.name,
      email: data.company_email || FALLBACK_COMPANY.email,
      phone: data.company_phone || FALLBACK_COMPANY.phone,
      address: data.company_address || FALLBACK_COMPANY.address,
      city: data.company_city || FALLBACK_COMPANY.city,
      country: data.company_country || FALLBACK_COMPANY.country,
      website: data.company_website || FALLBACK_COMPANY.website,
      taxId: data.tax_id || FALLBACK_COMPANY.taxId,
      logoUrl: data.logo_url || FALLBACK_COMPANY.logoUrl,
    };
  } catch (err) {
    console.warn('Could not fetch company info, using defaults:', err);
    return FALLBACK_COMPANY;
  }
}

export default useCompanyInfo;