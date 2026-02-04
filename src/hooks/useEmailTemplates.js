/**
 * useEmailTemplates - Email template management
 * 
 * This file handles template CRUD operations ONLY.
 * Email sending is handled by useSendProspectEmail.js
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ============================================================================
// TEMPLATE CRUD HOOKS
// ============================================================================

/**
 * Fetch all active email templates, optionally filtered by source
 */
export function useEmailTemplates(sourceFilter = null) {
  return useQuery({
    queryKey: ['emailTemplates', sourceFilter],
    queryFn: async () => {
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (sourceFilter) {
        query = query.or(`source_filter.eq.${sourceFilter},source_filter.is.null`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Fetch templates for a specific prospect (filters by source)
 */
export function useTemplatesForProspect(prospect) {
  return useEmailTemplates(prospect?.source || null);
}

/**
 * Fetch all email templates (including inactive) for management
 */
export function useAllEmailTemplates() {
  return useQuery({
    queryKey: ['emailTemplates', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Fetch single email template
 */
export function useEmailTemplate(id) {
  return useQuery({
    queryKey: ['emailTemplate', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Create email template
 */
export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateData) => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert(templateData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    },
  });
}

/**
 * Update email template
 */
export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...templateData }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      queryClient.invalidateQueries({ queryKey: ['emailTemplate', data.id] });
    },
  });
}

/**
 * Delete email template
 */
export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    },
  });
}

// ============================================================================
// TEMPLATE VARIABLE HELPERS
// ============================================================================

/**
 * Build variables object from prospect and settings
 */
export function buildTemplateVariables(prospect, settings) {
  return {
    prospect_name: prospect?.name?.split(' ')[0] || '',
    prospect_full_name: prospect?.name || '',
    company: prospect?.company || prospect?.name || '',
    source: formatSource(prospect?.source) || '',
    source_url: prospect?.source_url || '',
    my_name: settings?.owner_name || 'Joseey',
    my_company: settings?.company_name || 'The Brick Dev Studios',
    my_email: settings?.company_email || 'hello@thebrickdev.com',
    my_phone: settings?.company_phone || '',
  };
}

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(text, variables) {
  if (!text) return '';
  
  let result = text;
  
  // Handle both formats: variables object or {prospect, settings} object
  const vars = variables.prospect_name !== undefined 
    ? variables 
    : buildTemplateVariables(variables.prospect, variables.settings || variables);
  
  Object.entries(vars).forEach(([key, value]) => {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value || '');
  });
  
  return result;
}

/**
 * Format source for display
 */
function formatSource(source) {
  const sources = {
    craigslist: 'Craigslist',
    google_maps: 'Google Maps',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    upwork: 'Upwork',
    fiverr: 'Fiverr',
    referral: 'Referral',
    website: 'Website',
    cold_outreach: 'Cold Outreach',
    other: 'Other',
  };
  return sources[source] || source || '';
}

/**
 * Get suggested template based on prospect stage and source
 */
export function getSuggestedTemplate(templates, stage, source) {
  if (!templates || templates.length === 0) return null;
  
  const stageToType = {
    'identified': 'initial_outreach',
    'contacted': 'follow_up_1',
    'replied': 'proposal',
    'call_scheduled': 'proposal',
    'proposal_sent': 'follow_up_1',
    'negotiating': 'custom',
  };
  
  const suggestedType = stageToType[stage] || 'custom';
  
  // Try source-specific template first
  if (source && suggestedType === 'initial_outreach') {
    const sourceTemplate = templates.find(
      t => t.template_type === suggestedType && t.source_filter === source
    );
    if (sourceTemplate) return sourceTemplate;
  }
  
  // Generic template of that type
  const genericTemplate = templates.find(
    t => t.template_type === suggestedType && !t.source_filter
  );
  if (genericTemplate) return genericTemplate;
  
  // Any template of that type
  const anyTemplate = templates.find(t => t.template_type === suggestedType);
  if (anyTemplate) return anyTemplate;
  
  // Fallback to custom
  return templates.find(t => t.template_type === 'custom') || templates[0];
}

export default useEmailTemplates;