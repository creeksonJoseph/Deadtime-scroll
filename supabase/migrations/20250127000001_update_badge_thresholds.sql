-- Update badge thresholds to match frontend (1 blessing for first badge)
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
  
  -- Determine which badge to award based on count (updated thresholds)
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
  ELSIF v_blessing_count >= 1 THEN  -- Changed from 10 to 1
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