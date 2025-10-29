import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Code, RefreshCw, Sparkles, GitBranch, ArrowLeft } from 'lucide-react';
import { projectService } from '../services/projectService';
import { revivalService } from '../services/revivalService';
import { Project } from '../lib/supabase';
import CommentSection from '../components/CommentSection';
import { useWallet } from '../contexts/WalletContext';

function ReviveButton({ project }: { project: Project }) {
  const { profile } = useWallet();
  const [hasRevived, setHasRevived] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIfRevived();
  }, [profile, project.id]);

  const checkIfRevived = async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    try {
      const revivals = await revivalService.getByUser(profile.id);
      const hasRevivedProject = revivals.some(revival => revival.project_id === project.id);
      setHasRevived(hasRevivedProject);
    } catch (error) {
      console.error('Error checking revivals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-400 px-6 py-3 font-bold">
        <Sparkles className="w-5 h-5" />
        Loading...
      </div>
    );
  }

  // User is the project creator
  if (project.creator_id === profile?.id) {
    return (
      <div className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-400 px-6 py-3 font-bold cursor-not-allowed" title="You cannot revive your own project">
        <Sparkles className="w-5 h-5" />
        Your Project
      </div>
    );
  }

  // User already revived this project
  if (hasRevived) {
    return (
      <div className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-400 px-6 py-3 font-bold cursor-not-allowed" title="You have already revived this project">
        <Sparkles className="w-5 h-5" />
        Already Revived
      </div>
    );
  }

  // User can revive this project
  return (
    <Link
      to={`/projects/${project.id}/revive`}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-cyan-500 text-black px-6 py-3 font-bold hover:from-primary/80 hover:to-cyan-500/80 transition-all"
    >
      <Sparkles className="w-5 h-5" />
      Revive This Project
    </Link>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { isConnected } = useWallet();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getById(projectId!);
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Project not found</p>
      </div>
    );
  }

  return (
    <div className="bg-background-dark min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors mb-6 bg-zinc-900/50 hover:bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-800 hover:border-primary/30"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <div className="mb-8">
          <p className="text-white text-4xl md:text-5xl font-black mb-4">
            {project.name}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {project.profiles && (
              <Link
                to={`/profile/${project.profiles.wallet_address}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
              >
                <img
                  className="w-10 h-10 object-cover rounded-full border-2 border-transparent group-hover:border-primary transition-colors"
                  alt="Creator avatar"
                  src={project.profiles.avatar_url || 'https://via.placeholder.com/40'}
                />
                <div>
                  <p className="text-zinc-400 text-sm">Created by</p>
                  <p className="text-white font-bold group-hover:text-primary transition-colors">{project.profiles.username || 'Anonymous'}</p>
                </div>
              </Link>
            )}
            {!project.profiles && (
              <div className="flex items-center gap-2">
                <img
                  className="w-10 h-10 object-cover rounded-full border-2 border-zinc-700"
                  alt="Creator avatar"
                  src="https://via.placeholder.com/40"
                />
                <div>
                  <p className="text-zinc-400 text-sm">Created by</p>
                  <p className="text-zinc-500 font-bold">Anonymous</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <RefreshCw className="text-primary" />
              <span className="text-white">{project.revival_count} Revivals</span>
            </div>
            <p className="text-zinc-400 text-sm">
              {project.category} | {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-zinc-gray text-zinc-gray px-4 py-2 hover:bg-zinc/20 hover:text-primary transition-colors"
            >
              <Code className="w-5 h-5" />
              <span>View Repository</span>
            </a>
          )}
          {/* <Link
            to={`/projects/${projectId}/revivals`}
            className="inline-flex items-center gap-2 border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-black transition-colors font-bold"
          >
            <GitBranch className="w-5 h-5" />
            <span>View Bloodline</span>
          </Link> */}
          {isConnected && (
            <ReviveButton project={project} />
          )}
        </div>

        <div className="mb-8">
          <p className="text-zinc-gray text-base leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="border border-zinc-gray p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white text-2xl font-bold">{project.revival_count} Revivals</p>
              <p className="text-zinc-gray">This project has been revived by the community.</p>
            </div>
            <Link
              to={`/projects/${project.id}/revivals`}
              className="bg-zinc-gray text-black px-4 py-2 font-bold hover:bg-zinc-gray/80 transition-colors"
            >
              View All Revivals
            </Link>
          </div>
        </div>

        

        <CommentSection projectId={project.id} initialCount={project.comment_count} />
      </div>
    </div>
  );
}
