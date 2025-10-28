import { useState, useEffect, useRef } from 'react';
import { Camera, Edit2, Save, X } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { profileService } from '../services/profileService';

export default function UserProfilePage() {
  const { profile, walletAddress } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);

        if (walletAddress) {
          await profileService.update(walletAddress, { avatar_url: base64 });
          window.location.reload();
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!walletAddress) return;

    try {
      setSaving(true);
      await profileService.update(walletAddress, {
        username,
        bio,
        avatar_url: avatarUrl,
      });
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Please connect your wallet to view profile</p>
      </div>
    );
  }

  return (
    <div className="bg-background-dark min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-primary text-4xl font-black">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-primary text-black px-6 py-3 font-bold hover:bg-primary/80 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 border border-zinc-gray text-zinc-gray px-6 py-3 font-bold hover:bg-zinc-gray/20 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-black px-6 py-3 font-bold hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute inset-0 w-32 h-32 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isUploading ? (
                  <div className="text-white text-sm">Uploading...</div>
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm font-semibold mb-2">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your username"
                  />
                ) : (
                  <p className="text-white text-xl font-bold">{username}</p>
                )}
              </div>

              <div>
                <label className="block text-zinc-400 text-sm font-semibold mb-2">
                  Wallet Address
                </label>
                <p className="text-zinc-500 font-mono text-sm break-all">
                  {walletAddress}
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm font-semibold mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-zinc-300">
                    {bio || 'No bio added yet. Click edit to add one!'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

    
      </div>
    </div>
  );
}
