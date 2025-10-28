import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { revivalService } from '../services/revivalService';
import { Revival } from '../lib/supabase';

export default function RevivalListPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [revivals, setRevivals] = useState<Revival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadRevivals();
    }
  }, [projectId]);

  const loadRevivals = async () => {
    try {
      setLoading(true);
      const data = await revivalService.getByProject(projectId!);
      setRevivals(data);
    } catch (error) {
      console.error('Error loading revivals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Loading revivals...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors mb-6 bg-zinc-900/50 hover:bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-800 hover:border-primary/30"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <h1 className="text-primary text-4xl font-black mb-8">Project Revivals</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {revivals.map((revival) => (
            <div key={revival.id} className="flex flex-col gap-4 p-6 bg-background-dark border border-zinc-gray hover:border-primary transition-colors">
              <div>
                <h2 className="text-white text-xl font-bold mb-2">{revival.title}</h2>
                {revival.profiles && (
                  <Link
                    to={`/profile/${revival.reviver_wallet}`}
                    className="text-zinc-gray text-sm mb-2 hover:text-primary transition-colors inline-block"
                  >
                    By {revival.profiles.username}
                  </Link>
                )}
                <p className="text-zinc-gray text-base line-clamp-3">{revival.description}</p>
                <div className="flex items-center gap-2 mt-4">
                  <Sparkles className="text-primary w-5 h-5" />
                  <p className="text-zinc-gray text-sm font-semibold">{revival.blessing_count} Blessings</p>
                </div>
              </div>
              <Link
                to={`/projects/${projectId}/revivals/${revival.id}`}
                className="bg-primary text-background-dark py-3 px-4 text-center font-bold hover:bg-primary/80 transition-colors"
              >
                View Revival Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
