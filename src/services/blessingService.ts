import { supabase } from '../lib/supabase';

export interface Blessing {
  id: string;
  revival_id: string;
  user_wallet: string;
  created_at: string;
}

export interface Badge {
  id: string;
  user_wallet: string;
  badge_type: 'grave_keeper' | 'necromancer' | 'digital_ghost' | 'phoenix' | 'soul_shepherd' | 'master_curator';
  revival_id: string;
  earned_at: string;
  claimed: boolean;
  token_id?: string;
  tx_hash?: string;
}

export interface BadgeInfo {
  type: 'grave_keeper' | 'necromancer' | 'digital_ghost' | 'phoenix' | 'soul_shepherd' | 'master_curator';
  name: string;
  threshold: number;
  description: string;
  color: string;
  icon: string;
}

export const BADGE_TIERS: BadgeInfo[] = [
  {
    type: 'grave_keeper',
    name: 'Grave Keeper',
    threshold: 1,
    description: 'Earned 1 blessing on a revival',
    color: 'from-gray-400 to-gray-600',
    icon: '⚰️'
  },
  {
    type: 'necromancer',
    name: 'Necromancer',
    threshold: 30,
    description: 'Earned 30 blessings on a revival',
    color: 'from-purple-400 to-purple-600',
    icon: '🔮'
  },
  {
    type: 'digital_ghost',
    name: 'Digital Ghost',
    threshold: 50,
    description: 'Earned 50 blessings on a revival',
    color: 'from-cyan-400 to-cyan-600',
    icon: '👻'
  },
  {
    type: 'phoenix',
    name: 'Phoenix',
    threshold: 70,
    description: 'Earned 70 blessings on a revival',
    color: 'from-orange-400 to-red-600',
    icon: '🔥'
  },
  {
    type: 'soul_shepherd',
    name: 'Soul Shepherd',
    threshold: 100,
    description: 'Earned 100 blessings on a revival',
    color: 'from-yellow-400 to-amber-600',
    icon: '✨'
  },
  {
    type: 'master_curator',
    name: 'Master Curator',
    threshold: 150,
    description: 'Earned 150+ blessings on a revival',
    color: 'from-pink-400 to-rose-600',
    icon: '👑'
  }
];

export async function blessRevival(revivalId: string, userWallet: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already blessed this revival
    const blessedKey = `blessed_revival_${revivalId}_${userWallet}`;
    if (localStorage.getItem(blessedKey) === 'true') {
      return { success: false, error: 'You cannot bless a project twice' };
    }

    // Try the new function first, fallback to old method
    let { data, error } = await supabase.rpc('add_revival_blessing', {
      p_revival_id: revivalId,
      p_user_wallet: userWallet
    });

    // If new function doesn't exist, use old method
    if (error && (error.message?.includes('add_revival_blessing') || error.code === 'PGRST202')) {
      const { error: oldError } = await supabase.rpc('increment_revival_blessings', {
        revival_id_param: revivalId
      });
      
      if (oldError) {
        throw oldError;
      }
      
      // Manually create badge if threshold reached
      await checkAndCreateBadge(revivalId);
      
      // Mark as blessed locally
      localStorage.setItem(blessedKey, 'true');
      return { success: true };
    }

    if (error) {
      throw error;
    }

    if (!data) {
      return { success: false, error: 'You cannot bless a project twice' };
    }

    // Mark as blessed locally
    localStorage.setItem(blessedKey, 'true');
    return { success: true };
  } catch (error) {
    console.error('Error blessing revival:', error);
    return { success: false, error: `Failed to bless revival: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function getRevivalBlessingCount(revivalId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('revivals')
      .select('blessing_count')
      .eq('id', revivalId)
      .single();

    if (error) throw error;
    return data?.blessing_count || 0;
  } catch (error) {
    console.error('Error getting blessing count:', error);
    return 0;
  }
}

export async function userHasBlessedRevival(revivalId: string, userWallet: string): Promise<boolean> {
  try {
    const blessedKey = `blessed_revival_${revivalId}_${userWallet}`;
    return localStorage.getItem(blessedKey) === 'true';
  } catch (error) {
    console.error('Error checking if user blessed revival:', error);
    return false;
  }
}

export async function getUserBadges(userWallet: string): Promise<Badge[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_wallet', userWallet)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

export async function getUnclaimedBadges(userWallet: string): Promise<Badge[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_wallet', userWallet)
      .eq('claimed', false)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching unclaimed badges:', error);
    return [];
  }
}

export async function markBadgeAsClaimed(
  badgeId: string,
  tokenId: string,
  txHash: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_badges')
      .update({
        claimed: true,
        token_id: tokenId,
        tx_hash: txHash
      })
      .eq('id', badgeId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking badge as claimed:', error);
    return { success: false, error: 'Failed to update badge status' };
  }
}

export function getBadgeInfo(badgeType: string): BadgeInfo | undefined {
  return BADGE_TIERS.find(tier => tier.type === badgeType);
}

export function getNextBadgeTier(currentBlessings: number): BadgeInfo | null {
  for (const tier of BADGE_TIERS) {
    if (currentBlessings < tier.threshold) {
      return tier;
    }
  }
  return null;
}

export function getCurrentBadgeTier(currentBlessings: number): BadgeInfo | null {
  const sortedTiers = [...BADGE_TIERS].reverse();
  for (const tier of sortedTiers) {
    if (currentBlessings >= tier.threshold) {
      return tier;
    }
  }
  return null;
}

// Manual badge creation for production readiness
export async function checkAndCreateBadge(revivalId: string): Promise<void> {
  try {
    // Get revival details and blessing count
    const { data: revival, error: revivalError } = await supabase
      .from('revivals')
      .select('blessing_count, reviver_wallet')
      .eq('id', revivalId)
      .single();

    if (revivalError || !revival?.reviver_wallet) {
      console.error('Error fetching revival for badge creation:', revivalError);
      return;
    }

    const blessingCount = revival.blessing_count || 0;
    
    // Determine which badge to award
    let badgeType: string | null = null;
    if (blessingCount >= 150) {
      badgeType = 'master_curator';
    } else if (blessingCount >= 100) {
      badgeType = 'soul_shepherd';
    } else if (blessingCount >= 70) {
      badgeType = 'phoenix';
    } else if (blessingCount >= 50) {
      badgeType = 'digital_ghost';
    } else if (blessingCount >= 30) {
      badgeType = 'necromancer';
    } else if (blessingCount >= 1) {
      badgeType = 'grave_keeper';
    }

    if (!badgeType) return;

    // Check if badge already exists
    const { data: existingBadge } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_wallet', revival.reviver_wallet)
      .eq('badge_type', badgeType)
      .eq('revival_id', revivalId)
      .single();

    if (existingBadge) return; // Badge already exists

    // Create the badge
    const { error: badgeError } = await supabase
      .from('user_badges')
      .insert({
        user_wallet: revival.reviver_wallet,
        badge_type: badgeType,
        revival_id: revivalId,
        earned_at: new Date().toISOString(),
        claimed: false
      });

    if (badgeError) {
      console.error('Error creating badge:', badgeError);
    } else {
      console.log(`Badge ${badgeType} created for user ${revival.reviver_wallet}`);
    }
  } catch (error) {
    console.error('Error in checkAndCreateBadge:', error);
  }
}
