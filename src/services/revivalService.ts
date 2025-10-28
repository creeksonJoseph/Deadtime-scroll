import { supabase, Revival } from '../lib/supabase';

export const revivalService = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('revivals')
      .select('*, profiles!revivals_reviver_id_fkey(*)')
      .eq('project_id', projectId)
      .order('blessing_count', { ascending: false });

    if (error) throw error;
    return data as Revival[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('revivals')
      .select('*, profiles!revivals_reviver_id_fkey(*), projects!revivals_project_id_fkey(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Revival | null;
  },

  async getByUser(userId: string) {
    console.log('Fetching revivals for user:', userId);
    const { data, error } = await supabase
      .from('revivals')
      .select('*, projects!revivals_project_id_fkey(*)')
      .eq('reviver_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user revivals:', error);
      throw new Error(`Failed to fetch revivals for user ${userId}: ${error.message}`);
    }
    
    console.log(`Found ${data?.length || 0} revivals for user ${userId}`);
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
    console.log('Creating revival with data:', revival);
    
    // Ensure root_project_id is set for direct project revivals
    const revivalData = {
      ...revival,
      root_project_id: revival.project_id,
      depth: 0
    };
    
    const { data, error } = await supabase
      .from('revivals')
      .insert(revivalData)
      .select()
      .single();

    if (error) {
      console.error('Revival creation error:', error);
      throw new Error(`Failed to create revival: ${error.message}`);
    }
    
    // Update project revival count
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('revival_count')
      .eq('id', revival.project_id)
      .single();
    
    if (!fetchError && project) {
      await supabase
        .from('projects')
        .update({ revival_count: project.revival_count + 1 })
        .eq('id', revival.project_id);
    }
    
    console.log('Revival created successfully:', data);
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
