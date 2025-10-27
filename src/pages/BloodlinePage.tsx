import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GitBranch, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { bloodlineService, BloodlineNode } from '../services/bloodlineService';

export default function BloodlinePage() {
  const { revivalId } = useParams();
  const [ancestors, setAncestors] = useState<BloodlineNode[]>([]);
  const [descendants, setDescendants] = useState<BloodlineNode[]>([]);
  const [current, setCurrent] = useState<BloodlineNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (revivalId) {
      loadBloodline();
    }
  }, [revivalId]);

  const loadBloodline = async () => {
    try {
      setLoading(true);
      const tree = await bloodlineService.getCompleteTree(revivalId!);
      setAncestors(tree.ancestors);
      setDescendants(tree.descendants);
      setCurrent(tree.current);
    } catch (error) {
      console.error('Error loading bloodline:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNode = (node: BloodlineNode, isCurrent: boolean = false) => (
    <div
      key={node.id}
      className={`
        relative group
        ${isCurrent ? 'scale-110' : 'scale-100'}
        transition-all duration-500 hover:scale-105
      `}
    >
      <Link to={`/revivals/${node.id}`}>
        <div
          className={`
            relative overflow-hidden rounded-lg border-2
            ${
              isCurrent
                ? 'border-primary bg-gradient-to-br from-primary/20 to-cyan-500/20 shadow-lg shadow-primary/50'
                : 'border-zinc-700 bg-zinc-900 hover:border-primary/50'
            }
            p-6 min-w-[280px] max-w-[320px]
            transform transition-all duration-300
          `}
        >
          {isCurrent && (
            <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
              CURRENT
            </div>
          )}

          <div className="flex items-start gap-3 mb-3">
            <img
              src={node.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
              alt={node.username}
              className="w-12 h-12 rounded-full border-2 border-primary object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg truncate">{node.title}</h3>
              <p className="text-zinc-400 text-sm">by @{node.username}</p>
            </div>
          </div>

          <p className="text-zinc-300 text-sm line-clamp-2 mb-3">{node.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold">{node.blessing_count}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Depth {node.depth}</span>
            </div>
          </div>

          {(node.github_url || node.deployed_url) && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
              {node.github_url && (
                <a
                  href={node.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Code
                </a>
              )}
              {node.deployed_url && (
                <a
                  href={node.deployed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Live
                </a>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );

  const renderConnector = (index: number, isVertical: boolean = false) => (
    <div
      key={`connector-${index}`}
      className={`
        flex items-center justify-center
        ${isVertical ? 'my-4' : 'mx-4'}
        animate-pulse
      `}
    >
      <div
        className={`
          ${isVertical ? 'w-0.5 h-12' : 'h-0.5 w-12'}
          bg-gradient-to-${isVertical ? 'b' : 'r'} from-primary via-cyan-500 to-primary
          relative
        `}
      >
        <div
          className={`
            absolute ${isVertical ? 'left-1/2 top-1/2 -translate-x-1/2' : 'top-1/2 left-1/2 -translate-y-1/2'}
          `}
        >
          <ArrowRight
            className={`w-4 h-4 text-primary ${isVertical ? 'rotate-90' : ''}`}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-center">
          <GitBranch className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-400 text-xl">Loading bloodline...</p>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <p className="text-zinc-400 text-xl">Revival not found</p>
      </div>
    );
  }

  const totalNodes = ancestors.length + descendants.length + 1;

  return (
    <div className="bg-background-dark min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GitBranch className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-black text-white">Revival Bloodline</h1>
          </div>
          <p className="text-zinc-400 text-lg">
            Explore the evolution of ideas across {totalNodes} revival{totalNodes !== 1 ? 's' : ''}
          </p>
          {current.project_id && (
            <Link
              to={`/projects/${current.project_id}`}
              className="inline-block mt-4 text-primary hover:text-cyan-400 transition-colors"
            >
              View Original Project →
            </Link>
          )}
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-cyan-500/20 to-primary/20 -translate-x-1/2 hidden lg:block" />

          <div className="flex flex-col items-center space-y-8">
            {ancestors.length > 0 && (
              <>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Ancestors</h2>
                  <p className="text-zinc-500 text-sm">Origins of this revival chain</p>
                </div>

                {ancestors.map((node, index) => (
                  <div key={node.id} className="flex flex-col items-center">
                    {renderNode(node)}
                    {index < ancestors.length - 1 && renderConnector(index, true)}
                  </div>
                ))}
                {renderConnector(ancestors.length, true)}
              </>
            )}

            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl" />
              {renderNode(current, true)}
            </div>

            {descendants.length > 0 && (
              <>
                {renderConnector(0, true)}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Descendants</h2>
                  <p className="text-zinc-500 text-sm">Revivals built upon this one</p>
                </div>

                {descendants.map((node, index) => (
                  <div key={node.id} className="flex flex-col items-center">
                    {index > 0 && renderConnector(index, true)}
                    {renderNode(node)}
                  </div>
                ))}
              </>
            )}
          </div>

          {totalNodes === 1 && (
            <div className="mt-12 text-center py-12 border-2 border-dashed border-zinc-800 rounded-lg">
              <GitBranch className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">Start the Chain!</h3>
              <p className="text-zinc-400 mb-4">
                This revival has no ancestors or descendants yet.
              </p>
              <p className="text-zinc-500 text-sm">
                Be the first to build upon this work or revive it further!
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            About Revival Bloodlines
          </h3>
          <p className="text-zinc-300 mb-3">
            The Revival Bloodline shows the complete evolution chain of a project. Each revival builds
            upon the previous work, creating a tree of innovation similar to blockchain nodes.
          </p>
          <ul className="list-disc list-inside text-zinc-400 space-y-2">
            <li>
              <strong className="text-white">Ancestors:</strong> The revivals that came before
            </li>
            <li>
              <strong className="text-white">Current:</strong> The revival you're viewing
            </li>
            <li>
              <strong className="text-white">Descendants:</strong> Revivals that built upon this one
            </li>
            <li>
              <strong className="text-white">Depth:</strong> How many levels deep in the tree
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
