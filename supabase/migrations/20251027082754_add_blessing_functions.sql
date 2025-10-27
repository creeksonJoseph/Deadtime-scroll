/*
  # Add SQL Functions for Blessing Counts

  Creates functions to safely increment blessing counts for projects and revivals.

  ## Functions

  1. `increment_project_blessings` - Increments blessing count for a project
  2. `increment_revival_blessings` - Increments blessing count for a revival
*/

-- Function to increment project blessings
CREATE OR REPLACE FUNCTION increment_project_blessings(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE projects
  SET blessing_count = blessing_count + 1
  WHERE id = project_id;
END;
$$;

-- Function to increment revival blessings
CREATE OR REPLACE FUNCTION increment_revival_blessings(revival_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE revivals
  SET blessing_count = blessing_count + 1
  WHERE id = revival_id;
END;
$$;