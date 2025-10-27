import { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { supabase, Badge } from '../lib/supabase';

export default function UserProfilePage() {
  const { profile } = useWallet();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadBadges();
    }
  }, [profile]);

  const loadBadges = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', profile.id);
      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-gray text-xl">Please connect your wallet</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between border-b border-zinc-gray pb-8 mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <img
            className="w-32 h-32"
            alt="Profile avatar"
            src={profile.avatar_url || 'https://via.placeholder.com/128'}
          />
          <div>
            <p className="text-white text-4xl font-bold">{profile.username}</p>
            <div className="flex items-center gap-2">
              <p className="text-zinc-gray text-base">{profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}</p>
              <button aria-label="Copy Address">
                <Copy className="text-zinc-gray hover:text-primary text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8 mb-8 flex-wrap">
        <div className="flex flex-1 flex-col gap-2 p-6 border border-zinc-gray min-w-[200px]">
          <p className="text-white text-lg">Total Revivals</p>
          <p className="text-white text-5xl font-bold">{profile.total_revivals}</p>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-6 border border-zinc-gray min-w-[200px]">
          <p className="text-white text-lg">Total Blessings Received</p>
          <p className="text-white text-5xl font-bold">{profile.total_blessings}</p>
        </div>
      </div>

      <div>
        <h2 className="text-white text-2xl font-bold py-5">NFT Badges</h2>
        {loading ? (
          <p className="text-zinc-gray">Loading badges...</p>
        ) : badges.length === 0 ? (
          <p className="text-zinc-gray">No badges earned yet</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="group relative bg-cover bg-center flex flex-col justify-end p-4 aspect-square border border-zinc-gray hover:border-primary"
                style={{ backgroundImage: `url("${badge.image_url}")` }}
              >
                <div className="absolute inset-0 bg-black/50 group-hover:bg-primary/20 transition-colors"></div>
                <p className="relative text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">{badge.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
