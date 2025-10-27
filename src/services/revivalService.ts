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
      .select('*, profiles(*), projects(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Revival;
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
  }) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', (await supabase.auth.getUser()).data.user?.id)
      .single();

    const { data, error } = await supabase
      .from('revivals')
      .insert({
        ...revival,
        reviver_id: profile?.id,
      })
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
};
