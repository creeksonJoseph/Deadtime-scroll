-- Fix RLS policies and add triggers for revival count updates

-- Drop existing restrictive policies for revivals
DROP POLICY IF EXISTS "Authenticated users can create revivals" ON revivals;
DROP POLICY IF EXISTS "Revivers can update own revivals" ON revivals;

-- Create new public policies for revivals
CREATE POLICY "Anyone can create revivals"
  ON revivals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update revivals"
  ON revivals FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Drop existing restrictive policies for projects
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Creators can update own projects" ON projects;

-- Create new public policies for projects
CREATE POLICY "Anyone can create projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update projects"
  ON projects FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Drop existing restrictive policies for comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Create new public policies for comments
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

-- Function to update project revival count
CREATE OR REPLACE FUNCTION update_project_revival_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update revival count for the project (either direct project or root project)
    IF NEW.project_id IS NOT NULL THEN
      UPDATE projects 
      SET revival_count = revival_count + 1 
      WHERE id = NEW.project_id;
    ELSIF NEW.root_project_id IS NOT NULL THEN
      UPDATE projects 
      SET revival_count = revival_count + 1 
      WHERE id = NEW.root_project_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease revival count for the project
    IF OLD.project_id IS NOT NULL THEN
      UPDATE projects 
      SET revival_count = GREATEST(0, revival_count - 1) 
      WHERE id = OLD.project_id;
    ELSIF OLD.root_project_id IS NOT NULL THEN
      UPDATE projects 
      SET revival_count = GREATEST(0, revival_count - 1) 
      WHERE id = OLD.root_project_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project revival count
DROP TRIGGER IF EXISTS trigger_update_project_revival_count ON revivals;
CREATE TRIGGER trigger_update_project_revival_count
AFTER INSERT OR DELETE ON revivals
FOR EACH ROW
EXECUTE FUNCTION update_project_revival_count();

-- Recalculate all project revival counts to ensure consistency
UPDATE projects p
SET revival_count = (
  SELECT COUNT(*)
  FROM revivals r
  WHERE r.project_id = p.id OR r.root_project_id = p.id
);