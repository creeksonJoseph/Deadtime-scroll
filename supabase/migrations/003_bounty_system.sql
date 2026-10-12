-- Bounty System Tables
-- Proper bounty system implementation for new Supabase project

-- Bounties table - Paid development challenges
CREATE TABLE bounties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    reward_eth DECIMAL(10,6) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    winner_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table - Developer submissions for bounties
CREATE TABLE submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    repo_url TEXT,
    demo_url TEXT,
    is_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(bounty_id, developer_id)
);

-- Bounty comments table - Discussion on bounties
CREATE TABLE bounty_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Either bounty_id OR submission_id must be set, not both
    CONSTRAINT bounty_comment_target_check CHECK (
        (bounty_id IS NOT NULL AND submission_id IS NULL) OR
        (bounty_id IS NULL AND submission_id IS NOT NULL)
    )
);

-- Indexes for bounty system
CREATE INDEX idx_bounties_creator ON bounties(creator_id);
CREATE INDEX idx_bounties_status ON bounties(status);
CREATE INDEX idx_bounties_deadline ON bounties(deadline);
CREATE INDEX idx_submissions_bounty ON submissions(bounty_id);
CREATE INDEX idx_submissions_developer ON submissions(developer_id);
CREATE INDEX idx_bounty_comments_bounty ON bounty_comments(bounty_id);
CREATE INDEX idx_bounty_comments_submission ON bounty_comments(submission_id);

-- Functions for bounty count updates
CREATE OR REPLACE FUNCTION update_bounty_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update user bounty count (add to projects_count for now)
        UPDATE profiles 
        SET projects_count = projects_count + 1 
        WHERE id = NEW.creator_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update user bounty count
        UPDATE profiles 
        SET projects_count = projects_count - 1 
        WHERE id = OLD.creator_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_submission_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update user submission count (add to revivals_count for now)
        UPDATE profiles 
        SET revivals_count = revivals_count + 1 
        WHERE id = NEW.developer_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update user submission count
        UPDATE profiles 
        SET revivals_count = revivals_count - 1 
        WHERE id = OLD.developer_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for bounty system
CREATE TRIGGER trigger_update_bounty_counts
    AFTER INSERT OR DELETE ON bounties
    FOR EACH ROW EXECUTE FUNCTION update_bounty_counts();

CREATE TRIGGER trigger_update_submission_counts
    AFTER INSERT OR DELETE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_submission_counts();

-- Update timestamps for bounty tables
CREATE TRIGGER update_bounties_updated_at BEFORE UPDATE ON bounties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bounty_comments_updated_at BEFORE UPDATE ON bounty_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for bounty system
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_comments ENABLE ROW LEVEL SECURITY;

-- Bounties policies
CREATE POLICY "Bounties are viewable by everyone" ON bounties
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create bounties" ON bounties
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own bounties" ON bounties
    FOR UPDATE USING (
        creator_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );

-- Submissions policies
CREATE POLICY "Submissions are viewable by everyone" ON submissions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own submissions" ON submissions
    FOR UPDATE USING (
        developer_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );

-- Bounty comments policies
CREATE POLICY "Bounty comments are viewable by everyone" ON bounty_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create bounty comments" ON bounty_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own bounty comments" ON bounty_comments
    FOR UPDATE USING (
        author_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their own bounty comments" ON bounty_comments
    FOR DELETE USING (
        author_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );