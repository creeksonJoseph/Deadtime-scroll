import { useState, useEffect } from 'react';
import { Heart, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { Profile } from '../lib/supabase';

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await profileService.getLeaderboard(50);
      setProfiles(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-neon-green text-4xl font-bold mb-2">Community Leaderboard</h1>
          <p className="text-zinc-400 text-base">See who's at the top of the DeadTime community.</p>
        </div>

        <div className="border border-zinc-700 bg-black">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-4 py-3 text-left text-zinc-400 text-sm font-bold">Rank</th>
                <th className="px-4 py-3 text-left text-zinc-400 text-sm font-bold">User</th>
                <th className="px-4 py-3 text-left text-zinc-400 text-sm font-bold">Blessings</th>
                <th className="px-4 py-3 text-left text-zinc-400 text-sm font-bold">Revivals</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile, index) => (
                <tr key={profile.id} className="border-b border-zinc-700 hover:border-neon-green hover:border-l-4 group">
                  <td className="px-4 py-4 text-neon-green text-lg font-bold">{index + 1}</td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/profile/${profile.wallet_address}`}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <img
                        className="w-10 h-10 border border-zinc-700 rounded-full group-hover:border-neon-green transition-colors"
                        alt={profile.username || 'User'}
                        src={profile.avatar_url || 'https://via.placeholder.com/40'}
                      />
                      <span className="text-zinc-400 text-sm group-hover:text-neon-green transition-colors">{profile.username}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-zinc-400 text-sm">
                    <div className="flex items-center gap-2">
                      <Heart className="text-neon-green" />
                      <span>{profile.total_blessings}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-400 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-neon-green" />
                      <span>{profile.total_revivals}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
