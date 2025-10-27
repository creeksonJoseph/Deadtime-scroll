import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Edit2, Save, X, ExternalLink, GitBranch } from 'lucide-react';
import { revivalService } from '../services/revivalService';
import { useWallet } from '../contexts/WalletContext';
import { Revival } from '../lib/supabase';

export default function MyRevivalsPage() {
  const { profile, isConnected } = useWallet();
  const [revivals, setRevivals] = useState<Revival[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    github_url: '',
    deployed_url: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      loadRevivals();
    }
  }, [profile]);

  const loadRevivals = async () => {
    try {
      setLoading(true);
      const data = await revivalService.getByUser(profile!.id);
      setRevivals(data);
    } catch (error) {
      console.error('Error loading revivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (revival: Revival) => {
    setEditingId(revival.id);
    setEditForm({
      title: revival.title,
      description: revival.description || '',
      github_url: revival.github_url || '',
      deployed_url: revival.deployed_url || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      description: '',
      github_url: '',
      deployed_url: '',
    });
  };

  const saveChanges = async (revivalId: string) => {
    try {
      setSaving(true);
      await revivalService.update(revivalId, editForm);
      await loadRevivals();
      setEditingId(null);
      alert('Revival updated successfully!');
    } catch (error) {
      console.error('Error updating revival:', error);
      alert('Failed to update revival');
    } finally {
      setSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-white text-3xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-zinc-400 text-lg">Please connect your wallet to view your revivals</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Loading your revivals...</p>
      </div>
    );
  }

  return (
    <div className="bg-background-dark min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-primary" />
              <h1 className="text-white text-4xl font-bold">My Revivals</h1>
            </div>
            <Link
              to="/projects"
              className="bg-primary text-black px-6 py-3 font-bold hover:bg-primary/80 transition-colors"
            >
              Revive a Project
            </Link>
          </div>
          <p className="text-zinc-400 mt-2">
            Manage your project revivals and update your progress
          </p>
        </div>

        {revivals.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-white text-2xl font-bold mb-2">No Revivals Yet</h3>
            <p className="text-zinc-400 mb-6">
              Start reviving abandoned projects and they'll appear here
            </p>
            <Link
              to="/projects"
              className="inline-block bg-primary text-black px-8 py-3 font-bold hover:bg-primary/80 transition-colors"
            >
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {revivals.map((revival) => {
              const isEditing = editingId === revival.id;

              return (
                <div
                  key={revival.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-primary/50 transition-colors"
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-zinc-400 text-sm font-semibold mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm font-semibold mb-2">
                          Description / Progress
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          rows={4}
                          className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded focus:outline-none focus:border-primary resize-none"
                          placeholder="What have you done with this project? Share your progress..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-400 text-sm font-semibold mb-2">
                            GitHub URL
                          </label>
                          <input
                            type="url"
                            value={editForm.github_url}
                            onChange={(e) =>
                              setEditForm({ ...editForm, github_url: e.target.value })
                            }
                            className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded focus:outline-none focus:border-primary"
                            placeholder="https://github.com/..."
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-sm font-semibold mb-2">
                            Live Demo URL
                          </label>
                          <input
                            type="url"
                            value={editForm.deployed_url}
                            onChange={(e) =>
                              setEditForm({ ...editForm, deployed_url: e.target.value })
                            }
                            className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded focus:outline-none focus:border-primary"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => saveChanges(revival.id)}
                          disabled={saving}
                          className="flex items-center gap-2 bg-primary text-black px-6 py-2 font-bold hover:bg-primary/80 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={saving}
                          className="flex items-center gap-2 border border-zinc-700 text-zinc-400 px-6 py-2 font-bold hover:bg-zinc-800 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white text-2xl font-bold">{revival.title}</h3>
                            <div className="flex items-center gap-1 text-primary">
                              <Sparkles className="w-5 h-5" />
                              <span className="font-semibold">{revival.blessing_count}</span>
                            </div>
                          </div>
                          {revival.projects && (
                            <p className="text-zinc-500 text-sm mb-2">
                              Revival of:{' '}
                              <Link
                                to={`/projects/${revival.projects.id}`}
                                className="text-primary hover:text-cyan-400 transition-colors"
                              >
                                {revival.projects.name}
                              </Link>
                            </p>
                          )}
                          <p className="text-zinc-400 text-sm">
                            Created {new Date(revival.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => startEditing(revival)}
                          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                      </div>

                      {revival.description ? (
                        <p className="text-zinc-300 mb-4 leading-relaxed">
                          {revival.description}
                        </p>
                      ) : (
                        <p className="text-zinc-600 italic mb-4">
                          No description yet. Click Edit to add what you're planning or what you've done so far.
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {revival.github_url && (
                          <a
                            href={revival.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition-colors text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            GitHub
                          </a>
                        )}
                        {revival.deployed_url && (
                          <a
                            href={revival.deployed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition-colors text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Live Demo
                          </a>
                        )}
                        <Link
                          to={`/revivals/${revival.id}`}
                          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition-colors text-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          View Revival
                        </Link>
                        <Link
                          to={`/revivals/${revival.id}/bloodline`}
                          className="flex items-center gap-2 bg-gradient-to-r from-primary to-cyan-500 text-black px-4 py-2 rounded font-bold hover:from-primary/80 hover:to-cyan-500/80 transition-all text-sm"
                        >
                          <GitBranch className="w-4 h-4" />
                          Bloodline
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
