import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { bloodlineService, BloodlineNode } from '../services/bloodlineService';
import BloodlineNetwork from '../components/BloodlineNetwork';

export default function BloodlinePage() {
  const { revivalId } = useParams();
  const [allNodes, setAllNodes] = useState<BloodlineNode[]>([]);
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
      const allNodes = [...tree.ancestors, tree.current, ...tree.descendants].filter(Boolean) as BloodlineNode[];
      setAllNodes(allNodes);
      setCurrent(tree.current);
    } catch (error) {
      console.error('Error loading bloodline:', error);
    } finally {
      setLoading(false);
    }
  };


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

  const totalNodes = allNodes.length;

  return (
    <div className="bg-background-dark min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GitBranch className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-black text-white">Revival Network</h1>
          </div>
          <p className="text-zinc-400 text-lg">
            Explore the evolution network across {totalNodes} revival{totalNodes !== 1 ? 's' : ''}
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

        <BloodlineNetwork nodes={allNodes} currentNodeId={revivalId!} />

        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            About Revival Networks
          </h3>
          <p className="text-zinc-300 mb-3">
            The Revival Network visualizes the complete evolution chain as an interactive blockchain-like network. Each node represents a revival, and connections show how ideas evolved and branched.
          </p>
          <ul className="list-disc list-inside text-zinc-400 space-y-2">
            <li>
              <strong className="text-white">Physics-Based Layout:</strong> Nodes naturally organize based on their connections
            </li>
            <li>
              <strong className="text-white">Interactive:</strong> Click any node to view detailed information
            </li>
            <li>
              <strong className="text-white">Evolution Chains:</strong> Lines connect parent revivals to their descendants
            </li>
            <li>
              <strong className="text-white">Depth Indicator:</strong> Each node shows its depth in the evolution tree
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
