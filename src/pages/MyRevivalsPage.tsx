import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { revivalService } from '../services/revivalService';
import { useWallet } from '../contexts/WalletContext';
import { Revival } from '../lib/supabase';
import { PlusCircle } from 'lucide-react';

export default function MyRevivalsPage() {
  const { isConnected, profile } = useWallet();
  const [revivals, setRevivals] = useState<Revival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && profile) {
      loadRevivals();
    } else {
      setLoading(false);
    }
  }, [isConnected, profile]);

  const loadRevivals = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const data = await revivalService.getByUser(profile.id);
      setRevivals(data);
    } catch (error) {
      console.error('Error loading revivals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h2 className="text-white text-3xl font-bold mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-zinc-gray text-lg">
            Please connect your wallet to view your revivals
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-gray text-xl">Loading your revivals...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white text-4xl font-bold mb-2">My Revivals</h1>
            <p className="text-zinc-gray text-lg">
              Projects you've brought back to life
            </p>
          </div>
          <Link
            to="/projects"
            className="flex items-center gap-2 bg-primary text-black px-6 py-3 font-bold hover:bg-white transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Revive a Project</span>
          </Link>
        </div>

        {revivals.length === 0 ? (
          <div className="text-center py-16 border border-zinc-gray">
            <p className="text-zinc-gray text-xl mb-4">
              You haven't revived any projects yet
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 bg-primary text-black px-6 py-3 font-bold hover:bg-white transition-colors"
            >
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {revivals.map((revival) => (
              <div
                key={revival.id}
                className="bg-background-dark border border-zinc-gray p-6 hover:border-primary transition-colors"
              >
                <h3 className="text-white text-xl font-bold mb-2">
                  {revival.title}
                </h3>
                {revival.projects && (
                  <p className="text-zinc-gray text-sm mb-4">
                    Revival of: {revival.projects.name}
                  </p>
                )}
                <p className="text-zinc-gray mb-4 line-clamp-3">
                  {revival.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-primary" />
                    <span className="text-zinc-gray text-sm">
                      {revival.blessing_count} Blessings
                    </span>
                  </div>
                  <span className="text-zinc-gray text-sm">
                    {new Date(revival.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  to={`/projects/${revival.project_id}/revivals/${revival.id}`}
                  className="block w-full text-center bg-transparent border border-zinc-gray text-zinc-gray py-2 hover:bg-primary hover:text-black hover:border-primary font-bold transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
