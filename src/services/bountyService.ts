import { supabase } from '../lib/supabase';

export interface Bounty {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  requirements?: string;
  reward_amount: number;
  deadline: string;
  status: 'open' | 'judging' | 'completed' | 'cancelled';
  max_submissions: number;
  contract_address?: string;
  winner_selected_at?: string;
  category?: string;
  submission_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
    wallet_address: string;
  };
}

export interface BountySubmission {
  id: string;
  bounty_id: string;
  developer_id: string;
  title: string;
  description: string;
  github_url?: string;
  demo_url?: string;
  submission_rank?: number;
  is_winner: boolean;
  payout_amount?: number;
  submitted_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
    wallet_address: string;
  };
}

export interface BountyComment {
  id: string;
  bounty_id?: string;
  submission_id?: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

export const bountyService = {
  // Get all bounties with filters
  async getAll(filters?: {
    status?: string;
    category?: string;
    minReward?: number;
    maxReward?: number;
    search?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('bounties')
      .select(`
        *,
        profiles!bounties_creator_id_fkey(username, avatar_url, wallet_address)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.minReward) {
      query = query.gte('reward_amount', filters.minReward);
    }

    if (filters?.maxReward) {
      query = query.lte('reward_amount', filters.maxReward);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Bounty[];
  },

  // Get single bounty by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('bounties')
      .select(`
        *,
        profiles!bounties_creator_id_fkey(username, avatar_url, wallet_address)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Bounty;
  },

  // Create new bounty
  async create(bounty: {
    title: string;
    description: string;
    requirements?: string;
    reward_amount: number;
    deadline: string;
    category?: string;
    max_submissions?: number;
    creator_id: string;
  }) {
    const { data, error } = await supabase
      .from('bounties')
      .insert(bounty)
      .select()
      .single();

    if (error) throw error;
    return data as Bounty;
  },

  // Update bounty
  async update(id: string, updates: Partial<Bounty>) {
    const { data, error } = await supabase
      .from('bounties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Bounty;
  },

  // Delete bounty
  async delete(id: string) {
    const { error } = await supabase
      .from('bounties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get bounties by creator
  async getByCreator(creatorId: string) {
    const { data, error } = await supabase
      .from('bounties')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Bounty[];
  },

  // Get submissions for a bounty
  async getSubmissions(bountyId: string) {
    const { data, error } = await supabase
      .from('bounty_submissions')
      .select(`
        *,
        profiles!bounty_submissions_developer_id_fkey(username, avatar_url, wallet_address)
      `)
      .eq('bounty_id', bountyId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data as BountySubmission[];
  },

  // Create submission
  async createSubmission(submission: {
    bounty_id: string;
    developer_id: string;
    title: string;
    description: string;
    github_url?: string;
    demo_url?: string;
  }) {
    const { data, error } = await supabase
      .from('bounty_submissions')
      .insert(submission)
      .select()
      .single();

    if (error) throw error;
    return data as BountySubmission;
  },

  // Update submission
  async updateSubmission(id: string, updates: Partial<BountySubmission>) {
    const { data, error } = await supabase
      .from('bounty_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BountySubmission;
  },

  // Select winners and update payout amounts
  async selectWinners(bountyId: string, winners: Array<{
    submissionId: string;
    rank: number;
    payoutAmount: number;
  }>) {
    // Update all submissions to mark winners
    for (const winner of winners) {
      await supabase
        .from('bounty_submissions')
        .update({
          is_winner: true,
          submission_rank: winner.rank,
          payout_amount: winner.payoutAmount
        })
        .eq('id', winner.submissionId);
    }

    // Update bounty status
    await supabase
      .from('bounties')
      .update({
        status: 'completed',
        winner_selected_at: new Date().toISOString()
      })
      .eq('id', bountyId);
  },

  // Get comments for bounty
  async getBountyComments(bountyId: string) {
    const { data, error } = await supabase
      .from('bounty_comments')
      .select(`
        *,
        profiles!bounty_comments_author_id_fkey(username, avatar_url)
      `)
      .eq('bounty_id', bountyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as BountyComment[];
  },

  // Get comments for submission
  async getSubmissionComments(submissionId: string) {
    const { data, error } = await supabase
      .from('bounty_comments')
      .select(`
        *,
        profiles!bounty_comments_author_id_fkey(username, avatar_url)
      `)
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as BountyComment[];
  },

  // Create comment
  async createComment(comment: {
    bounty_id?: string;
    submission_id?: string;
    author_id: string;
    content: string;
  }) {
    const { data, error } = await supabase
      .from('bounty_comments')
      .insert(comment)
      .select(`
        *,
        profiles!bounty_comments_author_id_fkey(username, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data as BountyComment;
  }
};