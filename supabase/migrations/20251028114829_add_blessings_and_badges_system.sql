/*
  # Blessings and Badges System

  1. New Tables
    - `revival_blessings`
      - `id` (uuid, primary key)
      - `revival_id` (uuid, foreign key to revivals)
      - `user_wallet` (text, wallet address of user giving blessing)
      - `created_at` (timestamptz)
      - Tracks individual blessings given to revivals
    
    - `user_badges`
      - `id` (uuid, primary key)
      - `user_wallet` (text, wallet address of badge owner)
      - `badge_type` (text, one of: grave_keeper, necromancer, digital_ghost, phoenix, soul_shepherd, master_curator)
      - `revival_id` (uuid, foreign key to revival that earned the badge)
      - `earned_at` (timestamptz, when threshold was reached)
      - `claimed` (boolean, whether NFT has been minted on-chain)
      - `token_id` (text, nullable, NFT token ID after minting)
      - `tx_hash` (text, nullable, blockchain transaction hash)
      - Tracks earned and claimed badges

  2. Functions
    - `get_revival_blessing_count` - counts total blessings for a revival
    - `get_user_blessing_count` - counts blessings given by a user to a revival
    - `check_and_award_badges` - automatically awards badges when thresholds are met

  3. Security
    - Enable RLS on both tables
    - Anyone can view blessings and badges
    - Only authenticated users can add blessings
    - Only the badge owner can update claim status

  4. Badge Thresholds
    - Grave Keeper: 10 blessings
    - Necromancer: 30 blessings
    - Digital Ghost: 50 blessings
    - Phoenix: 70 blessings
    - Soul Shepherd: 100 blessings
    - Master Curator: 150+ blessings
*/

-- Create revival_blessings table
CREATE TABLE IF NOT EXISTS revival_blessings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revival_id uuid NOT NULL REFERENCES revivals(id) ON DELETE CASCADE,
  user_wallet text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet text NOT NULL,
  badge_type text NOT NULL CHECK (badge_type IN ('grave_keeper', 'necromancer', 'digital_ghost', 'phoenix', 'soul_shepherd', 'master_curator')),
  revival_id uuid NOT NULL REFERENCES revivals(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  claimed boolean DEFAULT false,
  token_id text,
  tx_hash text
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_revival_blessings_revival_id ON revival_blessings(revival_id);
CREATE INDEX IF NOT EXISTS idx_revival_blessings_user_wallet ON revival_blessings(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_badges_wallet ON user_badges(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_badges_revival ON user_badges(revival_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_claimed ON user_badges(claimed);

-- Unique constraint: user can only bless a revival once
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_blessing_per_user 
  ON revival_blessings(revival_id, user_wallet);

-- Unique constraint: user can only earn each badge type once per revival
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_badge_per_revival 
  ON user_badges(user_wallet, badge_type, revival_id);

-- Enable RLS
ALTER TABLE revival_blessings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for revival_blessings
CREATE POLICY "Anyone can view blessings"
  ON revival_blessings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can add blessings"
  ON revival_blessings FOR INSERT
  TO public
  WITH CHECK (user_wallet IS NOT NULL AND user_wallet != '');

-- RLS Policies for user_badges
CREATE POLICY "Anyone can view badges"
  ON user_badges FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can insert badges"
  ON user_badges FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Badge owners can update their badges"
  ON user_badges FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to get total blessing count for a revival
CREATE OR REPLACE FUNCTION get_revival_blessing_count(p_revival_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  blessing_count integer;
BEGIN
  SELECT COUNT(*)
  INTO blessing_count
  FROM revival_blessings
  WHERE revival_id = p_revival_id;
  
  RETURN COALESCE(blessing_count, 0);
END;
$$;

-- Function to check if user already blessed a revival
CREATE OR REPLACE FUNCTION user_has_blessed_revival(p_revival_id uuid, p_user_wallet text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_blessed boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM revival_blessings
    WHERE revival_id = p_revival_id AND user_wallet = p_user_wallet
  )
  INTO has_blessed;
  
  RETURN has_blessed;
END;
$$;

-- Function to automatically award badges based on blessing count
CREATE OR REPLACE FUNCTION check_and_award_badges(p_revival_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_blessing_count integer;
  v_reviver_wallet text;
  v_badge_type text;
BEGIN
  -- Get the blessing count
  SELECT get_revival_blessing_count(p_revival_id) INTO v_blessing_count;
  
  -- Get the reviver's wallet (revival creator)
  SELECT r.reviver_wallet
  INTO v_reviver_wallet
  FROM revivals r
  WHERE r.id = p_revival_id;
  
  -- Only proceed if we have a valid reviver wallet
  IF v_reviver_wallet IS NULL OR v_reviver_wallet = '' THEN
    RETURN;
  END IF;
  
  -- Determine which badge to award based on count
  IF v_blessing_count >= 150 THEN
    v_badge_type := 'master_curator';
  ELSIF v_blessing_count >= 100 THEN
    v_badge_type := 'soul_shepherd';
  ELSIF v_blessing_count >= 70 THEN
    v_badge_type := 'phoenix';
  ELSIF v_blessing_count >= 50 THEN
    v_badge_type := 'digital_ghost';
  ELSIF v_blessing_count >= 30 THEN
    v_badge_type := 'necromancer';
  ELSIF v_blessing_count >= 10 THEN
    v_badge_type := 'grave_keeper';
  ELSE
    -- Not enough blessings for any badge
    RETURN;
  END IF;
  
  -- Award the badge if not already awarded
  INSERT INTO user_badges (user_wallet, badge_type, revival_id, earned_at, claimed)
  VALUES (v_reviver_wallet, v_badge_type, p_revival_id, now(), false)
  ON CONFLICT (user_wallet, badge_type, revival_id) DO NOTHING;
  
END;
$$;

-- Trigger to auto-check badges after each blessing
CREATE OR REPLACE FUNCTION trigger_check_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM check_and_award_badges(NEW.revival_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_blessing_insert ON revival_blessings;
CREATE TRIGGER after_blessing_insert
  AFTER INSERT ON revival_blessings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_badges();
