-- Update blessing functions to work with new blessing system
CREATE OR REPLACE FUNCTION increment_revival_blessings(revival_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the revival blessing count
  UPDATE revivals
  SET blessing_count = blessing_count + 1
  WHERE id = revival_id_param;
  
  -- Check and award badges after blessing count update
  PERFORM check_and_award_badges(revival_id_param);
END;
$$;

-- Function to add a blessing (used by frontend)
CREATE OR REPLACE FUNCTION add_revival_blessing(p_revival_id uuid, p_user_wallet text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  blessing_added boolean := false;
BEGIN
  -- Try to insert the blessing (will fail if already exists due to unique constraint)
  BEGIN
    INSERT INTO revival_blessings (revival_id, user_wallet)
    VALUES (p_revival_id, p_user_wallet);
    
    blessing_added := true;
    
    -- Update revival blessing count
    UPDATE revivals
    SET blessing_count = blessing_count + 1
    WHERE id = p_revival_id;
    
    -- Check and award badges
    PERFORM check_and_award_badges(p_revival_id);
    
  EXCEPTION WHEN unique_violation THEN
    -- User already blessed this revival
    blessing_added := false;
  END;
  
  RETURN blessing_added;
END;
$$;