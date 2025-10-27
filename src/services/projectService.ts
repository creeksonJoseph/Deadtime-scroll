import { supabase, Project } from '../lib/supabase';

export const projectService = {
  async getAll(category?: string, search?: string) {
    let query = supabase
      .from('projects')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Project[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Project;
  },

  async create(project: {
    name: string;
    description: string;
    category: string;
    repo_url?: string;
  }) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', (await supabase.auth.getUser()).data.user?.id)
      .single();

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...project,
        creator_id: profile?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bless(projectId: string) {
    const { data, error } = await supabase.rpc('increment_project_blessings', {
      project_id: projectId,
    });

    if (error) throw error;
    return data;
  },
};
