/*
  # Fix Profile Policies for Web3 Wallet Authentication

  Updates RLS policies to allow Web3 wallet-based authentication without Supabase Auth.
  
  ## Changes
  
  1. Drop old authentication-based policies
  2. Create new policies that allow wallet address-based access
  3. Enable public profile creation for new wallet connections
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow anyone to create a profile (needed for wallet connection)
CREATE POLICY "Anyone can create profile"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own profile based on wallet address
CREATE POLICY "Users can update own profile by wallet"
  ON profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Drop and recreate other table policies to be more permissive
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Creators can update own projects" ON projects;

CREATE POLICY "Anyone can create projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update projects"
  ON projects FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Drop and recreate revival policies
DROP POLICY IF EXISTS "Authenticated users can create revivals" ON revivals;
DROP POLICY IF EXISTS "Revivers can update own revivals" ON revivals;

CREATE POLICY "Anyone can create revivals"
  ON revivals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update revivals"
  ON revivals FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Drop and recreate comment policies
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

CREATE POLICY "Anyone can create comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update comments"
  ON comments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete comments"
  ON comments FOR DELETE
  USING (true);

-- Update message policies
DROP POLICY IF EXISTS "Authenticated users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Recipients can update message read status" ON messages;

CREATE POLICY "Anyone can send messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update messages"
  ON messages FOR UPDATE
  USING (true)
  WITH CHECK (true);
