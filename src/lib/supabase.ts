import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  revivals_count: number;
  projects_count: number;
  total_blessings: number;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  creator_id: string | null;
  name: string;
  description: string;
  category: string;
  repo_url: string | null;
  blessing_count: number;
  revival_count: number;
  is_revived: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Revival = {
  id: string;
  project_id: string;
  reviver_id: string | null;
  title: string;
  description: string;
  explanation_uri: string | null;
  deployed_url: string | null;
  github_url: string | null;
  blessing_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  projects?: Project;
};

export type Comment = {
  id: string;
  user_id: string;
  project_id: string | null;
  revival_id: string | null;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Badge = {
  id: string;
  user_id: string;
  badge_type: string;
  name: string;
  description: string | null;
  image_url: string;
  metadata: Record<string, any>;
  minted_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  recipient?: Profile;
};
