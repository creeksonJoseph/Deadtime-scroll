import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Award, ExternalLink } from 'lucide-react';
import { profileService } from '../services/profileService';
import { getUserBadges } from '../services/blessingService';
import { Profile, Badge } from '../lib/supabase';
import { useWallet } from '../contexts/WalletContext';
import BadgeDisplay from '../components/BadgeDisplay';

export default function PublicProfilePage() {
  const { walletAddress: viewingWallet } = useParams<{ walletAddress: string }>();
  const { profile: currentUser } = useWallet();
  const currentUserWallet = currentUser?.wallet_address;
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUserWallet && viewingWallet &&
    currentUserWallet.toLowerCase() === viewingWallet.toLowerCase();

  useEffect(() => {
    if (isOwnProfile) {
      navigate('/profile');
      return;
    }

    if (viewingWallet) {
      loadProfile();
      loadBadges();
    }
  }, [viewingWallet, isOwnProfile]);

  const loadProfile = async () => {
    if (!viewingWallet) return;

    try {
      setLoading(true);
      const data = await profileService.getByWallet(viewingWallet);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBadges = async () => {
    if (!viewingWallet) return;
    const userBadges = await getUserBadges(viewingWallet);
    setBadges(userBadges);
  };

  const handleMessage = async () => {
    if (!currentUser?.id || !profile?.id) return;
    navigate(`/chat/${profile.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-zinc-400 text-xl mb-4">Profile not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-dark min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-primary text-4xl font-black">User Profile</h1>
          <button
            onClick={handleMessage}
            className="flex items-center gap-2 bg-primary text-black px-6 py-3 font-bold hover:bg-primary/80 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative">
              <img
                src={profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm font-semibold mb-2">
                  Username
                </label>
                <p className="text-white text-xl font-bold">{profile.username}</p>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm font-semibold mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-zinc-500 font-mono text-sm break-all">
                    {viewingWallet}
                  </p>
                  <a
                    href={`https://sepolia.scrollscan.com/address/${viewingWallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {profile.bio && (
                <div>
                  <label className="block text-zinc-400 text-sm font-semibold mb-2">
                    Bio
                  </label>
                  <p className="text-zinc-300">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-zinc-400 text-sm font-semibold mb-2">Total Blessings</h3>
            <p className="text-primary text-3xl font-bold">{profile.total_blessings}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-zinc-400 text-sm font-semibold mb-2">Projects Submitted</h3>
            <p className="text-primary text-3xl font-bold">{profile.projects_count}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-zinc-400 text-sm font-semibold mb-2">Revivals Created</h3>
            <p className="text-primary text-3xl font-bold">{profile.revivals_count}</p>
          </div>
        </div>

        <BadgeDisplay
          badges={badges}
          isOwnProfile={false}
        />
      </div>
    </div>
  );
}
