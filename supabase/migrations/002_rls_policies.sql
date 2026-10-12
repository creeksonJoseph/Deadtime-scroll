-- Row Level Security (RLS) Policies
-- Security configuration for DeadTime application

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE revivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE blessings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = wallet_address OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = wallet_address OR auth.role() = 'service_role');

-- Projects policies
CREATE POLICY "Projects are viewable by everyone" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (
        creator_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );

-- Revivals policies
CREATE POLICY "Revivals are viewable by everyone" ON revivals
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert revivals" ON revivals
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own revivals" ON revivals
    FOR UPDATE USING (
        reviver_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (
        sender_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR 
        recipient_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Authenticated users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

CREATE POLICY "Users can update their received messages" ON messages
    FOR UPDATE USING (
        recipient_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (
        author_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (
        author_id IN (
            SELECT id FROM profiles WHERE wallet_address = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );

-- User badges policies
CREATE POLICY "User badges are viewable by everyone" ON user_badges
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage badges" ON user_badges
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (user_wallet = auth.uid()::text);

-- Blessings policies
CREATE POLICY "Blessings are viewable by everyone" ON blessings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can give blessings" ON blessings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

CREATE POLICY "Users can remove their own blessings" ON blessings
    FOR DELETE USING (user_wallet = auth.uid()::text OR auth.role() = 'service_role');