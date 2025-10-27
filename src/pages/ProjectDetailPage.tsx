import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Code, Flame } from 'lucide-react';
import { projectService } from '../services/projectService';
import { Project } from '../lib/supabase';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

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
        <div className="mb-8">
          <p className="text-white text-4xl md:text-5xl font-black mb-4">
            {project.name}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {project.profiles && (
              <div className="flex items-center gap-2">
                <img
                  className="w-10 h-10 object-cover"
                  alt="Creator avatar"
                  src={project.profiles.avatar_url || 'https://via.placeholder.com/40'}
                />
                <div>
                  <p className="text-zinc-400 text-sm">Created by</p>
                  <p className="text-white font-bold">{project.profiles.username}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Flame className="text-primary" />
              <span className="text-white">{project.blessing_count} Blessings</span>
            </div>
            <p className="text-zinc-400 text-sm">
              {project.category} | {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {project.repo_url && (
          <div className="mb-6">
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-zinc-gray text-zinc-gray px-4 py-2 hover:bg-zinc/20 hover:text-primary transition-colors"
            >
              <Code className="w-5 h-5" />
              <span>View Repository</span>
            </a>
          </div>
        )}

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

        <div className="flex justify-center mb-8">
          <Link
            to={`/projects/${project.id}/revivals`}
            className="bg-primary text-black px-8 py-3 text-lg font-bold hover:bg-primary/80 transition-colors"
          >
            ✨ Revive This Project
          </Link>
        </div>
      </div>
    </div>
  );
}
