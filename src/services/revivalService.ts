import { supabase, Revival } from '../lib/supabase';

export const revivalService = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('revivals')
      .select('*, profiles(*)')
      .eq('project_id', projectId)
      .order('blessing_count', { ascending: false });

    if (error) throw error;
    return data as Revival[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('revivals')
      .select('*, profiles!revivals_reviver_id_fkey(*), projects(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Revival | null;
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('revivals')
      .select('*, projects(*)')
      .eq('reviver_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Revival[];
  },

  async create(revival: {
    project_id: string;
    title: string;
    description: string;
    explanation_uri?: string;
    deployed_url?: string;
    github_url?: string;
    reviver_id?: string;
  }) {
    const { data, error } = await supabase
      .from('revivals')
      .insert(revival)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bless(revivalId: string) {
    const { data, error } = await supabase.rpc('increment_revival_blessings', {
      revival_id: revivalId,
    });

    if (error) throw error;
    return data;
  },

  async update(revivalId: string, updates: {
    title?: string;
    description?: string;
    deployed_url?: string;
    github_url?: string;
    explanation_uri?: string;
  }) {
    const { data, error } = await supabase
      .from('revivals')
      .update(updates)
      .eq('id', revivalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
