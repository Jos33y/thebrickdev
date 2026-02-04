/**
 * useProspects - Hook for prospect/pipeline data operations
 * 
 * Manages prospects through the sales pipeline:
 * - CRUD operations
 * - Stage management
 * - Activity logging
 * - Follow-up tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Query keys
const PROSPECTS_KEY = ['prospects'];
const prospectKey = (id) => ['prospects', id];

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

/**
 * Fetch all prospects with activity count
 */
const fetchProspects = async () => {
  const { data, error } = await supabase
    .from('prospects')
    .select(`
      *,
      activities:prospect_activities(count)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform activity count
  return data.map(p => ({
    ...p,
    activity_count: p.activities?.[0]?.count || 0
  }));
};

/**
 * Fetch single prospect with activities
 */
const fetchProspect = async (id) => {
  // Fetch prospect
  const { data: prospect, error: prospectError } = await supabase
    .from('prospects')
    .select('*')
    .eq('id', id)
    .single();

  if (prospectError) throw prospectError;

  // Fetch activities
  const { data: activities, error: activitiesError } = await supabase
    .from('prospect_activities')
    .select('*')
    .eq('prospect_id', id)
    .order('created_at', { ascending: false });

  if (activitiesError) throw activitiesError;

  return { ...prospect, activities };
};

/**
 * Fetch prospects by stage (for pipeline view)
 */
const fetchProspectsByStage = async () => {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Group by stage
  const stages = {
    identified: [],
    contacted: [],
    replied: [],
    call_scheduled: [],
    proposal_sent: [],
    negotiating: [],
    won: [],
    lost: [],
    no_response: [],
  };

  data.forEach(prospect => {
    if (stages[prospect.stage]) {
      stages[prospect.stage].push(prospect);
    }
  });

  return stages;
};

// =============================================================================
// MUTATION FUNCTIONS
// =============================================================================

/**
 * Create a new prospect
 */
const createProspect = async (prospectData) => {
  const { data, error } = await supabase
    .from('prospects')
    .insert([prospectData])
    .select()
    .single();

  if (error) throw error;

  // Create initial activity
  await supabase.from('prospect_activities').insert([{
    prospect_id: data.id,
    activity_type: 'note',
    description: `Prospect added from ${prospectData.source || 'unknown source'}`
  }]);

  return data;
};

/**
 * Update a prospect
 */
const updateProspect = async ({ id, ...prospectData }) => {
  const { data, error } = await supabase
    .from('prospects')
    .update(prospectData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a prospect
 */
const deleteProspect = async (id) => {
  const { error } = await supabase
    .from('prospects')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return id;
};

/**
 * Update prospect stage
 */
const updateProspectStage = async ({ id, stage, notes }) => {
  const updates = { 
    stage,
    last_contacted_at: new Date().toISOString()
  };
  
  // If won, mark outcome
  if (stage === 'won' && notes) {
    updates.outcome_reason = notes;
  }
  
  // If lost or no_response, mark outcome
  if ((stage === 'lost' || stage === 'no_response') && notes) {
    updates.outcome_reason = notes;
  }

  const { data, error } = await supabase
    .from('prospects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Add activity to prospect
 */
const addProspectActivity = async ({ prospectId, activityType, description }) => {
  const { data, error } = await supabase
    .from('prospect_activities')
    .insert([{
      prospect_id: prospectId,
      activity_type: activityType,
      description
    }])
    .select()
    .single();

  if (error) throw error;

  // Update last_contacted_at for contact activities
  const contactTypes = ['email_sent', 'call', 'message_sent', 'meeting'];
  if (contactTypes.includes(activityType)) {
    await supabase
      .from('prospects')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', prospectId);
  }

  return data;
};

/**
 * Convert prospect to client
 */
const convertToClient = async ({ prospectId, clientData }) => {
  // Create client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert([{ ...clientData, status: 'active' }])
    .select()
    .single();

  if (clientError) throw clientError;

  // Update prospect
  const { error: prospectError } = await supabase
    .from('prospects')
    .update({
      stage: 'won',
      converted_client_id: client.id,
      outcome_reason: 'Converted to client'
    })
    .eq('id', prospectId);

  if (prospectError) throw prospectError;

  return client;
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook: Get all prospects
 */
export function useProspects(options = {}) {
  return useQuery({
    queryKey: PROSPECTS_KEY,
    queryFn: fetchProspects,
    ...options,
  });
}

/**
 * Hook: Get single prospect with activities
 */
export function useProspect(id, options = {}) {
  return useQuery({
    queryKey: prospectKey(id),
    queryFn: () => fetchProspect(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook: Get prospects grouped by stage (for pipeline/kanban)
 */
export function useProspectsByStage(options = {}) {
  return useQuery({
    queryKey: [...PROSPECTS_KEY, 'by-stage'],
    queryFn: fetchProspectsByStage,
    ...options,
  });
}

/**
 * Hook: Create prospect
 */
export function useCreateProspect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProspect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECTS_KEY });
    },
  });
}

/**
 * Hook: Update prospect
 */
export function useUpdateProspect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProspect,
    onSuccess: (data) => {
      queryClient.setQueryData(prospectKey(data.id), (old) => ({
        ...old,
        ...data,
      }));
      queryClient.invalidateQueries({ queryKey: PROSPECTS_KEY });
    },
  });
}

/**
 * Hook: Delete prospect
 */
export function useDeleteProspect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProspect,
    onSuccess: (deletedId) => {
      queryClient.removeQueries({ queryKey: prospectKey(deletedId) });
      queryClient.invalidateQueries({ queryKey: PROSPECTS_KEY });
    },
  });
}

/**
 * Hook: Update prospect stage
 */
export function useUpdateProspectStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProspectStage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: prospectKey(data.id) });
      queryClient.invalidateQueries({ queryKey: PROSPECTS_KEY });
    },
  });
}

/**
 * Hook: Add activity
 */
export function useAddProspectActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProspectActivity,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: prospectKey(data.prospect_id) });
      queryClient.invalidateQueries({ queryKey: PROSPECTS_KEY });
    },
  });
}

/**
 * Hook: Convert to client
 */
export function useConvertToClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: convertToClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export default useProspects;