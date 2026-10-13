import { supabase } from '../lib/supabase';

// Since we can't create new tables in Bolt.new, we'll use existing tables creatively
// We'll store bounties as special projects with bounty-specific metadata

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

// HACK: Use existing tables to store bounty data
// projects table will store bounties (with special category "BOUNTY")
// revivals table will store submissions (with parent project as bounty)
// comments table will store bounty comments

export const bountyService = {
  // Get all bounties (projects with category "BOUNTY")
  async getAll(filters?: {
    status?: string;
    category?: string;
    minReward?: number;
    maxReward?: number;
    search?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('projects')
      .select(`
        *,
        profiles!projects_creator_id_fkey(username, avatar_url, wallet_address)
      `)
      .eq('category', 'BOUNTY') // Only get bounty projects
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform projects to bounty format
    return data?.map(project => ({
      id: project.id,
      creator_id: project.creator_id,
      title: project.name,
      description: project.description,
      requirements: project.repo_url, // Hack: store requirements in repo_url field
      reward_amount: project.blessing_count || 0, // Hack: store reward in blessing_count
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days
      status: 'open', // Default status
      max_submissions: 5, // Default max submissions
      submission_count: project.revival_count || 0,
      created_at: project.created_at,
      profiles: project.profiles
    })) as Bounty[];
  },

  // Get single bounty by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!projects_creator_id_fkey(username, avatar_url, wallet_address)
      `)
      .eq('id', id)
      .eq('category', 'BOUNTY')
      .single();

    if (error) throw error;

    // Transform to bounty format
    return {
      id: data.id,
      creator_id: data.creator_id,
      title: data.name,
      description: data.description,
      requirements: data.repo_url,
      reward_amount: data.blessing_count || 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'open',
      max_submissions: 5,
      submission_count: data.revival_count || 0,
      created_at: data.created_at,
      profiles: data.profiles
    } as Bounty;
  },

  // Create new bounty (as special project)
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
      .from('projects')
      .insert({
        name: bounty.title,
        description: bounty.description,
        category: 'BOUNTY', // Special category for bounties
        repo_url: bounty.requirements, // Hack: store requirements here
        blessing_count: bounty.reward_amount, // Hack: store reward amount here
        creator_id: bounty.creator_id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      creator_id: data.creator_id,
      title: data.name,
      description: data.description,
      requirements: data.repo_url,
      reward_amount: data.blessing_count,
      deadline: bounty.deadline,
      status: 'open',
      max_submissions: bounty.max_submissions || 5,
      submission_count: 0,
      created_at: data.created_at
    } as Bounty;
  },

  // Get submissions for a bounty (revivals with parent project as bounty)
  async getSubmissions(bountyId: string) {
    const { data, error } = await supabase
      .from('revivals')
      .select(`
        *,
        profiles!revivals_reviver_id_fkey(username, avatar_url, wallet_address)
      `)
      .eq('project_id', bountyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform revivals to submission format
    return data?.map(revival => ({
      id: revival.id,
      bounty_id: revival.project_id,
      developer_id: revival.reviver_id,
      title: revival.title,
      description: revival.description,
      github_url: revival.github_url,
      demo_url: revival.deployed_url,
      submission_rank: null,
      is_winner: revival.blessing_count > 50, // Hack: high blessings = winner
      payout_amount: revival.blessing_count > 50 ? 1.0 : 0,
      submitted_at: revival.created_at,
      profiles: revival.profiles
    })) as BountySubmission[];
  },

  // Create submission (as revival)
  async createSubmission(submission: {
    bounty_id: string;
    developer_id: string;
    title: string;
    description: string;
    github_url?: string;
    demo_url?: string;
  }) {
    const { data, error } = await supabase
      .from('revivals')
      .insert({
        project_id: submission.bounty_id,
        reviver_id: submission.developer_id,
        title: submission.title,
        description: submission.description,
        github_url: submission.github_url,
        deployed_url: submission.demo_url
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      bounty_id: data.project_id,
      developer_id: data.reviver_id,
      title: data.title,
      description: data.description,
      github_url: data.github_url,
      demo_url: data.deployed_url,
      is_winner: false,
      submitted_at: data.created_at
    } as BountySubmission;
  },

  // Get comments for bounty (existing comment system)
  async getBountyComments(bountyId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!comments_author_id_fkey(username, avatar_url)
      `)
      .eq('project_id', bountyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Create comment (existing system)
  async createComment(comment: {
    bounty_id?: string;
    submission_id?: string;
    author_id: string;
    content: string;
  }) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        project_id: comment.bounty_id,
        revival_id: comment.submission_id,
        author_id: comment.author_id,
        content: comment.content
      })
      .select(`
        *,
        profiles!comments_author_id_fkey(username, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};