/*
  # Fix Security and Performance Issues

  This migration addresses several security and performance issues identified in the database:

  ## Performance Fixes
  
  1. **Add Missing Index**
     - Add index for `comments.parent_id` foreign key to improve query performance
  
  2. **Remove Unused Indexes**
     - Drop `idx_comments_user` (unused)
     - Drop `idx_projects_creator` (unused)
     - Drop `idx_comments_revival_id` (duplicate of idx_comments_revival)
  
  ## Security Fixes
  
  3. **Fix Function Search Paths**
     - Update `increment_project_blessings` with immutable search_path
     - Update `increment_revival_blessings` with immutable search_path
     - Update `update_revival_comment_count` with immutable search_path
     - This prevents potential security vulnerabilities from search_path manipulation
*/

-- 1. Add missing index for parent_id foreign key
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 2. Drop unused indexes
DROP INDEX IF EXISTS idx_comments_user;
DROP INDEX IF EXISTS idx_projects_creator;

-- 3. Drop duplicate index (keeping idx_comments_revival, dropping idx_comments_revival_id)
DROP INDEX IF EXISTS idx_comments_revival_id;

-- 4. Fix function search paths

-- Drop trigger first
DROP TRIGGER IF EXISTS trigger_update_revival_comment_count ON comments;

-- Drop existing functions
DROP FUNCTION IF EXISTS increment_project_blessings(uuid);
DROP FUNCTION IF EXISTS increment_revival_blessings(uuid);
DROP FUNCTION IF EXISTS update_revival_comment_count();

-- Recreate increment_project_blessings with secure search_path
CREATE FUNCTION increment_project_blessings(project_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE projects
  SET blessing_count = blessing_count + 1
  WHERE id = project_id_param;
END;
$$;

-- Recreate increment_revival_blessings with secure search_path
CREATE FUNCTION increment_revival_blessings(revival_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE revivals
  SET blessing_count = blessing_count + 1
  WHERE id = revival_id_param;
END;
$$;

-- Recreate update_revival_comment_count with secure search_path
CREATE FUNCTION update_revival_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_update_revival_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_revival_comment_count();
