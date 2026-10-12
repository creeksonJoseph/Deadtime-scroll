-- Create bounty system tables
-- Phase 1: Database Schema & Backend

-- Bounties table - main bounty projects with funding
CREATE TABLE bounties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  reward_amount DECIMAL(18,8) NOT NULL, -- ETH amount with 8 decimal precision
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'judging', 'completed', 'cancelled')),
  max_submissions INTEGER DEFAULT 1,
  contract_address TEXT, -- escrow contract address
  winner_selected_at TIMESTAMP WITH TIME ZONE,
  category TEXT,
  submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bounty submissions - developer solutions to bounties
CREATE TABLE bounty_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
  developer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  github_url TEXT,
  demo_url TEXT,
  submission_rank INTEGER, -- 1st, 2nd, 3rd place
  is_winner BOOLEAN DEFAULT FALSE,
  payout_amount DECIMAL(18,8), -- actual ETH received
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bounty_id, developer_id) -- one submission per developer per bounty
);

-- Comments on bounties and submissions
CREATE TABLE bounty_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES bounty_submissions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Constraint: must comment on either bounty OR submission, not both
  CONSTRAINT check_comment_target CHECK (
    (bounty_id IS NOT NULL AND submission_id IS NULL) OR
    (bounty_id IS NULL AND submission_id IS NOT NULL)
  )
);

-- Performance indexes
CREATE INDEX idx_bounties_creator_id ON bounties(creator_id);
CREATE INDEX idx_bounties_status ON bounties(status);
CREATE INDEX idx_bounties_deadline ON bounties(deadline);
CREATE INDEX idx_bounties_reward_amount ON bounties(reward_amount DESC);
CREATE INDEX idx_bounties_created_at ON bounties(created_at DESC);
CREATE INDEX idx_bounties_category ON bounties(category);

CREATE INDEX idx_bounty_submissions_bounty_id ON bounty_submissions(bounty_id);
CREATE INDEX idx_bounty_submissions_developer_id ON bounty_submissions(developer_id);
CREATE INDEX idx_bounty_submissions_is_winner ON bounty_submissions(is_winner);
CREATE INDEX idx_bounty_submissions_submitted_at ON bounty_submissions(submitted_at DESC);

CREATE INDEX idx_bounty_comments_bounty_id ON bounty_comments(bounty_id);
CREATE INDEX idx_bounty_comments_submission_id ON bounty_comments(submission_id);
CREATE INDEX idx_bounty_comments_author_id ON bounty_comments(author_id);
CREATE INDEX idx_bounty_comments_created_at ON bounty_comments(created_at DESC);

-- Update submission count trigger
CREATE OR REPLACE FUNCTION update_bounty_submission_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE bounties 
    SET submission_count = submission_count + 1 
    WHERE id = NEW.bounty_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE bounties 
    SET submission_count = submission_count - 1 
    WHERE id = OLD.bounty_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bounty_submission_count
  AFTER INSERT OR DELETE ON bounty_submissions
  FOR EACH ROW EXECUTE FUNCTION update_bounty_submission_count();

-- Update bounty updated_at trigger
CREATE OR REPLACE FUNCTION update_bounty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bounty_updated_at
  BEFORE UPDATE ON bounties
  FOR EACH ROW EXECUTE FUNCTION update_bounty_updated_at();

-- Row Level Security (RLS) Policies

-- Bounties: Public read, creator can edit
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bounties are viewable by everyone" ON bounties
  FOR SELECT USING (true);

CREATE POLICY "Users can create bounties" ON bounties
  FOR INSERT WITH CHECK (auth.uid()::text = creator_id::text);

CREATE POLICY "Creators can update their bounties" ON bounties
  FOR UPDATE USING (auth.uid()::text = creator_id::text);

CREATE POLICY "Creators can delete their bounties" ON bounties
  FOR DELETE USING (auth.uid()::text = creator_id::text);

-- Bounty submissions: Public read, developer can create/edit own
ALTER TABLE bounty_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bounty submissions are viewable by everyone" ON bounty_submissions
  FOR SELECT USING (true);

CREATE POLICY "Users can create submissions" ON bounty_submissions
  FOR INSERT WITH CHECK (auth.uid()::text = developer_id::text);

CREATE POLICY "Developers can update their submissions" ON bounty_submissions
  FOR UPDATE USING (auth.uid()::text = developer_id::text);

CREATE POLICY "Developers can delete their submissions" ON bounty_submissions
  FOR DELETE USING (auth.uid()::text = developer_id::text);

-- Bounty comments: Public read, authenticated users can create
ALTER TABLE bounty_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bounty comments are viewable by everyone" ON bounty_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON bounty_comments
  FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);

CREATE POLICY "Authors can update their comments" ON bounty_comments
  FOR UPDATE USING (auth.uid()::text = author_id::text);

CREATE POLICY "Authors can delete their comments" ON bounty_comments
  FOR DELETE USING (auth.uid()::text = author_id::text);