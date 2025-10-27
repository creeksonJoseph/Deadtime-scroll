import { supabase, Profile } from '../lib/supabase';

export const profileService = {
  async getByWallet(walletAddress: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (error) throw error;
    return data as Profile | null;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Profile;
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
