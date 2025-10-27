/*
  # Add Revival Comments Support

  Updates the comments table to support comments on both projects and revivals.
  
  ## Changes
  
  1. Add revival_id column to comments table
  2. Add check constraint to ensure comment is on either project OR revival
  3. Update indexes for better query performance
  4. Add comment_count to revivals table
*/

-- Add revival_id column to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS revival_id uuid REFERENCES revivals(id) ON DELETE CASCADE;

-- Add check constraint to ensure comment is on either project or revival (not both, not neither)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comments_target_check'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_target_check 
    CHECK (
      (project_id IS NOT NULL AND revival_id IS NULL) OR 
      (project_id IS NULL AND revival_id IS NOT NULL)
    );
  END IF;
END $$;

-- Add index for revival comments
CREATE INDEX IF NOT EXISTS idx_comments_revival_id ON comments(revival_id);

-- Add comment_count to revivals table for performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'revivals' AND column_name = 'comment_count'
  ) THEN
    ALTER TABLE revivals ADD COLUMN comment_count integer DEFAULT 0;
  END IF;
END $$;

-- Function to update revival comment count
CREATE OR REPLACE FUNCTION update_revival_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.revival_id IS NOT NULL THEN
    UPDATE revivals 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.revival_id;
  ELSIF TG_OP = 'DELETE' AND OLD.revival_id IS NOT NULL THEN
    UPDATE revivals 
    SET comment_count = GREATEST(0, comment_count - 1) 
    WHERE id = OLD.revival_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for revival comment count
DROP TRIGGER IF EXISTS trigger_update_revival_comment_count ON comments;
CREATE TRIGGER trigger_update_revival_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_revival_comment_count();

-- Update existing comment counts for revivals
UPDATE revivals r
SET comment_count = (
  SELECT COUNT(*) 
  FROM comments c 
  WHERE c.revival_id = r.id
);

-- Add some sample comments for revivals
INSERT INTO comments (user_id, revival_id, content) VALUES
((SELECT id FROM profiles WHERE username = 'TechGuru'), 
 (SELECT id FROM revivals WHERE title = 'Cart Recovery Pro - Modern Edition'), 
 'This revival is absolutely fantastic! The modern tech stack makes it so much more maintainable. Love the TypeScript implementation and the new analytics dashboard is incredibly detailed. Great work!'),

((SELECT id FROM profiles WHERE username = 'ByteMaster'), 
 (SELECT id FROM revivals WHERE title = 'RetroWave Reborn - Web3 Edition'), 
 'The Web3 integration is brilliant! NFT music ownership combined with this aesthetic is chef''s kiss. The smart contract implementation for royalties is exactly what independent artists need. Can''t wait to see this go live!'),

((SELECT id FROM profiles WHERE username = 'CryptoNinja'), 
 (SELECT id FROM revivals WHERE title = 'PixelQuest Web3 - Blockchain RPG'), 
 'As someone who loves both gaming and blockchain, this is a dream come true. The on-chain item ownership opens up so many possibilities for trading and cross-game compatibility. The marketplace integration is smooth too!');
