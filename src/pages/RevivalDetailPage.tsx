import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { revivalService } from '../services/revivalService';
import { Revival } from '../lib/supabase';

export default function RevivalDetailPage() {
  const { revivalId } = useParams();
  const [revival, setRevival] = useState<Revival | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (revivalId) {
      loadRevival();
    }
  }, [revivalId]);

  const loadRevival = async () => {
    try {
      setLoading(true);
      const data = await revivalService.getById(revivalId!);
      setRevival(data);
    } catch (error) {
      console.error('Error loading revival:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Loading revival...</p>
      </div>
    );
  }

  if (!revival) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Revival not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-zinc-gray text-5xl font-bold mb-2">{revival.title}</h1>
          {revival.profiles && (
            <p className="text-zinc-gray text-lg">Revived by @{revival.profiles.username}</p>
          )}
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          {revival.github_url && (
            <a
              href={revival.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-background-dark px-6 py-3 font-bold hover:bg-primary/80"
            >
              GitHub
            </a>
          )}
          {revival.deployed_url && (
            <a
              href={revival.deployed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-zinc-gray text-zinc-gray px-6 py-3 font-bold hover:bg-zinc-gray/20"
            >
              Live Site
            </a>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-zinc-gray text-2xl font-bold mb-4">Revival Log</h2>
          <p className="text-zinc-gray text-base leading-relaxed">{revival.description}</p>
        </div>

        <div className="border-t border-zinc-gray/50 py-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-zinc-gray text-xl font-bold mb-2">Bless this Revival</h3>
              <p className="text-zinc-gray text-sm">Show your support and help this project gain visibility.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-primary text-background-dark px-6 py-3 text-lg font-bold hover:bg-primary/80">
                <Sparkles />
                <span>Bless</span>
              </button>
              <p className="text-primary text-lg font-bold">Total Blessings: {revival.blessing_count}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
