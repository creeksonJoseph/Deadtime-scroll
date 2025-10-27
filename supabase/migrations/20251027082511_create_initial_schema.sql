/*
  # Initial DeadTime Database Schema

  Creates the core tables for the DeadTime platform for reviving abandoned projects.

  ## New Tables

  1. `profiles`
     - User profile information
     - Links to wallet addresses
     - Stores username, avatar, bio
     - Tracks total revivals and blessings received

  2. `projects`
     - Abandoned projects that can be revived
     - Contains project metadata (name, description, category, repo URL)
     - Tracks blessing count and revival status
     - Links to original creator

  3. `revivals`
     - Revival attempts for projects
     - Contains revival details, deployed URL, explanation
     - Tracks votes/blessings received
     - Links to project and reviver

  4. `comments`
     - Comments on projects and revivals
     - Links to user and parent (project or revival)
     - Supports nested threading

  5. `badges`
     - NFT badges earned by users
     - Tracks badge type, metadata, and mint info
     - Links to user profile

  6. `messages`
     - Direct messages between users
     - Supports conversation threading
     - Tracks read status

  ## Security

  - Enable RLS on all tables
  - Add policies for authenticated users
  - Ensure users can only modify their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text,
  avatar_url text,
  bio text,
  total_revivals integer DEFAULT 0,
  total_blessings integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  repo_url text,
  blessing_count integer DEFAULT 0,
  revival_count integer DEFAULT 0,
  is_revived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create revivals table
CREATE TABLE IF NOT EXISTS revivals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  reviver_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  explanation_uri text,
  deployed_url text,
  github_url text,
  blessing_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  revival_id uuid REFERENCES revivals(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT comment_parent CHECK (
    (project_id IS NOT NULL AND revival_id IS NULL) OR
    (project_id IS NULL AND revival_id IS NOT NULL) OR
    (parent_id IS NOT NULL)
  )
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type text NOT NULL,
  name text NOT NULL,
  description text,
  image_url text NOT NULL,
  metadata jsonb DEFAULT '{}',
  minted_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE revivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::text = wallet_address);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = wallet_address)
  WITH CHECK (auth.uid()::text = wallet_address);

-- Projects policies
CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Creators can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (creator_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text))
  WITH CHECK (creator_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text));

-- Revivals policies
CREATE POLICY "Revivals are viewable by everyone"
  ON revivals FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create revivals"
  ON revivals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Revivers can update own revivals"
  ON revivals FOR UPDATE
  TO authenticated
  USING (reviver_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text))
  WITH CHECK (reviver_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text));

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text))
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text));

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text));

-- Badges policies
CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

CREATE POLICY "Only system can create badges"
  ON badges FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text) OR
    recipient_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text)
  );

CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text));

CREATE POLICY "Recipients can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text))
  WITH CHECK (recipient_id IN (SELECT id FROM profiles WHERE wallet_address = auth.uid()::text));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_creator ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_revivals_project ON revivals(project_id);
CREATE INDEX IF NOT EXISTS idx_revivals_reviver ON revivals(reviver_id);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_revival ON comments(revival_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);