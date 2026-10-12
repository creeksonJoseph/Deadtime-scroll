-- DeadTime Database Schema
-- Complete database setup for new Supabase project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table - User accounts linked to wallet addresses
CREATE TABLE profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT,
    bio TEXT,
    avatar_url TEXT,
    total_blessings INTEGER DEFAULT 0,
    projects_count INTEGER DEFAULT 0,
    revivals_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table - Abandoned projects submitted for revival
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'OTHER',
    repo_url TEXT,
    revival_count INTEGER DEFAULT 0,
    blessing_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revivals table - Community attempts to revive projects
CREATE TABLE revivals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_revival_id UUID REFERENCES revivals(id) ON DELETE CASCADE,
    reviver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    blessing_count INTEGER DEFAULT 0,
    depth INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Either project_id OR parent_revival_id must be set, not both
    CONSTRAINT revival_target_check CHECK (
        (project_id IS NOT NULL AND parent_revival_id IS NULL) OR
        (project_id IS NULL AND parent_revival_id IS NOT NULL)
    )
);

-- Messages table - User-to-user communication
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table - Discussion on projects and revivals
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    revival_id UUID REFERENCES revivals(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Either project_id OR revival_id must be set, not both
    CONSTRAINT comment_target_check CHECK (
        (project_id IS NOT NULL AND revival_id IS NULL) OR
        (project_id IS NULL AND revival_id IS NOT NULL)
    )
);

-- User badges table - NFT badge tracking
CREATE TABLE user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_wallet TEXT NOT NULL,
    badge_type TEXT NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    token_id INTEGER,
    tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_wallet, badge_type)
);

-- Blessings table - Community endorsements
CREATE TABLE blessings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    revival_id UUID REFERENCES revivals(id) ON DELETE CASCADE,
    user_wallet TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(revival_id, user_wallet)
);

-- Performance indexes
CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);
CREATE INDEX idx_projects_creator ON projects(creator_id);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_revivals_project ON revivals(project_id);
CREATE INDEX idx_revivals_parent ON revivals(parent_revival_id);
CREATE INDEX idx_revivals_reviver ON revivals(reviver_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id);
CREATE INDEX idx_comments_project ON comments(project_id);
CREATE INDEX idx_comments_revival ON comments(revival_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_blessings_revival ON blessings(revival_id);
CREATE INDEX idx_blessings_user ON blessings(user_wallet);
CREATE INDEX idx_user_badges_wallet ON user_badges(user_wallet);

-- Functions for automatic count updates
CREATE OR REPLACE FUNCTION update_project_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update revival count
        IF NEW.project_id IS NOT NULL THEN
            UPDATE projects 
            SET revival_count = revival_count + 1 
            WHERE id = NEW.project_id;
        END IF;
        
        -- Update user revival count
        UPDATE profiles 
        SET revivals_count = revivals_count + 1 
        WHERE id = NEW.reviver_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update revival count
        IF OLD.project_id IS NOT NULL THEN
            UPDATE projects 
            SET revival_count = revival_count - 1 
            WHERE id = OLD.project_id;
        END IF;
        
        -- Update user revival count
        UPDATE profiles 
        SET revivals_count = revivals_count - 1 
        WHERE id = OLD.reviver_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_blessing_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update revival blessing count
        UPDATE revivals 
        SET blessing_count = blessing_count + 1 
        WHERE id = NEW.revival_id;
        
        -- Update user total blessings (reviver gets the blessing)
        UPDATE profiles 
        SET total_blessings = total_blessings + 1 
        WHERE id = (SELECT reviver_id FROM revivals WHERE id = NEW.revival_id);
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update revival blessing count
        UPDATE revivals 
        SET blessing_count = blessing_count - 1 
        WHERE id = OLD.revival_id;
        
        -- Update user total blessings
        UPDATE profiles 
        SET total_blessings = total_blessings - 1 
        WHERE id = (SELECT reviver_id FROM revivals WHERE id = OLD.revival_id);
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_project_user_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles 
        SET projects_count = projects_count + 1 
        WHERE id = NEW.creator_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles 
        SET projects_count = projects_count - 1 
        WHERE id = OLD.creator_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_revival_counts
    AFTER INSERT OR DELETE ON revivals
    FOR EACH ROW EXECUTE FUNCTION update_project_counts();

CREATE TRIGGER trigger_update_blessing_counts
    AFTER INSERT OR DELETE ON blessings
    FOR EACH ROW EXECUTE FUNCTION update_blessing_counts();

CREATE TRIGGER trigger_update_project_user_counts
    AFTER INSERT OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_project_user_counts();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revivals_updated_at BEFORE UPDATE ON revivals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();