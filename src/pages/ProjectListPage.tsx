import { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { Project } from '../lib/supabase';

const categories = ['All', 'Music', 'Gaming', 'Tech', 'Art', 'Education', 'Finance'];

export default function ProjectListPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [selectedCategory, searchQuery]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll(
        selectedCategory === 'All' ? undefined : selectedCategory,
        searchQuery || undefined
      );
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="w-full bg-[#000000] border border-zinc-500 text-white placeholder-zinc-400 pl-12 pr-4 py-3 focus:outline-none focus:border-[#00ff90]"
              placeholder="Search for abandoned projects..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-6 py-2 font-bold whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-[#00ff90] text-black'
                  : 'bg-transparent border border-zinc-500 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-xl">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 border border-zinc-500">
            <p className="text-zinc-400 text-xl">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#000000] border border-zinc-500 p-6 flex flex-col justify-between hover:border-[#00ff90] hover:shadow-[0_0_15px_rgba(0,255,144,0.5)] transition-all duration-300"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm bg-zinc-800 text-zinc-400 inline-block px-3 py-1 mb-2">
                        {project.category}
                      </p>
                      <h2 className="text-2xl font-bold text-white">
                        {project.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <RefreshCw className="text-[#00ff90] w-5 h-5" />
                      <span className="font-semibold">{project.revival_count}</span>
                    </div>
                  </div>
                  <p className="text-zinc-400 mb-6 line-clamp-3">{project.description}</p>
                </div>
                <div className="border-t border-zinc-700 pt-4">
                  {project.profiles && (
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        className="w-8 h-8 object-cover"
                        alt="User avatar"
                        src={project.profiles.avatar_url || 'https://via.placeholder.com/32'}
                      />
                      <div>
                        <p className="font-bold text-sm text-zinc-300">
                          {project.profiles.username}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {project.revival_count} revival{project.revival_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  <Link
                    to={`/projects/${project.id}`}
                    className="w-full bg-transparent border border-zinc-500 text-zinc-300 py-2 mt-4 hover:bg-[#00ff90] hover:text-black hover:border-[#00ff90] font-bold transition-colors block text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
