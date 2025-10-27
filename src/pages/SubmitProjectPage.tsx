import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { useWallet } from '../contexts/WalletContext';

const categories = ['Music', 'Gaming', 'Tech', 'Art', 'Education', 'Finance', 'Other'];

export default function SubmitProjectPage() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Tech',
    repo_url: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      const project = await projectService.create(formData);
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
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
            Project Name
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
            Description
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={6}
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary"
            placeholder="Describe the project and why it should be revived"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-bold mb-2">
            Category
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
            Repository URL (Optional)
          </label>
          <input
            type="url"
            value={formData.repo_url}
            onChange={(e) =>
              setFormData({ ...formData, repo_url: e.target.value })
            }
            className="w-full bg-background-dark border border-zinc-gray text-white px-4 py-3 focus:outline-none focus:border-primary"
            placeholder="https://github.com/..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-black py-3 px-6 font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Project'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="flex-1 bg-transparent border border-zinc-gray text-zinc-gray py-3 px-6 font-bold hover:bg-zinc-gray/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
