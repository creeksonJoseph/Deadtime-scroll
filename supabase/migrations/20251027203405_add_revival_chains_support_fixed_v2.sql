/*
  # Add Revival Chains Support

  Enable revivals to be revived by other users, creating a tree/blockchain structure.

  ## Changes
  
  1. **Schema Updates**
     - Make project_id nullable (can now be null if parent_revival_id is set)
     - Add `parent_revival_id` to revivals table (self-referencing)
     - Add `depth` column to track tree depth
     - Add `root_project_id` to track the original project
     - Update constraint: revival must have EITHER project_id OR parent_revival_id
  
  2. **Indexes**
     - Add index on parent_revival_id for tree queries
     - Add index on root_project_id for bloodline queries
  
  3. **Functions**
     - Create recursive function to get full bloodline/ancestry
     - Create function to get descendants
  
  4. **Sample Data**
     - Create multi-level revival chains to demonstrate feature
*/

-- Make project_id nullable since revivals can now revive other revivals
ALTER TABLE revivals ALTER COLUMN project_id DROP NOT NULL;

-- Add new columns to revivals table
ALTER TABLE revivals 
ADD COLUMN IF NOT EXISTS parent_revival_id uuid REFERENCES revivals(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS depth integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS root_project_id uuid REFERENCES projects(id) ON DELETE CASCADE;

-- Drop old constraint if exists
ALTER TABLE revivals DROP CONSTRAINT IF EXISTS revivals_source_check;

-- Add new constraint: must have either project_id OR parent_revival_id (not both, not neither)
ALTER TABLE revivals 
ADD CONSTRAINT revivals_source_check 
CHECK (
  (project_id IS NOT NULL AND parent_revival_id IS NULL) OR 
  (project_id IS NULL AND parent_revival_id IS NOT NULL)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_revivals_parent ON revivals(parent_revival_id);
CREATE INDEX IF NOT EXISTS idx_revivals_root_project ON revivals(root_project_id);

-- Function to get the full bloodline (ancestry chain) for a revival
CREATE OR REPLACE FUNCTION get_revival_bloodline(revival_id_param uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  github_url text,
  deployed_url text,
  reviver_id uuid,
  username text,
  avatar_url text,
  parent_revival_id uuid,
  project_id uuid,
  depth integer,
  created_at timestamptz,
  blessing_count integer
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  WITH RECURSIVE bloodline AS (
    SELECT 
      r.id,
      r.title,
      r.description,
      r.github_url,
      r.deployed_url,
      r.reviver_id,
      p.username,
      p.avatar_url,
      r.parent_revival_id,
      r.project_id,
      r.depth,
      r.created_at,
      r.blessing_count
    FROM revivals r
    JOIN profiles p ON r.reviver_id = p.id
    WHERE r.id = revival_id_param
    
    UNION ALL
    
    SELECT 
      r.id,
      r.title,
      r.description,
      r.github_url,
      r.deployed_url,
      r.reviver_id,
      p.username,
      p.avatar_url,
      r.parent_revival_id,
      r.project_id,
      r.depth,
      r.created_at,
      r.blessing_count
    FROM revivals r
    JOIN profiles p ON r.reviver_id = p.id
    JOIN bloodline b ON r.id = b.parent_revival_id
  )
  SELECT * FROM bloodline ORDER BY depth ASC;
$$;

-- Function to get all descendants (children tree) for a revival
CREATE OR REPLACE FUNCTION get_revival_descendants(revival_id_param uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  github_url text,
  deployed_url text,
  reviver_id uuid,
  username text,
  avatar_url text,
  parent_revival_id uuid,
  project_id uuid,
  depth integer,
  created_at timestamptz,
  blessing_count integer
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  WITH RECURSIVE descendants AS (
    SELECT 
      r.id,
      r.title,
      r.description,
      r.github_url,
      r.deployed_url,
      r.reviver_id,
      p.username,
      p.avatar_url,
      r.parent_revival_id,
      r.project_id,
      r.depth,
      r.created_at,
      r.blessing_count
    FROM revivals r
    JOIN profiles p ON r.reviver_id = p.id
    WHERE r.id = revival_id_param
    
    UNION ALL
    
    SELECT 
      r.id,
      r.title,
      r.description,
      r.github_url,
      r.deployed_url,
      r.reviver_id,
      p.username,
      p.avatar_url,
      r.parent_revival_id,
      r.project_id,
      r.depth,
      r.created_at,
      r.blessing_count
    FROM revivals r
    JOIN profiles p ON r.reviver_id = p.id
    JOIN descendants d ON r.parent_revival_id = d.id
  )
  SELECT * FROM descendants ORDER BY depth ASC;
$$;

-- Update existing revivals to set root_project_id and depth
UPDATE revivals 
SET 
  root_project_id = project_id,
  depth = 0
WHERE project_id IS NOT NULL;

-- Create multi-level revival chains (seed data)

-- Level 1: Revival of "Abandoned Cart Recovery System" by CodeWizard
INSERT INTO revivals (title, description, github_url, deployed_url, project_id, reviver_id, depth, root_project_id, blessing_count)
VALUES (
  'Cart Saver 2.0 - AI Enhanced',
  'Building on Cart Recovery Pro, I added AI-powered customer behavior prediction that suggests optimal recovery times and personalized messages. The ML model analyzes past purchase patterns and achieves 45% higher recovery rates!',
  'https://github.com/example/cart-saver-ai',
  'https://cart-saver-ai.vercel.app',
  (SELECT id FROM projects WHERE name = 'Abandoned Cart Recovery System'),
  (SELECT id FROM profiles WHERE username = 'CodeWizard'),
  0,
  (SELECT id FROM projects WHERE name = 'Abandoned Cart Recovery System'),
  28
);

-- Level 2: Revival of "Cart Recovery Pro - Modern Edition" by CryptoNinja
DO $$
DECLARE
  parent_revival_id uuid;
  root_proj_id uuid;
BEGIN
  SELECT id INTO parent_revival_id FROM revivals WHERE title = 'Cart Recovery Pro - Modern Edition';
  SELECT root_project_id INTO root_proj_id FROM revivals WHERE title = 'Cart Recovery Pro - Modern Edition';
  
  INSERT INTO revivals (title, description, github_url, deployed_url, parent_revival_id, reviver_id, depth, root_project_id, blessing_count)
  VALUES (
    'Cart Recovery Pro - Web3 Loyalty Edition',
    'Took Cart Recovery Pro to the next level by integrating blockchain-based loyalty rewards! Customers who complete recovered purchases earn NFT badges and token rewards. The gamification increased cart recovery by 60% and created a vibrant community.',
    'https://github.com/example/cart-recovery-web3',
    'https://cart-recovery-web3.vercel.app',
    parent_revival_id,
    (SELECT id FROM profiles WHERE username = 'CryptoNinja'),
    1,
    root_proj_id,
    52
  );
END $$;

-- Level 3: Revival of "Cart Recovery Pro - Web3 Loyalty Edition" by TechGuru
DO $$
DECLARE
  parent_revival_id uuid;
  root_proj_id uuid;
BEGIN
  SELECT id INTO parent_revival_id FROM revivals WHERE title = 'Cart Recovery Pro - Web3 Loyalty Edition';
  SELECT root_project_id INTO root_proj_id FROM revivals WHERE title = 'Cart Recovery Pro - Web3 Loyalty Edition';
  
  INSERT INTO revivals (title, description, github_url, deployed_url, parent_revival_id, reviver_id, depth, root_project_id, blessing_count)
  VALUES (
    'OmniCart - Multi-Chain Recovery Platform',
    'This is the ultimate evolution! Built a platform that works across 15+ blockchains, integrated with major e-commerce platforms, and added DAO governance for reward distribution. The loyalty tokens are now tradeable on DEXs. Recovery rate: 78%!',
    'https://github.com/example/omnicart',
    'https://omnicart.io',
    parent_revival_id,
    (SELECT id FROM profiles WHERE username = 'TechGuru'),
    2,
    root_proj_id,
    89
  );
END $$;

-- Create another branch: Level 2 alternative revival
DO $$
DECLARE
  parent_revival_id uuid;
  root_proj_id uuid;
BEGIN
  SELECT id INTO parent_revival_id FROM revivals WHERE title = 'Cart Saver 2.0 - AI Enhanced';
  SELECT root_project_id INTO root_proj_id FROM revivals WHERE title = 'Cart Saver 2.0 - AI Enhanced';
  
  INSERT INTO revivals (title, description, github_url, deployed_url, parent_revival_id, reviver_id, depth, root_project_id, blessing_count)
  VALUES (
    'SmartCart - Voice-Activated Recovery',
    'Combined the AI from Cart Saver 2.0 with voice technology! Customers can complete their purchases via Alexa, Google Home, or Siri. The voice assistant reminds them about abandoned carts and makes checkout frictionless. Perfect for hands-free shopping!',
    'https://github.com/example/smartcart-voice',
    'https://smartcart-voice.com',
    parent_revival_id,
    (SELECT id FROM profiles WHERE username = 'ByteMaster'),
    1,
    root_proj_id,
    34
  );
END $$;

-- Create revival tree for RetroWave Music Player
DO $$
DECLARE
  retrowave_project_id uuid;
  level1_revival_id uuid;
  level2_revival_id uuid;
BEGIN
  SELECT id INTO retrowave_project_id FROM projects WHERE name = 'RetroWave Music Player';
  
  -- Update existing revival
  SELECT id INTO level1_revival_id FROM revivals WHERE title = 'RetroWave Reborn - Web3 Edition';
  UPDATE revivals SET depth = 0, root_project_id = retrowave_project_id WHERE id = level1_revival_id;
  
  -- Create new revival of RetroWave Reborn
  INSERT INTO revivals (title, description, github_url, deployed_url, parent_revival_id, reviver_id, depth, root_project_id, blessing_count)
  VALUES (
    'RetroWave Metaverse - Spatial Audio Experience',
    'Transformed RetroWave into a full metaverse experience! Users can attend virtual concerts, DJ in 3D spaces, and experience music with spatial audio. NFT tickets grant access to exclusive events. The 80s aesthetic in VR is mind-blowing!',
    'https://github.com/example/retrowave-metaverse',
    'https://retrowave-metaverse.io',
    level1_revival_id,
    (SELECT id FROM profiles WHERE username = 'CodeWizard'),
    1,
    retrowave_project_id,
    67
  ) RETURNING id INTO level2_revival_id;
  
  -- Another revival on top
  INSERT INTO revivals (title, description, github_url, deployed_url, parent_revival_id, reviver_id, depth, root_project_id, blessing_count)
  VALUES (
    'RetroWave DAO - Community-Owned Music Platform',
    'Turned the metaverse into a fully decentralized autonomous organization! Artists stake tokens to list music, fans vote on playlists, and everyone shares in the revenue. 10,000+ active members and growing. This is the future of music!',
    'https://github.com/example/retrowave-dao',
    'https://retrowave-dao.xyz',
    level2_revival_id,
    (SELECT id FROM profiles WHERE username = 'ByteMaster'),
    2,
    retrowave_project_id,
    103
  );
END $$;

-- Update revival counts for all projects
UPDATE projects p
SET revival_count = (
  SELECT COUNT(*)
  FROM revivals r
  WHERE r.root_project_id = p.id OR r.project_id = p.id
);
