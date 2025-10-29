import { supabase, Profile } from '../lib/supabase';

export const profileService = {
  async getByWallet(walletAddress: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (error) throw error;
    if (!profile) return null;

    // Get actual counts from related tables
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', profile.id);

    const { count: revivalsCount } = await supabase
      .from('revivals')
      .select('*', { count: 'exact', head: true })
      .eq('reviver_id', profile.id);

    return {
      ...profile,
      projects_count: projectsCount || 0,
      revivals_count: revivalsCount || 0
    } as Profile;
  },

  async getById(id: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch profile by ID ${id}: ${error.message}`);
    }

    // Get actual counts from related tables
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', profile.id);

    const { count: revivalsCount } = await supabase
      .from('revivals')
      .select('*', { count: 'exact', head: true })
      .eq('reviver_id', profile.id);

    return {
      ...profile,
      projects_count: projectsCount || 0,
      revivals_count: revivalsCount || 0
    } as Profile;
  },

  async create(profile: {
    wallet_address: string;
    username?: string;
    avatar_url?: string;
  }) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async update(
    walletAddress: string,
    updates: {
      username?: string;
      avatar_url?: string;
      bio?: string;
    }
  ) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async getLeaderboard(limit: number = 50) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('total_blessings', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Profile[];
  },
};
