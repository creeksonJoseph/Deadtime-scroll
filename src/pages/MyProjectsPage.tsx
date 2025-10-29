import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Users, Heart } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { projectService } from '../services/projectService';
import { Project } from '../lib/supabase';

export default function MyProjectsPage() {
  const { profile } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadProjects();
    }
  }, [profile?.id]);

  const loadProjects = async () => {
    if (!profile?.id) return;
    
    try {
      const userProjects = await projectService.getByUser(profile.id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Please connect your wallet to view your projects</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Loading your projects...</p>
      </div>
    );
  }

  return (
    <div className="bg-background-dark min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-primary text-4xl font-black">My Projects</h1>
          <Link
            to="/submit"
            className="bg-primary text-black px-6 py-3 font-bold hover:bg-primary/80 transition-colors"
          >
            Submit New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
            <p className="text-zinc-400 mb-6">
              You haven't submitted any projects yet. Share your abandoned projects with the community!
            </p>
            <Link
              to="/submit"
              className="inline-block bg-primary text-black px-8 py-3 font-bold hover:bg-primary/80 transition-colors"
            >
              Submit Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                  <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                    {project.category}
                  </span>
                </div>

                <p className="text-zinc-400 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {project.revival_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {project.blessing_count || 0}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}