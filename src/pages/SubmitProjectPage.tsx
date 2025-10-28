import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { useWallet } from '../contexts/WalletContext';
import Notification from '../components/Notification';

const categories = ['Music', 'Gaming', 'Tech', 'Art', 'Education', 'Finance', 'Other'];

export default function SubmitProjectPage() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Tech',
    repo_url: '',
    deployed_url: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setNotification({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to submit a project',
      });
      return;
    }

    if (!formData.repo_url.trim()) {
      setNotification({
        type: 'error',
        title: 'Repository Required',
        message: 'GitHub repository URL is required',
      });
      return;
    }

    try {
      setLoading(true);
      const project = await projectService.create({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        repo_url: formData.repo_url,
        deployed_url: formData.deployed_url || undefined,
      });
      setNotification({
        type: 'success',
        title: 'Project Submitted!',
        message: 'Your project has been successfully registered',
      });
      setTimeout(() => {
        navigate(`/projects/${project.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating project:', error);
      setNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to create project. Please try again.',
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
            Please connect your wallet to submit a project
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-white text-4xl font-bold mb-2">Submit Project</h1>
        <p className="text-zinc-gray text-lg">
          Register an abandoned project that needs revival
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white text-sm font-bold mb-2">
            Project Name <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary"
            placeholder="Enter project name"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-bold mb-2">
            Description <span className="text-primary">*</span>
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={6}
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary resize-none"
            placeholder="Describe the project and why it should be revived"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-bold mb-2">
            Category <span className="text-primary">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white text-sm font-bold mb-2">
            GitHub Repository URL <span className="text-primary">*</span>
          </label>
          <input
            type="url"
            required
            value={formData.repo_url}
            onChange={(e) =>
              setFormData({ ...formData, repo_url: e.target.value })
            }
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary"
            placeholder="https://github.com/username/repo"
          />
          <p className="text-zinc-500 text-sm mt-1">Required - Your project's GitHub repository</p>
        </div>

        <div>
          <label className="block text-white text-sm font-bold mb-2">
            Deployed Site URL (Optional)
          </label>
          <input
            type="url"
            value={formData.deployed_url}
            onChange={(e) =>
              setFormData({ ...formData, deployed_url: e.target.value })
            }
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary"
            placeholder="https://your-project.vercel.app"
          />
          <p className="text-zinc-500 text-sm mt-1">Optional - Live demo link if available</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-black px-6 py-4 text-lg font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Project'}
        </button>
      </form>

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
