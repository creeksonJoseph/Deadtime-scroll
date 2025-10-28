import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, Info } from 'lucide-react';
import { revivalService } from '../services/revivalService';
import { projectService } from '../services/projectService';
import { useWallet } from '../contexts/WalletContext';
import { Project } from '../lib/supabase';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';

export default function ReviveProjectPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { isConnected, profile } = useWallet();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdRevivalId, setCreatedRevivalId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    github_url: '',
    deployed_url: '',
  });

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await projectService.getById(projectId!);
      setProject(data);
      setFormData({
        ...formData,
        title: `${data.name} - Revived`,
      });
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isConnected || !profile || !projectId) {
      setNotification({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to revive a project',
      });
      return;
    }

    if (!formData.title.trim()) {
      setNotification({
        type: 'error',
        title: 'Title Required',
        message: 'Please provide a title for your revival',
      });
      return;
    }

    try {
      setLoading(true);
      const revival = await revivalService.create({
        project_id: projectId,
        title: formData.title,
        description: formData.description,
        github_url: formData.github_url || undefined,
        deployed_url: formData.deployed_url || undefined,
      });
      setCreatedRevivalId(revival.id);
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error creating revival:', error);
      setNotification({
        type: 'error',
        title: 'Revival Failed',
        message: 'Failed to create revival. Please try again.',
      });
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
            Please connect your wallet to revive a project
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-10 h-10 text-primary" />
          <h1 className="text-white text-4xl font-bold">Revive Project</h1>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-white text-xl font-bold mb-2">{project.name}</h2>
          <p className="text-zinc-400">{project.description}</p>
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-cyan-400 font-bold mb-1">Getting Started</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Don't worry if you haven't started working on this yet! You can leave the details empty for now
              and update them later from your <span className="text-primary font-semibold">My Revivals</span> page
              as you make progress. This helps you claim the revival and share your plans with the community.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white text-sm font-bold mb-2">
            Revival Title <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary"
            placeholder="What will you call your revival?"
          />
          <p className="text-zinc-500 text-sm mt-1">Give your revival a unique name</p>
        </div>

        <div>
          <label className="block text-white text-sm font-bold mb-2">
            What are you planning to do? <span className="text-zinc-500 text-xs">(Optional)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={6}
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary resize-none"
            placeholder="Describe what you plan to improve or add to this project. You can leave this empty and update it later from My Revivals page as you make progress..."
          />
          <p className="text-zinc-500 text-sm mt-1">
            Share your vision for the revival. Can be updated anytime!
          </p>
        </div>

        <div>
          <label className="block text-white text-sm font-bold mb-2">
            GitHub Repository URL <span className="text-zinc-500 text-xs">(Optional)</span>
          </label>
          <input
            type="url"
            value={formData.github_url}
            onChange={(e) =>
              setFormData({ ...formData, github_url: e.target.value })
            }
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary"
            placeholder="https://github.com/username/repo"
          />
          <p className="text-zinc-500 text-sm mt-1">Add this when you've created your repository</p>
        </div>

        <div>
          <label className="block text-white text-sm font-bold mb-2">
            Deployed Site URL <span className="text-zinc-500 text-xs">(Optional)</span>
          </label>
          <input
            type="url"
            value={formData.deployed_url}
            onChange={(e) =>
              setFormData({ ...formData, deployed_url: e.target.value })
            }
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary"
            placeholder="https://your-revival.vercel.app"
          />
          <p className="text-zinc-500 text-sm mt-1">Add this when you've deployed your revival</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">💡 Pro Tip</h3>
          <p className="text-zinc-400 text-sm">
            You can start a revival with just a title and description of your plans. As you work on the project,
            come back to <strong className="text-white">My Revivals</strong> page to update your progress,
            add links, and share what you've built!
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-primary to-cyan-500 text-black px-6 py-4 text-lg font-bold hover:from-primary/80 hover:to-cyan-500/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering Revival...' : 'Register Revival'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="bg-transparent border border-zinc-gray text-zinc-gray px-6 py-4 font-bold hover:bg-zinc-gray/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          navigate('/my-revivals');
        }}
        revivalId={createdRevivalId || undefined}
      />
    </div>
  );
}
