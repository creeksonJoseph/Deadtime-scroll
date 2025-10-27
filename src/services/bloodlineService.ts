import { supabase } from '../lib/supabase';

export interface BloodlineNode {
  id: string;
  title: string;
  description: string;
  github_url: string;
  deployed_url: string;
  reviver_id: string;
  username: string;
  avatar_url: string;
  parent_revival_id: string | null;
  project_id: string | null;
  depth: number;
  created_at: string;
  blessing_count: number;
}

export const bloodlineService = {
  async getFullBloodline(revivalId: string): Promise<BloodlineNode[]> {
    const { data, error } = await supabase.rpc('get_revival_bloodline', {
      revival_id_param: revivalId,
    });

    if (error) throw error;
    return data || [];
  },

  async getDescendants(revivalId: string): Promise<BloodlineNode[]> {
    const { data, error } = await supabase.rpc('get_revival_descendants', {
      revival_id_param: revivalId,
    });

    if (error) throw error;
    return data || [];
  },

  async getCompleteTree(revivalId: string): Promise<{
    ancestors: BloodlineNode[];
    descendants: BloodlineNode[];
    current: BloodlineNode | null;
  }> {
    const [bloodline, descendants] = await Promise.all([
      this.getFullBloodline(revivalId),
      this.getDescendants(revivalId),
    ]);

    const current = bloodline.find((node) => node.id === revivalId) || null;
    const ancestors = bloodline.filter((node) => node.id !== revivalId);

    const descendantsOnly = descendants.filter((node) => node.id !== revivalId);

    return {
      ancestors,
      descendants: descendantsOnly,
      current,
    };
  },
};
